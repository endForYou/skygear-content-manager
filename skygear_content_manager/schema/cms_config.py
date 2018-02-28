import sys

from marshmallow import (Schema, fields, post_load, pre_load, validates,
                         ValidationError)

from ..models.cms_config import (CMSConfig, CMSRecord, CMSRecordList,
                                 CMSRecordExport, CMSRecordExportField,
                                 CMSRecordExportReference,
                                 CMSAssociationRecord,
                                 CMSAssociationRecordField,
                                 CMSRecordImport, CMSRecordImportField,
                                 CMSRecordImportReference)


class NestedDict(fields.Nested):
    def __init__(self, nested, key, *args, **kwargs):
        super(NestedDict, self).__init__(nested, many=True, *args, **kwargs)
        self.key = key

    def _serialize(self, nested_obj, attr, obj):
        nested_list = super(NestedDict, self)._serialize(nested_obj, attr, obj)
        nested_dict = {item[self.key]: item for item in nested_list}
        return nested_dict

    def _deserialize(self, value, attr, data):
        raw_list = []
        for key, item in value.items():
            item[self.key] = key
            raw_list.append(item)
        nested_list = super(NestedDict, self)._deserialize(raw_list, attr, data)
        nested_dict = {getattr(item, self.key): item for item in nested_list}
        return nested_dict


class CMSConfigSchema(Schema):

    records = NestedDict('CMSRecordSchema', key='record_type')
    association_records = NestedDict('CMSAssociationRecordSchema', key='name')

    @pre_load
    def pre_load(self, data):
        return data

    @post_load
    def make_object(self, data):
        return CMSConfig(**data)


class CMSRecordSchema(Schema):

    record_type = fields.String()
    list = fields.Nested('CMSRecordListSchema')

    @pre_load
    def pre_load(self, data):
        if 'list' in data:
            data['list']['record_type'] = data['record_type']

        return data

    @post_load
    def make_object(self, data):
        return CMSRecord(**data)


class RecordListActionField(fields.Field):

    type_mapping = {
        'Export': 'CMSRecordExportSchema',
        'Import': 'CMSRecordImportSchema',
    }

    def _serialize(self, value, attr, obj):
        raise NotImplementedError

    def _deserialize(self, value, attr, data):
        return [self.deserialize_action(v) for v in value]

    def deserialize_action(self, value):
        schema_name = self.type_mapping[value['type']]
        schema_cls = getattr(sys.modules[__name__], schema_name)
        schema = schema_cls()
        schema.context = self.context
        valid_data = schema.load(value)
        if valid_data.errors:
            raise ValidationError(valid_data.errors)

        return valid_data.data


class CMSRecordListSchema(Schema):

    record_type = fields.String()
    actions = RecordListActionField()

    @pre_load
    def pre_load(self, data):
        if 'actions' in data:
            for action in data['actions']:
                action['record_type'] = data['record_type']

        return data

    @post_load
    def make_object(self, data):
        return CMSRecordList(**data)


class CMSRecordListActionSchema(Schema):

    record_type = fields.String()
    type = fields.String()


class CMSRecordExportSchema(CMSRecordListActionSchema):

    name = fields.String()
    label = fields.String(required=False)
    fields = fields.Nested('CMSRecordExportFieldSchema', many=True)

    @pre_load
    def pre_load(self, data):
        if 'fields' in data:
            for field in data['fields']:
                field['record_type'] = data['record_type']

        return data

    @post_load
    def make_object(self, data):
        if 'label' not in data:
            data['label'] = data['name']

        del data['type']
        return CMSRecordExport(**data)


