import skygear
from marshmallow import Schema
from marshmallow import fields
from skygear.asset import get_signer
from sqlalchemy import not_

from ..db_session import scoped_session
from ..models.asset import Asset
from ..models.imported_file import CmsImportedFile
from ..skygear_utils import validate_master_user

PAGE_SIZE = 25
PAGE = 1


class CmsImportedFileSchema(Schema):
    id = fields.String()
    asset = fields.Method('get_asset', deserialize='load_asset')
    url = fields.String(dump_only=True)
    uploaded_at = fields.DateTime(format="%Y-%m-%d %H:%M:%S", dump_only=True)
    size = fields.Method('get_size')

    def get_asset(self, obj):
        return obj.asset.id

    def load_asset(self, value):
        return str(value)

    def get_size(self, obj):
        return obj.asset.size


def register_lambda(settings):
    @skygear.op("imported_file:get_all", user_required=True)
    def get_imported_file(**kwargs):
        validate_master_user()
        page_size = kwargs.get('perPage', PAGE_SIZE)
        page = kwargs.get('page', PAGE)
        is_ascending = kwargs.get('isAscending', False)
        sort_by_name = kwargs.get('sortByName', 'uploaded_at')
        filter = kwargs.get('filter')

        with scoped_session() as session:
            total_count = session.query(CmsImportedFile).count()
            query = session.query(CmsImportedFile) \
                .join(CmsImportedFile.asset)
            query = apply_filters(query, filter)
            query = query.order_by(get_order_by(sort_by_name, is_ascending)) \
                .limit(page_size) \
                .offset(page_size * (page - 1))
            result = query.all()
            files = CmsImportedFileSchema(many=True).dump(result)
            inject_signed_url(files)
            return {
                'importedFiles': files,
                'totalCount': total_count,
            }

    @skygear.op("imported_file:create", user_required=True)
    def create_imported_file(**kwargs):
        validate_master_user()
        new_imported_files = kwargs['importedFiles']
        schema = CmsImportedFileSchema(many=True)
        new_imported_files = schema.load(new_imported_files)

        with scoped_session() as session:
            ensure_unique_file_name(session, new_imported_files)
            imported_files = []
            for file in new_imported_files:
                file = CmsImportedFile.from_dict(file)
                session.add(file)
                imported_files.append(file)

            # apply the update
            session.flush()

            files = CmsImportedFileSchema(many=True).dump(imported_files)
            inject_signed_url(files)
            return {'importedFiles': files}


def get_col_by_name(name):
    if name == 'id':
        return CmsImportedFile.id
    elif name == 'uploaded_at':
        return CmsImportedFile.uploaded_at
    elif name == 'size':
        return Asset.size
    else:
        raise Exception('Unexpected field name: {}'.format(name))


def get_filter_func(name, query, value):
    col = get_col_by_name(name)
    if query == 'EqualTo':
        return col == value
    elif query == 'NotEqualTo':
        return col != value
    elif query == 'Contain':
        return col.ilike(value)
    elif query == 'NotContain':
        return not_(col.ilike(value))
    elif query == 'Before' or query == 'LessThan':
        return col < value
    elif query == 'After' or query == 'GreaterThan':
        return col > value
    elif query == 'LessThanOrEqualTo':
        return col <= value
    elif query == 'GreaterThanOrEqualTo':
        return col >= value
    else:
        raise Exception('Unexpected query type: {}', format(query))


def get_order_by(name, is_ascending):
    col = get_col_by_name(name)
    return col.asc() if is_ascending else col.desc()


def apply_filters(query, filters):
    for filter in filters:
        query = query.filter(get_filter_func(**filter))

    return query


def inject_signed_url(files):
    signer = get_signer()
    for file in files:
        file['url'] = signer.sign(file['asset'])


def ensure_unique_file_name(session, files):
    duplicated_files = session.query(CmsImportedFile) \
        .filter(CmsImportedFile.id.in_([f['id'] for f in files])) \
        .all()
    duplicated_names = [f.id for f in duplicated_files]

    if len(duplicated_names) > 0:
        raise DuplicatedFileException(duplicated_names)


class DuplicatedFileException(Exception):
    def __init__(self, duplicated_names):
        message = 'File name ({}) existed already.'.format(
            ', '.join(duplicated_names))
        super(DuplicatedFileException, self).__init__(message)
