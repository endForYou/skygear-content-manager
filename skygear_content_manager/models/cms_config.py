# Display all in one column
DISPLAY_MODE_GROUPED = 'DISPLAY_MODE_GROUPED'
# Display data in multiple columns
DISPLAY_MODE_SPREAD = 'DISPLAY_MODE_SPREAD'

# Use first when duplicated data is found
DUPLICATION_HANDLING_USE_FIRST = 'use_first'
# Throw error when duplicated data is found
DUPLICATION_HANDLING_THROW_ERROR = 'throw_error'


class CMSConfig:
    def __init__(self,
                 imports={},
                 exports={},
                 cms_records={},
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

    def get_direct_reference_fields(self):
        fields = [
            f for f in self.fields if f.reference and not f.reference.is_many
        ]
        targets = set()

        for field in fields:
            targets.add(field.name)

        return list(targets)

    def get_many_reference_fields(self):
        return [f for f in self.fields if f.reference and f.reference.is_many]


class CMSRecordExportField:
    def __init__(self,
                 record_type,
                 name,
                 label,
                 type,
                 format=None,
                 reference=None):
        self.record_type = record_type
        self.name = name
        self.label = label
        self.type = type
        self.format = format
        self.reference = reference


class CMSRecordReference:
    def __init__(self,
                 target_cms_record,
                 target_fields,
                 many_fields=False,
                 display_mode=DISPLAY_MODE_GROUPED):
        self.target_cms_record = target_cms_record
        self.target_fields = target_fields
        self.many_fields = many_fields
        self.display_mode = display_mode

    @property
    def target_record_type(self):
        return self.target_cms_record.record_type

    @property
    def is_many(self):
        raise NotImplementedError('is_many not implemented.')


class CMSRecordDirectReference(CMSRecordReference):
    @property
    def is_many(self):
        return False


class CMSRecordBackReference(CMSRecordReference):
    """
    e.g.
    One parent user has many children user, user.parent is holding the
    reference of parent user record.
    If you want to display children user records of a user record,

    source_reference: "parent"
    """

    def __init__(self,
                 source_reference,
                 target_cms_record,
                 target_fields,
                 many_fields=False,
                 display_mode=DISPLAY_MODE_GROUPED):
        super(CMSRecordBackReference, self)\
            .__init__(target_cms_record, target_fields, many_fields,
                      display_mode)
        self.source_reference = source_reference

    @property
    def is_many(self):
        return True


class CMSRecordAssociationReference(CMSRecordReference):
    """
    e.g.
    parent_to_child has a parent (user) field and a child (user) field.
    If you want to display the parents of a user record,

    association_record: parent_to_child CMSAssociationRecord
    target_reference: "parent"
    """

    def __init__(self,
                 association_record,
                 target_reference,
                 target_cms_record,
                 target_fields,
                 many_fields=False,
                 display_mode=DISPLAY_MODE_GROUPED):
        super(CMSRecordAssociationReference, self)\
            .__init__(target_cms_record, target_fields, many_fields,
                      display_mode)
        self.association_record = association_record
        self.target_reference = target_reference

    @property
    def is_many(self):
        return True


class CMSAssociationRecord:
    def __init__(self, name, record_type, fields):
        self.name = name
        self.record_type = record_type
        self.fields = fields


class CMSAssociationRecordField:
    def __init__(self, name, target_cms_record):
        self.name = name
        self.target_cms_record = target_cms_record


class CMSRecordImport:
    def __init__(self,
                 record_type,
                 name,
                 fields,
                 handle_duplicated_identifier=DUPLICATION_HANDLING_USE_FIRST,
                 identifier=None,
                 limit=None):
        if not limit:
            limit = CMSRecordImportLimitConfig()

        self.record_type = record_type
        self.name = name
        self.handle_duplicated_identifier = handle_duplicated_identifier
        self.identifier = identifier
        self.limit = limit
        self.fields = fields

    def get_reference_fields(self):
        return [f for f in self.fields if f.reference]


class CMSRecordImportLimitConfig:
    def __init__(self, record_number=None):
        self.record_number = record_number


class CMSRecordImportField:
    def __init__(self,
                 record_type,
                 name,
                 label,
                 type,
                 reference=None,
                 handle_duplicated_reference=DUPLICATION_HANDLING_USE_FIRST):
        self.record_type = record_type
        self.name = name
        self.label = label
        self.type = type
        self.reference = reference
        self.handle_duplicated_reference = handle_duplicated_reference


class CMSRecordImportReference:
    def __init__(self, name, target_cms_record, target_field):
        self.name = name
        self.target_cms_record = target_cms_record
        self.target_field = target_field
