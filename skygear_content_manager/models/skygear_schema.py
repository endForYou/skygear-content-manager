# constants
reserved_fields = {
    '_id': {
        'name': '_id',
        'type': 'string',
    },
    '_owner_id': {
        'name': '_owner_id',
        'type': 'string',
    },
    '_access': {
        'name': '_access',
        'type': 'json',
    },
    '_created_at': {
        'name': '_created_at',
        'type': 'datetime',
    },
    '_created_by': {
        'name': '_created_by',
        'type': 'string',
    },
    '_updated_at': {
        'name': '_updated_at',
        'type': 'datetime',
    },
    '_updated_by': {
        'name': '_updated_by',
        'type': 'string',
    },
}


class SkygearSchema:
    def __init__(self, record_types):
        self.record_types = record_types

    def field_of(self, record_type, field_name):
        if field_name in reserved_fields:
            return SkygearField.from_dict(reserved_fields[field_name])

        fields = [
            t for t in self.record_types[record_type].fields
            if t.name == field_name
        ]
        return fields[0] if len(fields) > 0 else None


class SkygearRecord:
    def __init__(self, record_type, fields):
        self.record_type = record_type
        self.fields = fields


class SkygearField:
    def __init__(self, name, type):
        self.name = name
        self.type = type

    @classmethod
    def from_dict(cls, d):
        return cls(
            name=d['name'],
            type=d['type'],
        )

    @property
    def is_ref(self):
        return self.type[:4] == 'ref('

    @property
    def ref_target(self):
        if not self.is_ref:
            return None

        return self.type[4:-1]
