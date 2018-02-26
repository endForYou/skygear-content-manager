import csv

from .csv_deserializer import RecordDeserializer
from ..skygear_utils import fetch_records, eq_predicate, or_predicate


class RecordIdentifierMap:
    """
    A custom identifier to record id mapping.
    """

    backup = {}

    def __init__(self):
        self.backup = {}

    def get(self, record_type, key, value):
        if key == '_id':
            return '{}/{}'.format(record_type, value)

        mapping_key_for_keypath = '{}.{}'.format(record_type, key)
        mapping = self.backup.get(mapping_key_for_keypath)
        if not mapping:
            return None

        return mapping.get(value)

    def set(self, record_type, key, value, record_id):
        if key == '_id':
            return

        mapping_key_for_keypath = '{}.{}'.format(record_type, key)
        mapping = self.backup.get(mapping_key_for_keypath)
        if not mapping:
            mapping = {}
            self.backup[mapping_key_for_keypath] = mapping

        mapping[value] = record_id


def prepare_import_records(stream, import_config):
    data_list = []
    reader = csv.reader(stream)

    for row in reader:
        data = project_csv_data(row, import_config)
        data_list.append(data)

    identifier_map = create_identifier_map(data_list, import_config)

    populate_record_id(data_list, import_config, identifier_map)
    populate_record_reference(data_list, import_config, identifier_map)

    deserializer = RecordDeserializer(import_config.fields)
    records = deserialize_record_data(data_list, deserializer)

    for record in records:
        if not record['_id']:
            record['_id'] = str(uuid.uuid4())

        id_prefix = import_config.record_type + '/'
        if record['_id'][:len(id_prefix)] != id_prefix:
            record['_id'] = '{}{}'.format(id_prefix, record['_id'])

    return records


def project_csv_data(row, import_config):
    return {import_config.fields[i].name: row[i]
            for i in range(len(import_config.fields))}


def create_identifier_map(data_list, import_config):
    """
    Construct a custom-identifier-to-skygear-record-id mapping.

    - Find record custom identifier and reference custom identifier.
    - Query record by custom identifier.
    - Map the queried record id to custom identifier value.
    """
    identifier_map = RecordIdentifierMap()
    reference_fields = import_config.get_reference_fields()

    # for record custom id
    if import_config.identifier != '_id':
        record_type = import_config.record_type
        key = import_config.identifier
        values = [r[key] for r in data_list]
        for record in fetch_records_by_values_in_key(record_type, key, values):
            identifier_map.set(
                record_type=record_type,
                key=key,
                value=record[key],
                record_id=record['_id']
            )

    # for reference id
    for reference_field in reference_fields:
        reference = reference_field.reference
        record_type = reference.target
        key = reference.field_name
        values = [r[reference_field.name] for r in data_list]
        for record in fetch_records_by_values_in_key(record_type, key, values):
            identifier_map.set(
                record_type=record_type,
                key=key,
                value=record[key],
                record_id=record['_id']
            )

    return identifier_map


def populate_record_reference(data_list, import_config, identifier_map):
    """
    For each reference field, find and assign reference id from identifier map.
    """
    reference_fields = import_config.get_reference_fields()
    for data in data_list:
        # merge data with reference
        for reference_field in reference_fields:
            reference = reference_field.reference
            data[reference_field.name] = identifier_map.get(
                record_type=reference.target,
                key=reference.field_name,
                value=data[reference_field.name]
            )


def populate_record_id(data_list, import_config, identifier_map):
    """
    If import config use custom identifier, find and assign record id from
    identifier map.
    """
    record_type = import_config.record_type
    for data in data_list:
        if import_config.identifier != '_id':
            data['_id'] = identifier_map.get(
                record_type=record_type,
                key=import_config.identifier,
                value=data[import_config.identifier]
            )


def deserialize_record_data(data_list, deserializer):
    records = []
    for data in data_list:
        record = deserializer.deserialize(data)

        # record id does not exist in record if using custom identifier
        record['_id'] = data['_id']
        records.append(record)

    return records


def fetch_records_by_values_in_key(record_type, key, values):
    value_predicates = [eq_predicate(key, v) for v in values]
    predicate = or_predicate(value_predicates)
    return fetch_records(record_type, predicate)
