class CMSConfig:

    records = {}
    association_records = {}

    def __init__(self, records, association_records):
        self.records = records
        self.association_records = association_records

    @classmethod
    def from_dict(cls, d, context):
        schema = CMSConfigSchema()
        schema.context = context
        result = schema.load(d)
        return result.data

    def get_export_config(self, name):
        for _, record in self.records.items():
            config = record.get_export_config(name)
            if config is not None:
                return config

        return None


class CMSRecord:

    record_type = ''
    list = None

    def __init__(self, record_type, list):
        self.record_type = record_type
        self.list = list

    def get_export_config(self, name):
        actions = [action for action in self.list.actions
                   if isinstance(action, CMSRecordExport) and
                      action.name == name]
        return actions[0] if len(actions) > 0 else None


class CMSRecordList:

    record_type = ''
    actions = []

    def __init__(self, record_type, actions = []):
        self.record_type = record_type
        self.actions = actions


class CMSRecordExport:

    record_type = ''
    name = ''
    fields = []

    def __init__(self, record_type, name, fields):
        self.record_type = record_type
        self.name = name
        self.fields = fields

    def get_reference_targets(self):
        fields = [f for f in self.fields
                  if f.reference and f.reference.is_direct]
        targets = []

        for field in fields:
            reference = field.reference
            if reference.target not in targets:
                targets.append(reference.target)

        return targets

    def get_many_reference_fields(self):
        return [f for f in self.fields
                if f.reference and f.reference.is_many]


class CMSRecordExportField:

    record_type = ''
    name = ''
    label = ''
    type = ''

    reference = None

    def __init__(self, record_type, name, label, type, reference = None):
        self.record_type = record_type
        self.name = name
        self.label = label
        self.type = type
        self.reference = reference


class CMSRecordExportReference:

    REF_TYPE_DIRECT = ''
    REF_TYPE_VIA_BACK_REF = 'via_back_reference'
    REF_TYPE_VIA_ASSOCIATION_RECORD = 'via_association_record'

    ref_type = REF_TYPE_DIRECT
    name = ''
    target = ''
    field_name = ''

    def __init__(self, ref_type, name, target, field_name):
        self.ref_type = ref_type
        self.name = name
        self.target = target
        self.field_name = field_name

    @property
    def is_direct(self):
        return self.ref_type == CMSRecordExportReference.REF_TYPE_DIRECT

    @property
    def is_via_back_ref(self):
        return self.ref_type == CMSRecordExportReference.REF_TYPE_VIA_BACK_REF

    @property
    def is_via_association_record(self):
        return self.ref_type == \
            CMSRecordExportReference.REF_TYPE_VIA_ASSOCIATION_RECORD

    @property
    def is_many(self):
        return not self.is_direct


class CMSAssociationRecord:

    name = ''
    fields = []

    def __init__(self, name, fields):
        self.name = name
        self.fields = fields


class CMSAssociationRecordField:

    name = ''
    target = ''

    def __init__(self, name, target):
        self.name = name
        self.target = target
