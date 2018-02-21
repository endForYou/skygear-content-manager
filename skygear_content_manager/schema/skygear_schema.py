from marshmallow import Schema, fields, post_load

from ..models.skygear_schema import SkygearSchema, SkygearRecord, SkygearField


class SkygearSchemaSchema(Schema):

    record_types = fields.Dict(fields.Nested('SkygearRecordSchema'))

    @post_load
    def make_object(self, data):
        return SkygearSchema(**data)


class SkygearRecordSchema(Schema):

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
