import json

import arrow

from ..models.cms_config import DISPLAY_MODE_GROUPED


# TODO (Steven-Chan):
# Need a better name for this class.
# This is not working on a Record, but an array of record fields.
class RecordSerializer:
    """
    Receives an array of record field value.
    Returns an array of string value, representing a row in csv.
    """

    # field_configs: []CMSRecordExportField
    def __init__(self, field_configs):
        self.field_configs = field_configs

    def walk_through(self, csv_datas):
        """
        Scan through all data to get necessary information for serialization
        e.g. number of transient reference data for reference data padding
        """
        self.serializers = [None] * len(self.field_configs)
        field_counts = [1] * len(self.field_configs)
        record_counts = [1] * len(self.field_configs)

        for data in csv_datas:
            for i in range(0, len(self.field_configs)):
                field_config = self.field_configs[i]
                if not field_config.reference:
                    continue

                field_counts[i] = len(field_config.reference.target_fields)
                if field_config.reference.is_many:
                    record_counts[i] = max(len(data[i]), record_counts[i])

        for i in range(0, len(self.field_configs)):
            self.serializers[i] = FieldSerializer(
                self.field_configs[i], field_counts[i], record_counts[i])

    def serialize(self, csv_data):
        result = []
        for i in range(0, len(self.field_configs)):
            serializer = self.serializers[i]
            value = serializer.serialize(csv_data[i])
            result = result + value

        return result


class FieldSerializer:
    """
    Receives a record field value.
    Returns a list of string value, each represents a csv column value.
    """

    def __init__(self, field_config, field_count, record_count):
        serializer = None
        if not field_config.reference:
            serializer = self.get_serializer(field_config)
        else:
            # TODO (Steven-Chan):
            # DISPLAY_MODE_GROUPED now only supports single field
            if field_config.reference.display_mode == DISPLAY_MODE_GROUPED:
                serializer = ListSerializer(
                    multiple_data=field_config.reference.is_many)
                target_field = field_config.reference.target_fields[0]
                # Does not support nested reference
                serializer.field_serializer = FieldSerializer(
                    target_field, 1, 1)
            else:
                serializer = SpreadListSerializer(
                    multiple_data=field_config.reference.is_many,
                    field_count=field_count,
                    record_count=record_count)
                target_fields = field_config.reference.target_fields
                # Does not support nested reference
                serializer.field_serializers = [
                    FieldSerializer(field, 1, 1) for field in target_fields
                ]

        if not serializer:
            field_name = field_config.name \
                         if not field_config.reference \
                         else field_config.reference.field_name

            raise Exception(
                ('field "{}" has unsupported field type "{}"').format(
                    field_name, field_config.type))

        self.field_config = field_config
        self.value_serializer = serializer

    def serialize(self, value):
        if value is None:
            return ['']

        serialized_value = self.value_serializer.serialize(value)
        if not isinstance(serialized_value, list):
            serialized_value = [serialized_value]

        return serialized_value

    def get_serializer(self, field_config):
        if field_config.name == '_id':
            return IDSerializer(field_config.record_type)

        serializer = None

        field_type = field_config.type
        format = field_config.format
        if field_type == 'string':
            serializer = StringSerializer()
        elif field_type in 'number':
            serializer = StringSerializer()
        elif field_type == 'boolean':
            serializer = BooleanSerializer(format)
        elif field_type == 'json':
            serializer = JSONSerializer()
        elif field_type == 'location':
            serializer = LocationSerializer()
        elif field_type == 'datetime':
            serializer = DatetimeSerializer(format)
        elif field_type == 'integer':
            serializer = StringSerializer()
        elif field_type == 'asset':
            serializer = AssetSerializer()

        return serializer


class BaseValueSerializer:
    """
    Class inheriting BaseValueSerializer must implement method serialize
    which returns either a string value for a single column or
    a list of string value for multiple columns.
    """

    def __init__(self, format=None):
        self.format = format or self.default_format

    @property
    def default_format(self):
        return None

    def serialize(self, value):
        raise NotImplementedError


class SpreadListSerializer(BaseValueSerializer):
    """
    Return a list of value, each occupies a column
    """

    def __init__(self, multiple_data=False, field_count=-1, record_count=-1):
        super().__init__()
        self.multiple_data = multiple_data
        self.field_count = field_count
        self.record_count = record_count

    @property
    def width(self):
        if self.field_count == -1 or self.record_count == -1:
            raise Exception('SpreadListSerializer width unintialized')

        return self.field_count * self.record_count

    def serialize(self, value):
        result = []
        if self.multiple_data:
            for data in value:
                result = result + self.serialize_fields(data)
        else:
            result = result + self.serialize_fields(value)

        result = result + [''] * (self.width - len(result))
        return result

    def serialize_fields(self, data):
        result = []
        for i in range(0, len(self.field_serializers)):
            field_serializer = self.field_serializers[i]
            # Now assume that only single-column value in serialized value
            result.append(field_serializer.serialize(data[i])[0])
        return result


class ListSerializer(BaseValueSerializer):
    def __init__(self, multiple_data=False):
        super().__init__()
        self.multiple_data = multiple_data

    def serialize(self, value):
        if not self.multiple_data:
            return self.field_serializer.serialize(value[0])

        flattened_value = [v[0] for v in value]
        # Now assume that only single-column value in serialized value
        result = [
            self.field_serializer.serialize(v)[0] for v in flattened_value
        ]
        result = [v.replace("'", "\\'") for v in result]
        result = ["'" + v + "'" for v in result]
        result = ','.join(result)
        return result


class IDSerializer(BaseValueSerializer):
    def __init__(self, record_type):
        super().__init__()
        self.record_type = record_type

    def serialize(self, value):
        return value.split(self.record_type + '/')[1]


class StringSerializer(BaseValueSerializer):
    def serialize(self, value):
        return str(value)


class BooleanSerializer(BaseValueSerializer):
    def __init__(self, format):
        super().__init__(format)

        if self.format not in self.supported_formats:
            raise Exception('Format "%s" not supported.' % self.format)

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


class DatetimeSerializer(BaseValueSerializer):
    @property
    def default_format(self):
        return 'YYYY-MM-DDTHH:MM:SS.mmmmmm'

    def serialize(self, value):
        datetime = arrow.get(value['$date'])
        return datetime.format(self.format)


class AssetSerializer(BaseValueSerializer):
    def serialize(self, value):
        return value['$name']
