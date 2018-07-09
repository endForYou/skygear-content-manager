from marshmallow import Schema
from marshmallow import fields
from marshmallow import post_load
from marshmallow import pre_load

from ..models.skygear_schema import SkygearField
from ..models.skygear_schema import SkygearRecord
from ..models.skygear_schema import SkygearSchema
from .nested_dict import NestedDict


class SkygearSchemaSchema(Schema):

    record_types = NestedDict('SkygearRecordSchema', key='record_type')

    @pre_load
    def pre_load(self, data):
        for record_type, d in data['record_types'].items():
            d['record_type'] = record_type

        return data

    @post_load
    def make_object(self, data):
        return SkygearSchema(**data)


class SkygearRecordSchema(Schema):

    record_type = fields.String()
    fields = fields.Nested('SkygearFieldSchema', many=True)

    @post_load
    def make_object(self, data):
        return SkygearRecord(**data)


class SkygearFieldSchema(Schema):

    name = fields.String()
    type = fields.String()

    @post_load
    def make_object(self, data):
        return SkygearField(**data)
