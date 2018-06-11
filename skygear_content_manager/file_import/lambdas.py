import skygear
from sqlalchemy.exc import IntegrityError

from marshmallow import Schema, fields
from skygear.asset import get_signer

from ..models.imported_file import CmsImportedFile

from ..db_session import scoped_session
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
        with scoped_session() as session:
            total_count = session.query(CmsImportedFile).count()
            query = session.query(CmsImportedFile) \
                .limit(page_size) \
                .offset(page_size * (page - 1))
            result = query.all()
            files = CmsImportedFileSchema(many=True).dump(result).data
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
        new_imported_files, errors = schema.load(new_imported_files)
        if len(errors) > 0:
            return {'errors': errors}

        with scoped_session() as session:
            ensure_unique_file_name(session, new_imported_files)
            imported_files = []
            for file in new_imported_files:
                file = CmsImportedFile.from_dict(file)
                session.add(file)
                imported_files.append(file)

            # apply the update
            session.flush()

            files = CmsImportedFileSchema(many=True).dump(imported_files).data
            inject_signed_url(files)
            return {'importedFiles': files}


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
        message = 'File name ({}) existed already.'.format(', '.join(duplicated_names))
        super(DuplicatedFileException, self).__init__(message)
