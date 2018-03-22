class CMSConfig:

    def __init__(self, imports={}, exports={}, cms_records={},
                 association_records={}):
        self.imports = imports
        self.exports = exports
        self.cms_records = cms_records
        self.association_records = association_records

    @classmethod
    def empty(cls):
        return cls(
            imports={},
            exports={},
            cms_records={},
            association_records={},
        )

    def get_export_config(self, name):
        return self.exports.get(name)

    def get_import_config(self, name):
        return self.imports.get(name)


class CMSRecord:

    def __init__(self, name, record_type):
        self.name = name
        self.record_type = record_type


class CMSRecordExport:

    def __init__(self, record_type, name, fields):
        self.record_type = record_type
        self.name = name
        self.fields = fields

    def get_reference_targets(self):
        fields = [f for f in self.fields
                  if f.reference and f.reference.is_direct]
        targets = set()

        for field in fields:
            reference = field.reference
            targets.add(reference.name)

        return list(targets)

    def get_many_reference_fields(self):
        return [f for f in self.fields
                if f.reference and f.reference.is_many]


class CMSRecordExportField:

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

    def __init__(self, ref_type, name, target_cms_record, target_field):
        self.ref_type = ref_type
        self.name = name
        self.target_cms_record = target_cms_record
        self.target_field = target_field

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

    @property
    def identifier(self):
        if self.is_direct:
            return self.name

        return self.name + '.' + self.target_cms_record.name


class CMSAssociationRecord:

    def __init__(self, name, fields):
        self.name = name
        self.fields = fields


class CMSAssociationRecordField:

    def __init__(self, name, target_cms_record):
        self.name = name
        self.target_cms_record = target_cms_record


class CMSRecordImport:

    USE_FIRST = 'use-first'
    THROW_ERROR = 'throw-error'

    def __init__(self, record_type, name, fields,
                 duplicate_reference_handling = USE_FIRST,
                 identifier = None):
        self.record_type = record_type
        self.name = name
        self.duplicate_reference_handling = duplicate_reference_handling
        self.identifier = identifier
        self.fields = fields

    def get_reference_fields(self):
        return [f for f in self.fields if f.reference]


class CMSRecordImportField:

    def __init__(self, record_type, name, label, type, reference = None):
        self.record_type = record_type
        self.name = name
        self.label = label
        self.type = type
        self.reference = reference


class CMSRecordImportReference:

    def __init__(self, name, target_cms_record, target_field):
        self.name = name
        self.target_cms_record = target_cms_record
        self.target_field = target_field
