from datetime import datetime

import skygear
from marshmallow import Schema
from marshmallow import fields
from skygear.asset import get_signer

from ..db_session import scoped_session
from ..models.asset import Asset
from ..models.imported_file import CmsImportedFile
from ..record_utils import apply_filters
from ..record_utils import get_order_by
from ..skygear_utils import validate_master_user

PAGE_SIZE = 25
PAGE = 1

filter_name_to_col = {
    'id': CmsImportedFile.id,
    'uploaded_at': CmsImportedFile.uploaded_at,
    'size': Asset.size,
}


class CmsImportedFileSchema(Schema):
    id = fields.String()
    asset = fields.Method('get_asset', deserialize='load_asset')
    url = fields.String(dump_only=True)
    uploaded_at = fields.DateTime(format="%Y-%m-%dT%H:%M:%SZ", dump_only=True)
    size = fields.Method('get_size')
    content_type = fields.Method('get_content_type')

    def get_asset(self, obj):
        return obj.asset.id

    def load_asset(self, value):
        return str(value)

    def get_size(self, obj):
        return obj.asset.size

    def get_content_type(self, obj):
        return obj.asset.content_type


def register_lambda(settings):
    @skygear.op("imported_file:get_all", user_required=True)
    def get_imported_file(**kwargs):
        validate_master_user()
        page_size = kwargs.get('perPage', PAGE_SIZE)
        page = kwargs.get('page', PAGE)
        is_ascending = kwargs.get('isAscending', False)
        sort_by_name = kwargs.get('sortByName', 'uploaded_at')
        filter = kwargs.get('filter', [])

        with scoped_session() as session:
            total_count = session.query(CmsImportedFile).count()
            query = session.query(CmsImportedFile) \
                .join(CmsImportedFile.asset)
            query = apply_filters(query, filter, filter_name_to_col)
            order_by = get_order_by(filter_name_to_col, sort_by_name,
                                    is_ascending)
            query = query.order_by(order_by) \
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
        handle_type = kwargs['handleType']
        schema = CmsImportedFileSchema(many=True)
        new_imported_files = schema.load(new_imported_files)

        with scoped_session() as session:
            duplicated_files = ensure_unique_file_name(
                session, new_imported_files, handle_type)
            duplicated_names = [f.id for f in duplicated_files]
            imported_files = []
            for file in new_imported_files:
                file = CmsImportedFile.from_dict(file)
                if file.id in duplicated_names:
                    if handle_type == 'ignore':
                        pass
                    elif handle_type == 'replace':
                        old_file = [
                            f for f in duplicated_files if f.id == file.id
                        ]
                        session.delete(old_file[0])

                        # Need to manually update the uploaded_at.
                        # I guess it's because the id does not change.
                        file.uploaded_at = datetime.now()
                        session.add(file)
                        imported_files.append(file)
                else:
                    session.add(file)
                    imported_files.append(file)

            # apply the update
            session.flush()

            files = CmsImportedFileSchema(many=True).dump(imported_files)
            inject_signed_url(files)
            return {'importedFiles': files}


def inject_signed_url(files):
    signer = get_signer()
    for file in files:
        file['url'] = signer.sign(file['asset'])


def ensure_unique_file_name(session, files, handle_type):
    duplicated_files = session.query(CmsImportedFile) \
        .filter(CmsImportedFile.id.in_([f['id'] for f in files])) \
        .all()
    duplicated_names = [f.id for f in duplicated_files]

    if len(duplicated_names) > 0 and handle_type == 'error':
        raise DuplicatedFileException(duplicated_names)
    return duplicated_files


class DuplicatedFileException(Exception):
    def __init__(self, duplicated_names):
        message = 'File name ({}) existed already.'.format(
            ', '.join(duplicated_names))
        super(DuplicatedFileException, self).__init__(message)
