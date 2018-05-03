import sys

from marshmallow import (Schema, fields, post_load, pre_load, validates,
                         ValidationError)

from .nested_dict import NestedDict
from ..models.cms_config import (CMSConfig,
                                 CMSRecordExport, CMSRecordExportField,
                                 CMSAssociationRecord,
                                 CMSAssociationRecordField,
                                 CMSRecordImport, CMSRecordImportField,
                                 CMSRecordDirectReference,
                                 CMSRecordBackReference,
                                 CMSRecordAssociationReference,
                                 DISPLAY_MODE_GROUPED,
                                 DISPLAY_MODE_SPREAD)


class CMSConfigSchema(Schema):

    imports = NestedDict('CMSRecordImportSchema', key='name',
                         required=False)
    exports = NestedDict('CMSRecordExportSchema', key='name',
                         required=False)

    @pre_load
    def pre_load(self, data):
        return data

    @post_load
    def make_object(self, data):
        return CMSConfig(**data)


class CMSRecordExportSchema(Schema):

    record_type = fields.String()
    name = fields.String()
    fields = fields.Nested('CMSRecordExportFieldSchema', many=True)

    @pre_load
    def pre_load(self, data):
        if 'fields' in data:
            for field in data['fields']:
                field['record_type'] = data['record_type']

        return data

    @post_load
    def make_object(self, data):
        return CMSRecordExport(**data)


class CMSRecordExportFieldSchema(Schema):

    record_type = fields.String()
    name = fields.String()
    label = fields.String(required=False)

    reference_target = fields.String(required=False)
    reference_field_name = fields.String(required=False)
    reference_fields = fields.Nested('CMSRecordExportFieldSchema', many=True, required=False)

    reference_via_back_reference = fields.String(required=False)
    reference_from_field = fields.String(required=False)

    reference_via_association_record = fields.String(required=False)

    @pre_load
    def pre_load(self, data):
        if 'reference_fields' in data:
            cms_records = self.context['cms_records']
            cms_record = cms_records[data['reference_target']]
            for field in data['reference_fields']:
                field['record_type'] = cms_record.record_type
        return data

    def make_single_ref_export_field(self, record_type, data):
        schema = self.context['schema']
        field_name = data['reference_field_name']
        foreign_field = schema.field_of(record_type, field_name)
        if not foreign_field:
            raise Exception((
                'field name "{}.{}" ' +
                'not found in schema.'
            ).format(record_type, field_name))

        return CMSRecordExportField(record_type=record_type,
                                    name=data['reference_field_name'],
                                    label=data['label'],
                                    type=foreign_field.type)

    def make_multiple_ref_export_fields(self, data):
        return data['reference_fields']

    def parse_reference_target_fields(self, data, target_cms_record):
        if 'reference_field_name' in data:
            ref_target_fields = [self.make_single_ref_export_field(target_cms_record.record_type, data)]
            ref_many_fields = False
        elif 'reference_fields' in data:
            ref_target_fields = self.make_multiple_ref_export_fields(data)
            ref_many_fields = True
        else:
            raise Exception((
                'Reference field ({}) requires either ' +
                '\'reference_field_name\' or \'reference_fields\''
            ).format(data['name']))

        return ref_many_fields, ref_target_fields

    @post_load
    def make_object(self, data):
        # show name as label if label not provided
        if 'label' not in data:
            data['label'] = data['name']

        # find field type from schema
        cms_records = self.context['cms_records']
        association_records = self.context['association_records']
        schema = self.context['schema']
        field = schema.field_of(data['record_type'], data['name'])

        type = None
        reference = None
        if field and field.is_ref:
            """
            Reference field
            """
            type = 'reference'

            cms_record = cms_records[data['reference_target']]
            ref_many_fields, ref_target_fields = self.parse_reference_target_fields(data, cms_record)
            reference = CMSRecordDirectReference(
                target_cms_record=cms_record,
                target_fields=ref_target_fields,
                many_fields=ref_many_fields,
                display_mode=DISPLAY_MODE_GROUPED if not ref_many_fields else \
                             DISPLAY_MODE_SPREAD,
            )
        elif field:
            """
            Non-reference field
            """
            type = field.type
        elif 'reference_via_back_reference' in data:
            """
            Many-reference, i.e. reference field on the other record
            """
            type = 'reference'

            cms_record = cms_records[data['reference_via_back_reference']]
            ref_many_fields, ref_target_fields = self.parse_reference_target_fields(data, cms_record)
            reference = CMSRecordBackReference(
                source_reference=data['reference_from_field'],
                target_cms_record=cms_record,
                target_fields=ref_target_fields,
                display_mode=DISPLAY_MODE_GROUPED if not ref_many_fields else \
                             DISPLAY_MODE_SPREAD,
            )
        elif 'reference_via_association_record' in data:
            """
            Many-to-many reference
            """
            type = 'reference'

            cms_record = cms_records[data['reference_target']]
            ref_many_fields, ref_target_fields = self.parse_reference_target_fields(data, cms_record)
            reference = CMSRecordAssociationReference(
                association_record=association_records[data['reference_via_association_record']],
                target_reference=data['reference_target'],
                target_cms_record=cms_record,
                target_fields=ref_target_fields,
                display_mode=DISPLAY_MODE_GROUPED if not ref_many_fields else \
                             DISPLAY_MODE_SPREAD,
            )
        else:
            raise Exception((
                'field name "{record_type}.{name}" ' +
                'not found in schema, ' +
                'and neither reference_via_association_record or ' +
                'reference_via_back_reference is found.'
            ).format(**data))

        data['type'] = type
        if reference:
            data['reference'] = reference

        data.pop('reference_target', None)
        data.pop('reference_from_field', None)
        data.pop('reference_field_name', None)
        data.pop('reference_fields', None)
        data.pop('reference_via_back_reference', None)
        data.pop('reference_via_association_record', None)

        return CMSRecordExportField(**data)


