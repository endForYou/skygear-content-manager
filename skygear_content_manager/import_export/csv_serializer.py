import arrow
import json

from ..models.cms_config import (CMSRecordReference,
                                 CMSRecordBackReference,
                                 CMSRecordAssociationReference,
                                 DISPLAY_MODE_GROUPED)


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
        field_counts = [0] * len(self.field_configs)
        record_counts = [0] * len(self.field_configs)

        for data in csv_datas:
            for i in range(0, len(self.field_configs)):
                field_config = self.field_configs[i]
                if not field_config.reference:
                    continue

                key = field_config.name
                field_counts[i] = len(field_config.reference.target_fields)
                if field_config.reference.is_many:
                    record_counts[i] = max(len(data[i]), record_counts[i])
                else:
                    record_counts[i] = 1

        for i in range(0, len(self.field_configs)):
            field_config = self.field_configs[i]
            key = field_config.name
            serializer = FieldSerializer(field_config)
            if field_config.reference:
                serializer.value_serializer.field_count = field_counts[i]
                serializer.value_serializer.record_count = record_counts[i]

            self.serializers[i] = serializer

    def serialize(self, csv_data):
        result = []
        for i in range(0, len(self.field_configs)):
            field_config = self.field_configs[i]

            key = field_config.name
            serializer = self.serializers[i]
            value = serializer.serialize(csv_data[i])
            result = result + value

        return result


class FieldSerializer:
    """
    Receives a record field value.
    Returns a list of string value, each represents a csv column value.
    """

    def __init__(self, field_config):
        serializer = None
        if not field_config.reference:
            serializer = self.get_serializer(field_config.type)
        else:
            # TODO (Steven-Chan):
            # DISPLAY_MODE_GROUPED now only supports single field
            if field_config.reference.display_mode == DISPLAY_MODE_GROUPED:
                serializer = ListSerializer(multiple_data=field_config.reference.is_many)
                target_field = field_config.reference.target_fields[0]
                serializer.field_serializer = FieldSerializer(target_field)
            else:
                serializer = SpreadListSerializer(multiple_data=field_config.reference.is_many)
                target_fields = field_config.reference.target_fields
                serializer.field_serializers = [FieldSerializer(field) for field in target_fields]

        if not serializer:
            field_name = field_config.name \
                         if not field_config.reference \
                         else field_config.reference.field_name

            raise Exception((
                'field "{}" has unsupported field type "{}"'
            ).format(field_name, field_config.type))

        self.field_config = field_config
        self.value_serializer = serializer

    def serialize(self, value):
        if value == None:
            return ['']

        serialized_value = self.value_serializer.serialize(value)
        if not isinstance(serialized_value, list):
            serialized_value = [serialized_value]

        return serialized_value

    def get_serializer(self, field_type):
        serializer = None

        if field_type == 'string':
            serializer = StringSerializer()
        elif field_type in 'number':
            serializer = StringSerializer()
        elif field_type == 'boolean':
            serializer = BooleanSerializer()
        elif field_type == 'json':
            serializer = JSONSerializer()
        elif field_type == 'location':
            serializer = LocationSerializer()
        elif field_type == 'datetime':
            serializer = DatetimeSerializer()
        elif field_type == 'integer':
            serializer = StringSerializer()

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
    def __init__(self, multiple_data = False):
        super(BaseValueSerializer, self).__init__()
        self.multiple_data = multiple_data
        self.field_count = -1
        self.record_count = -1

    @property
    def width(self):
        if self.field_count == -1 or self.record_count == -1:
            raise Exception('SpreadListSerializer width unintialized')

        return self.field_count * self.record_count

    def serialize(self, value):
        if self.width == -1:
            raise Exception('SpreadListSerializer width unintialized')

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
            result.append(field_serializer.serialize(data[i]))
        return result


class ListSerializer(BaseValueSerializer):

    def __init__(self, multiple_data = False):
        super(BaseValueSerializer, self).__init__()
        self.multiple_data = multiple_data

    def serialize(self, value):
        if not self.multiple_data:
            return self.field_serializer.serialize(value[0])

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


class DatetimeSerializer(BaseValueSerializer):

    @property
    def default_format(self):
        return 'YYYY-MM-DDTHH:MM:SS.mmmmmm'

    def serialize(self, value):
        datetime = arrow.get(value)
        return datetime.format(self.format)
