import csv
import uuid

from skygear.error import SkygearException

from ..db_session import scoped_session
from ..models.asset import Asset
from ..models.cms_config import DUPLICATION_HANDLING_USE_FIRST
from ..models.imported_file import CmsImportedFile
from ..record_utils import fetch_records_by_values_in_key
from ..skygear_utils import save_records
from .csv_deserializer import RecordDeserializer


class RecordIdentifierMap:
    """
    A custom identifier to record id mapping.

    If allow_duplicate_value is False, error is thrown when getting record_id
    of a certain value.
    """

    def __init__(self, allow_duplicate_value=True):
        self.backup = {}
        self.allow_duplicate_value = allow_duplicate_value

    def get(self, record_type, key, value):
        if key == '_id':
            return '{}/{}'.format(record_type, value)

        mapping_key_for_keypath = '{}.{}'.format(record_type, key)
        mapping = self.backup.get(mapping_key_for_keypath)
        if not mapping:
            return None

        record_ids = mapping.get(value)
        if not record_ids or len(record_ids) == 0:
            return None

        if len(record_ids) > 1 and not self.allow_duplicate_value:
            raise (DuplicateIdentifierValueException(record_type, key, value))

        return record_ids[0]

    def set(self, record_type, key, value, record_id):
        if key == '_id':
            return

        mapping_key_for_keypath = '{}.{}'.format(record_type, key)
        mapping = self.backup.get(mapping_key_for_keypath)
        if not mapping:
            mapping = {}
            self.backup[mapping_key_for_keypath] = mapping

        record_ids = mapping.get(value)
        if not record_ids:
            record_ids = []
            mapping[value] = record_ids

        record_ids.append(record_id)


class ImportRecordException(SkygearException):
    def __init__(self, record_data, underlying_error):
        message = str(underlying_error)
        super(ImportRecordException, self).__init__(message)

        self.record_data = record_data
        self.underlying_error = underlying_error

    @classmethod
    def error_code_for_exception(cls, e):
        if isinstance(e, DuplicateIdentifierValueException):
            return 109
        elif isinstance(e, AssetNotFoundException):
            return 110

        return 10000

    def to_dict(self):
        return {
            '_id': self.record_data.get('_id'),
            '_type': 'error',
            'code': self.error_code_for_exception(self.underlying_error),
            'message': str(self.underlying_error),
            'name': self.underlying_error.__class__.__name__,
        }

    def as_dict(self):
        return self.to_dict()


class DuplicateIdentifierValueException(Exception):
    def __init__(self, record_type, key, value):
        message = 'duplicate identifier value for "{}.{} == {}"' \
                  .format(record_type, key, value)
        super(DuplicateIdentifierValueException, self).__init__(message)


class AssetNotFoundException(Exception):
    def __init__(self, filename):
        message = '"{}" not found in imported file or asset'.format(filename)
        super(AssetNotFoundException, self).__init__(message)


class ColumnNotFoundException(Exception):
    def __init__(self, column_name):
        message = 'field "{}" not found in the csv header'.format(column_name)
        super(ColumnNotFoundException, self).__init__(message)


def prepare_import_records(stream, import_config, atomic):
    reader = csv.reader(stream)
    header = next(reader)

    column_mapping = find_column_mapping(header, import_config)

    data_list = []
    for row in reader:
        data = project_csv_data(row, column_mapping)
        data_list.append(data)

    identifier_map = RecordIdentifierMap()
    if import_config.identifier is not None and \
       import_config.identifier != '_id':
        identifier_map = create_identifier_map(
            [r[import_config.identifier] for r in data_list],
            import_config.record_type, import_config.identifier,
            import_config.handle_duplicated_identifier)

    reference_fields = import_config.get_reference_fields()
    reference_identifier_maps = {}
    for reference_field in reference_fields:
        reference = reference_field.reference
        m = create_identifier_map([r[reference_field.name] for r in data_list],
                                  reference.target_cms_record.record_type,
                                  reference.target_fields[0].name,
                                  reference_field.handle_duplicated_reference)
        reference_identifier_maps[reference_field.name] = m

    data_list = populate_record_id(data_list, import_config, identifier_map)
    data_list = populate_record_reference(data_list, import_config,
                                          reference_identifier_maps)
    data_list = inject_asset(data_list, import_config)

    deserializer = RecordDeserializer(import_config.fields)
    records = deserialize_record_data(data_list, deserializer)

    for record in records:
        if isinstance(record, ImportRecordException):
            # fail early if the import is atomic
            if atomic:
                raise record

            # conitnue if import is not atomic
            continue

        if not record['_id']:
            record['_id'] = str(uuid.uuid4())

        id_prefix = import_config.record_type + '/'
        if record['_id'][:len(id_prefix)] != id_prefix:
            record['_id'] = '{}{}'.format(id_prefix, record['_id'])

    return records


