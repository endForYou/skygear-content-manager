class SkygearSchema:

    record_types = {}

    def __init__(self, record_types):
        self.record_types = record_types

    @classmethod
    def from_dict(cls, d):
        result, _ = SkygearDatabaseSchema().load(d)
        return result

    def field_of(self, record_type, field_name):
        fields = [t for t in self.record_types[record_type].fields
                  if t.name == field_name]
        return fields[0] if len(fields) > 0 else None


class SkygearRecord:

    fields = []

    def __init__(self, fields):
        self.fields = fields


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
