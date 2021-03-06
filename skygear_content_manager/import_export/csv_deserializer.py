import json
import re

import arrow
import strict_rfc3339


class RecordDeserializer:

    # field_configs: []CMSRecordImportField
    def __init__(self, field_configs):
        self.field_configs = field_configs

    def deserialize(self, data):
        result = {}
        for field_config in self.field_configs:
            key = field_config.name
            value = data.get(key)

            deserializer = FieldDeserializer(field_config)
            result[key] = deserializer.deserialize(value)

        return result


class FieldDeserializer:
    def __init__(self, field_config):
        self.field_config = field_config

    def deserialize(self, value):
        deserializer = self.get_deserializer()

        if not deserializer:
            field_name = self.field_config.name \
                         if not self.field_config.reference \
                         else self.field_config.reference.field_name

            raise Exception(
                ('field "{}" has unsupported field type "{}"').format(
                    field_name, self.field_config.type))

        return deserializer.deserialize(value)

    def get_deserializer(self):  # noqa
        if self.field_config.name == '_id':
            return IDDeserializer(self.field_config.record_type)

        deserializer = None

        if self.field_config.reference:
            deserializer = ReferenceDeserializer()
        elif self.field_config.type == 'string':
            deserializer = StringDeserializer()
        elif self.field_config.type == 'number':
            deserializer = NumberDeserializer()
        elif self.field_config.type == 'boolean':
            deserializer = BooleanDeserializer()
        elif self.field_config.type == 'json':
            deserializer = JSONDeserializer()
        elif self.field_config.type == 'location':
            deserializer = LocationDeserializer()
        elif self.field_config.type == 'datetime':
            deserializer = DatetimeDeserializer()
        elif self.field_config.type == 'integer':
            deserializer = IntegerDeserializer()
        elif self.field_config.type == 'asset':
            deserializer = AssetDeserializer()

        return deserializer


class BaseValueDeserializer:
    def deserialize(self, value):
        raise NotImplementedError


class IDDeserializer:
    def __init__(self, record_type):
        super().__init__()
        self.record_type = record_type

    def deserialize(self, value):
        # Backward compatibility
        # To handle the case that the input is record_type/record_id
        id_prefix = self.record_type + '/'
        if value[:len(id_prefix)] != id_prefix:
            return self.record_type + '/' + value

        return value


class ReferenceDeserializer(BaseValueDeserializer):
    def deserialize(self, value):
        if value == '' or value is None:
            return None

        return {'$type': 'ref', '$id': value}


class StringDeserializer(BaseValueDeserializer):
    def deserialize(self, value):
        return value


class NumberDeserializer(BaseValueDeserializer):
    def deserialize(self, value):
        if value == '':
            return None

        return float(value)


class BooleanDeserializer(BaseValueDeserializer):
    def deserialize(self, value):
        truthy = ['True', 'T', '1']
        falsy = ['False', 'F', '0']

        if value in truthy:
            return True
        elif value in falsy:
            return False
        elif value == '':
            return None

        raise ValueError('unknown boolean value "{}"'.format(value))


class JSONDeserializer(BaseValueDeserializer):
    def deserialize(self, value):
        if value == '':
            return None

        return json.loads(value)


class LocationDeserializer(BaseValueDeserializer):
    def deserialize(self, value):
        match = re.match(r'\((.*?),(.*?)\)', value)
        if not match:
            return None

        try:
            return {
                '$type': 'geo',
                '$lng': float(match.group(2)),
                '$lat': float(match.group(1)),
            }
        except Exception:
            return None


class DatetimeDeserializer(BaseValueDeserializer):
    def deserialize(self, value):
        dt = None
        try:
            ts = arrow.get(value).timestamp
            dt = {
                '$type': 'date',
                '$date': strict_rfc3339.timestamp_to_rfc3339_utcoffset(ts),
            }
        except Exception:
            return None

        return dt


class IntegerDeserializer(BaseValueDeserializer):
    def deserialize(self, value):
        if value == '':
            return None

        return int(value)


class AssetDeserializer(BaseValueDeserializer):
    def deserialize(self, value):
        if value is None or value == '':
            return None

        return {
            '$type': 'asset',
            '$name': value,
        }
