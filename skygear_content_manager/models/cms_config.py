class CMSConfig:

    records = {}

    def __init__(self, records):
        self.records = records

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
    target = ''
    field_name = ''

    def __init__(self, ref_type, target, field_name):
        self.ref_type = ref_type
        self.target = target
        self.field_name = field_name
