from marshmallow import Schema, fields, post_load


class SkygearSchemaSchema(Schema):

    record_types = fields.Dict(fields.Nested('SkygearRecordSchema'))

    @post_load
    def make_object(self, data):
        return SkygearSchema(**data)


class SkygearSchema:

    record_types = {}

    def __init__(self, record_types):
        self.record_types = record_types

    @classmethod
    def from_dict(cls, d):
        result, _ = SkygearSchemaSchema().load(d)
        return result

    def field_of(self, record_type, field_name):
        fields = [t for t in self.record_types[record_type].fields
                  if t.name == field_name]
        return fields[0] if len(fields) > 0 else None


class SkygearRecordSchema(Schema):

    fields = fields.Nested('SkygearFieldSchema', many=True)

    @post_load
    def make_object(self, data):
        return SkygearRecord(**data)


class SkygearRecord:

    fields = []

    def __init__(self, fields):
        self.fields = fields


class SkygearFieldSchema(Schema):

    name = fields.String()
    type = fields.String()

    @post_load
    def make_object(self, data):
        return SkygearField(**data)


class SkygearField:

    name = ''
    type = ''

    def __init__(self, name, type):
        self.name = name
        self.type = type

    @property
    def is_ref(self):
        return self.type[:4] == 'ref('

    @property
    def ref_target(self):
        if not self.is_ref:
            return None

        return self.type[4:-1]
