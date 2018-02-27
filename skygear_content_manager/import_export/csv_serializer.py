import json

class RecordSerializer:

    field_configs = []

    # field_configs: []CMSRecordExportField
    def __init__(self, field_configs):
        self.field_configs = field_configs

    def serialize(self, record):
        result = {}
        for field_config in self.field_configs:
            key = field_config.name
            value = None

            if field_config.reference:
                reference = field_config.reference
                transient = record['_transient'].get(reference.name)
                if isinstance(transient, list):
                    value = [t.get(reference.field_name) for t in transient]
                elif transient != None:
                    value = transient.get(reference.field_name)
            else:
                value = record.get(key)

            serializer = FieldSerializer(field_config)
            result[field_config.label] = serializer.serialize(value)

        return result


class FieldSerializer:

    field_config = None

    def __init__(self, field_config):
        self.field_config = field_config

    def serialize(self, value):
        if value == None:
            return ''

        serializer = None
        if self.field_config.reference and \
           self.field_config.reference.is_many and \
           isinstance(value, list):
            serializer = ListSerializer()
            serializer.field_serializer = self
        elif self.field_config.type == 'string':
            serializer = StringSerializer()
        elif self.field_config.type == 'boolean':
            serializer = BooleanSerializer()
        elif self.field_config.type == 'json':
            serializer = JSONSerializer()
        elif self.field_config.type == 'location':
            serializer = LocationSerializer()

        if not serializer:
            serializer = StringSerializer()

        return serializer.serialize(value)


class BaseValueSerializer:

    format = ''

    def __init__(self, format=None):
        self.format = format or self.default_format

    @property
    def default_format(self):
        return None

    def serialize(self, value):
        raise NotImplementedError


class ListSerializer(BaseValueSerializer):

    field_serializer = None

    def serialize(self, value):
        value = [self.field_serializer.serialize(v) for v in value]
        value = [v.replace("'", "\\'") for v in value]
        value = ["'" + v + "'" for v in value]
        value = ','.join(value)
        return value


class StringSerializer(BaseValueSerializer):

    def serialize(self, value):
        return str(value)


class BooleanSerializer(BaseValueSerializer):

    def __init__(self, format):
        super(BaseValueSerializer, self).__init__(format)

        if format not in self.supported:
            raise Exception('Format "%s" not supported.' % format)

    @property
    def supported_formats(self):
        return [
            'Long',
            'Short',
            'Number',
        ]

    @property
    def default_format(self):
        return self.supported_formats[0]

    def serialize(self, value):
        fn = None
        if self.format == 'Long':
            fn = self.serialize_long
        elif self.format == 'Short':
            fn = self.serialize_short
        else:
            fn = self.serialize_number

        return fn(value)

    def serialize_long(self, value):
        return 'True' if value else 'False'

    def serialize_short(self, value):
        return 'T' if value else 'F'

    def serialize_number(self, value):
        return '1' if value else '0'


class JSONSerializer(BaseValueSerializer):

    def serialize(self, value):
        return json.dumps(value)


class LocationSerializer(BaseValueSerializer):

    def serialize(self, value):
        return '(' + str(value['$lat']) + ',' + str(value['$lng']) + ')'