def import_records(records, atomic):
    """
    Extract non-record data from the list and save.
    """
    index_mappings = []
    for i in range(len(records)):
        if isinstance(records[i], ImportRecordException):
            index_mappings.append((i, records[i]))

    for item in reversed(index_mappings):
        records.pop(item[0])

    resp = {'result': []}
    if len(records) > 0:
        resp['result'] = save_records(records, atomic=atomic)

    success_count = 0
    error_count = 0
    result = resp['result']
    for item in index_mappings:
        index = item[0]
        value = item[1]
        result.insert(index, value.to_dict())

    for item in result:
        if item['_type'] == 'record':
            success_count = success_count + 1
        else:
            error_count = error_count + 1

    resp['success_count'] = success_count
    resp['error_count'] = error_count

    return resp


def find_column_mapping(header, import_config):
    """
    Return a column mapping [column_index:field_name].
    Throw error if column name not found in header.
    """
    mapping = {}
    for field in import_config.fields:
        name = field.label or field.name
        try:
            index = header.index(name)
            mapping[index] = field.name
        except ValueError:
            raise ColumnNotFoundException(name)

    return mapping


def project_csv_data(row, column_mapping):
    return {
        field_name: row[index]
        for index, field_name in column_mapping.items()
    }


def create_identifier_map(values, record_type, key, duplication_handling):
    identifier_map = RecordIdentifierMap(
        allow_duplicate_value=duplication_handling ==
        DUPLICATION_HANDLING_USE_FIRST)

    records = fetch_records_by_values_in_key(record_type, key, values)
    for record in records:
        identifier_map.set(
            record_type=record_type,
            key=key,
            value=record[key],
            record_id=record['_id'])

    return identifier_map


def populate_record_reference(data_list, import_config, identifier_maps):
    """
    For each reference field, find and assign reference id from identifier map.
    """
    result = []
    reference_fields = import_config.get_reference_fields()
    for data in data_list:
        if isinstance(data, ImportRecordException):
            result.append(data)
            continue

        try:
            # merge data with reference
            for reference_field in reference_fields:
                identifier_map = identifier_maps[reference_field.name]
                reference = reference_field.reference
                target_fields = reference.target_fields
                for field in target_fields:
                    data[reference_field.name] = identifier_map.get(
                        record_type=reference.target_cms_record.record_type,
                        key=field.name,
                        value=data[reference_field.name])
            result.append(data)
        except Exception as e:
            result.append(ImportRecordException(data, e))

    return result


def populate_record_id(data_list, import_config, identifier_map):
    """
    If import config use custom identifier, find and assign record id from
    identifier map.
    """
    result = []
    record_type = import_config.record_type
    for data in data_list:
        if isinstance(data, ImportRecordException):
            result.append(data)
            continue

        if import_config.identifier is None:
            """
            Always create new record if identifier not specified
            """
            result.append(data)
            continue

        if import_config.identifier == '_id':
            """
            No need to map id if identifier is skygear id field
            """
            result.append(data)
            continue

        try:
            data['_id'] = identifier_map.get(
                record_type=record_type,
                key=import_config.identifier,
                value=data[import_config.identifier])
            result.append(data)
        except Exception as e:
            result.append(ImportRecordException(data, e))

    return result


def deserialize_record_data(data_list, deserializer):
    records = []
    for data in data_list:
        if isinstance(data, ImportRecordException):
            records.append(data)
            continue

        record = deserializer.deserialize(data)

        # record id does not exist in record if using custom identifier
        record['_id'] = data.get('_id')
        records.append(record)

    return records


def inject_asset(data_list, import_config):
    asset_fields = [f for f in import_config.fields if f.type == 'asset']
    files = find_files_in_record_data(data_list, asset_fields)
    with scoped_session() as session:
        assets_map = {}
        file_assets = session.query(CmsImportedFile) \
            .filter(CmsImportedFile.id.in_(files)) \
            .all()
        for file_asset in file_assets:
            assets_map[file_asset.id] = file_asset.asset

        assets = session.query(Asset) \
            .filter(Asset.id.in_(files)) \
            .all()
        for asset in assets:
            assets_map[asset.id] = asset

        return replace_assets_in_record_data(data_list, asset_fields,
                                             assets_map)


def find_files_in_record_data(data_list, fields):
    file_ids = set()
    for data in data_list:
        for field in fields:
            file_ids.add(data[field.name])

    return file_ids


def replace_assets_in_record_data(data_list, fields, file_assets):
    result = []
    for data in data_list:
        try:
            for field in fields:
                file_id = data[field.name]
                asset = file_assets.get(file_id)
                if asset is None:
                    raise AssetNotFoundException(file_id)

                data[field.name] = asset.id

            result.append(data)
        except Exception as e:
            result.append(ImportRecordException(data, e))

    return result
