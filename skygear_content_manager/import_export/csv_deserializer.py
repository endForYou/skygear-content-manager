import json
import re
import skygear


class RecordDeserializer:

    field_configs = []

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

    field_config = None

    def __init__(self, field_config):
        self.field_config = field_config

    def deserialize(self, value):
        deserializer = None
        if self.field_config.type == 'string':
            deserializer = StringDeserializer()
        elif self.field_config.type == 'boolean':
            deserializer = BooleanDeserializer()
        elif self.field_config.type == 'json':
            deserializer = JSONDeserializer()
        elif self.field_config.type == 'location':
            deserializer = LocationDeserializer()
        elif self.field_config.reference:
            deserializer = ReferenceDeserializer()

        if not deserializer:
            deserializer = StringDeserializer()

        return deserializer.deserialize(value)


class BaseValueDeserializer:

    def deserialize(self, value):
        raise NotImplementedError


class ReferenceDeserializer(BaseValueDeserializer):

    def deserialize(self, value):
        if value == '' or value == None:
            return None

        return {
            '$type': 'ref',
            '$id': value
        }


class StringDeserializer(BaseValueDeserializer):

    def deserialize(self, value):
        return value


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
        except:
            return None
