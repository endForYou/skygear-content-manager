from marshmallow import Schema, fields, pre_load, post_load

from ..models.skygear_schema import SkygearSchema, SkygearRecord, SkygearField


class SkygearSchemaSchema(Schema):

    record_types = fields.Dict(fields.Nested('SkygearRecordSchema'))

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