class CMSRecordExportFieldSchema(Schema):

    record_type = fields.String()
    name = fields.String()
    label = fields.String(required=False)

    reference_target = fields.String(required=False)
    reference_field_name = fields.String(required=False)
    reference_back_reference = fields.String(required=False)
    reference_via_association_record = fields.String(required=False)

    @pre_load
    def pre_load(self, data):
        return data

    @post_load
    def make_object(self, data):
        # show name as label if label not provided
        if 'label' not in data:
            data['label'] = data['name']

        # find field type from schema
        schema = self.context['schema']
        field = schema.field_of(data['record_type'], data['name'])

        type = None
        reference = None
        if field and field.is_ref:
            type = 'reference'
            foreign_field = schema.field_of(data['reference_target'],
                                            data['reference_field_name'])
            if not foreign_field:
                raise Exception((
                    'field name "{reference_target}.{reference_field_name}" ' +
                    'not found in schema.'
                ).format(**data))

            reference = CMSRecordExportReference(
                ref_type=CMSRecordExportReference.REF_TYPE_DIRECT,
                name=field.name,
                target=field.ref_target,
                field_name=data['reference_field_name'],
                field_type=foreign_field.type,
            )
        elif field:
            type = field.type
        else:
            if 'reference_via_association_record' not in data and \
               'reference_via_back_reference' not in data:
                raise Exception((
                    'field name "{record_type}.{name}" ' +
                    'not found in schema, ' +
                    'and neither reference_via_association_record or ' +
                    'reference_via_back_reference is found.'
                ).format(**data))

            type = 'reference'
            ref_type = None
            ref_name = None
            if 'reference_via_back_reference' in data:
                ref_type = CMSRecordExportReference.REF_TYPE_VIA_BACK_REF
                ref_name = data['reference_via_back_reference']
            else:
                ref_type =\
                    CMSRecordExportReference.REF_TYPE_VIA_ASSOCIATION_RECORD
                ref_name = data['reference_via_association_record']

            foreign_field = schema.field_of(data['reference_target'],
                                            data['reference_field_name'])

            reference = CMSRecordExportReference(
                ref_type=ref_type,
                name=ref_name,
                target=data['reference_target'],
                field_name=data['reference_field_name'],
                field_type=foreign_field.type,
            )

        data['type'] = type
        if reference:
            data['reference'] = reference

        data.pop('reference_target', None)
        data.pop('reference_field_name', None)
        data.pop('reference_via_back_reference', None)
        data.pop('reference_via_association_record', None)

        return CMSRecordExportField(**data)


class CMSAssociationRecordSchema(Schema):

    name = fields.String()
    fields = fields.Nested('CMSAssociationRecordFieldSchema', many=True)

    @post_load
    def make_object(self, data):
        return CMSAssociationRecord(**data)


class CMSAssociationRecordFieldSchema(Schema):

    name = fields.String()
    target = fields.String()

    @post_load
    def make_object(self, data):
        return CMSAssociationRecordField(**data)


class CMSRecordImportSchema(CMSRecordListActionSchema):

    name = fields.String()
    label = fields.String()
    reference_handling = fields.String(required=False)
    identifier = fields.String(required=False)

    fields = fields.Nested('CMSRecordImportFieldSchema', many=True)

    @validates('reference_handling')
    def validate_reference_handling(self, value):
        if value and \
           value != CMSRecordImport.REFERENCE_HANDLING_USE_FIRST and \
           value != CMSRecordImport.REFERENCE_HANDLING_THROW_ERROR:
            raise ValidationError('Invalid reference_handling value.')

    @pre_load
    def pre_load(self, data):
        if 'fields' in data:
            for field in data['fields']:
                field['record_type'] = data['record_type']

        return data

    @post_load
    def make_object(self, data):
        if 'label' not in data:
            data['label'] = data['name']

        if 'identifier' not in data:
            data['identifier'] = '_id'

        field_names = [f.name for f in data['fields']]
        if data['identifier'] and data['identifier'] not in field_names:
            raise Exception((
                'identifier "{identifier}" does not match any ' +
                'field names in import config "{name}"'
            ).format(**data))

        del data['type']
        return CMSRecordImport(**data)


class CMSRecordImportFieldSchema(Schema):

    record_type = fields.String()
    name = fields.String()
    label = fields.String(required=False)

    reference_target = fields.String(required=False)
    reference_field_name = fields.String(required=False)

    @pre_load
    def pre_load(self, data):
        return data

    @post_load
    def make_object(self, data):
        # show name as label if label not provided
        if 'label' not in data:
            data['label'] = data['name']

        # find field type from schema
        schema = self.context['schema']
        field = schema.field_of(data['record_type'], data['name'])

        type = None
        reference = None
        if field and field.is_ref:
            type = 'reference'
            foreign_field = schema.field_of(data['reference_target'],
                                            data['reference_field_name'])
            if not foreign_field:
                raise Exception((
                    'field name "{reference_target}.{reference_field_name}" ' +
                    'not found in schema.'
                ).format(**data))

            reference = CMSRecordImportReference(
                name=field.name,
                target=field.ref_target,
                field_name=data['reference_field_name'],
                field_type=foreign_field.type,
            )
        elif field:
            type = field.type
        else:
            raise Exception((
                'field name "{record_type}.{name}" ' +
                'not found in schema.'
            ).format(**data))

        data['type'] = type
        if reference:
            data['reference'] = reference

        data.pop('reference_target', None)
        data.pop('reference_field_name', None)

        return CMSRecordImportField(**data)