class CMSAssociationRecordSchema(Schema):

    record_type = fields.String(required=False)
    fields = fields.Nested('CMSAssociationRecordFieldSchema', many=True)

    @post_load
    def make_object(self, data):
        data['name'] = self.context['name']
        if 'record_type' not in data:
            data['record_type'] = data['name']

        return CMSAssociationRecord(**data)


class CMSAssociationRecordFieldSchema(Schema):

    name = fields.String()
    reference_target = fields.String()

    @post_load
    def make_object(self, data):
        cms_records = self.context['cms_records']
        data['target_cms_record'] = cms_records[data['reference_target']]

        data.pop('reference_target')
        return CMSAssociationRecordField(**data)


class CMSRecordImportSchema(Schema):

    record_type = fields.String()
    name = fields.String()
    duplicate_reference_handling = fields.String(required=False)
    identifier = fields.String(required=False)

    fields = fields.Nested('CMSRecordImportFieldSchema', many=True)

    @validates('duplicate_reference_handling')
    def validate_reference_handling(self, value):
        if value and \
           value != CMSRecordImport.USE_FIRST and \
           value != CMSRecordImport.THROW_ERROR:
            raise ValidationError('Invalid duplicate_reference_handling value.')

    @pre_load
    def pre_load(self, data):
        if 'fields' in data:
            for field in data['fields']:
                field['record_type'] = data['record_type']

        return data

    @post_load
    def make_object(self, data):
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
        cms_records = self.context['cms_records']
        schema = self.context['schema']
        field = schema.field_of(data['record_type'], data['name'])

        type = None
        reference = None
        if field and field.is_ref:
            type = 'reference'

            cms_record = cms_records[data['reference_target']]
            field_name = data['reference_field_name']
            foreign_field = schema.field_of(cms_record.record_type, field_name)
            if not foreign_field:
                raise Exception((
                    'field name "{}.{}" ' +
                    'not found in schema.'
                ).format(cms_record.record_type, field_name))

            reference = CMSRecordDirectReference(
                target_cms_record=cms_record,
                target_fields=[foreign_field]
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
