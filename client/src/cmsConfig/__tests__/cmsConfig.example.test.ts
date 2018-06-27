import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as process from 'process';
import { parseCmsConfig } from '..';

// tslint:disable:object-literal-sort-keys
test('parseCmsConfig should parse example config', () => {
  const text = fs.readFileSync(
    process.cwd() + '/src/cmsConfig/__tests__/cms-config-example.yaml',
    {
      encoding: 'utf-8',
    }
  );
  const parsed = yaml.safeLoad(text);
  const config = parseCmsConfig(parsed);
  expect(config).toEqual({
    associationRecordByName: {
      field_asso_ref: {
        cmsRecord: { name: 'field_asso_ref', recordType: 'field_asso_ref' },
        referenceConfigPair: [
          {
            compact: false,
            name: 'field_demo',
            label: 'Field demo',
            displayFieldName: '_id',
            reference: {
              targetCmsRecord: { name: 'field_demo', recordType: 'field_demo' },
              type: 'DirectReference',
            },
            type: 'Reference',
          },
          {
            compact: false,
            name: 'asso_ref_demo',
            label: 'Asso ref demo',
            displayFieldName: '_id',
            reference: {
              targetCmsRecord: {
                name: 'asso_ref_demo',
                recordType: 'asso_ref_demo',
              },
              type: 'DirectReference',
            },
            type: 'Reference',
          },
        ],
      },
    },
    defaultSettings: {
      timezone: 'Asia/Hong_Kong',
    },
    fileImport: {
      enabled: true,
    },
    pushNotifications: {
      enabled: true,
      filterUserConfigs: [
        { name: 'name', label: 'Name', nullable: false, type: 'String' },
      ],
    },
    records: {
      field_demo: {
        cmsRecord: { name: 'field_demo', recordType: 'field_demo' },
        edit: {
          actions: [],
          cmsRecord: { name: 'field_demo', recordType: 'field_demo' },
          fields: [
            { compact: false, label: 'ID', name: '_id', type: 'TextDisplay' },
            {
              compact: false,
              label: 'Created at',
              name: 'createdAt',
              type: 'DateTimeDisplay',
            },
            {
              compact: false,
              label: 'Updated at',
              name: 'updatedAt',
              type: 'DateTimeDisplay',
            },
            {
              compact: false,
              name: 'name',
              label: 'Name',
              editable: true,
              type: 'TextInput',
            },
            {
              compact: false,
              name: 'textarea',
              label: 'Textarea',
              editable: true,
              type: 'TextArea',
            },
            {
              compact: false,
              name: 'dropdown',
              label: 'Dropdown',
              editable: true,
              customOption: { enabled: true, label: 'Others' },
              defaultValue: 'A',
              nullOption: { enabled: false, label: 'Undefined' },
              options: [
                { label: 'Option A', value: 'A' },
                { label: 'Option B', value: 'B' },
                { label: 'Option S', value: 'S' },
              ],
              type: 'Dropdown',
            },
            {
              compact: false,
              name: 'wysiwyg',
              label: 'Wysiwyg',
              editable: true,
              type: 'WYSIWYG',
            },
            {
              compact: false,
              name: 'datetime',
              label: 'Datetime',
              type: 'DateTimePicker',
            },
            {
              compact: false,
              name: 'boolean',
              label: 'Boolean',
              editable: true,
              type: 'Boolean',
            },
            {
              compact: false,
              name: 'integer',
              label: 'Integer',
              editable: true,
              type: 'IntegerInput',
            },
            {
              compact: false,
              name: 'number',
              label: 'Number',
              editable: true,
              type: 'FloatInput',
            },
            {
              compact: false,
              name: 'reference',
              label: 'Reference',
              editable: true,
              displayFieldName: 'name',
              reference: {
                targetCmsRecord: { name: 'ref_demo', recordType: 'ref_demo' },
                type: 'DirectReference',
              },
              type: 'ReferenceDropdown',
            },
            {
              compact: false,
              name: 'back_refs',
              label: 'Back refs',
              editable: true,
              displayFieldName: 'name',
              reference: {
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'back_ref_demo',
                  recordType: 'back_ref_demo',
                },
                type: 'ViaBackReference',
              },
              type: 'ReferenceSelect',
            },
            {
              compact: false,
              name: 'back_refs_embedded',
              label: 'Back refs embedded',
              editable: true,
              displayFields: [
                {
                  compact: false,
                  label: 'ID',
                  name: '_id',
                  type: 'TextDisplay',
                },
                {
                  compact: false,
                  name: 'name',
                  label: 'Name',
                  editable: true,
                  type: 'TextInput',
                },
              ],
              positionFieldName: 'field_demo_position',
              reference: {
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'back_ref_demo',
                  recordType: 'back_ref_demo',
                },
                type: 'ViaBackReference',
              },
              referenceDeleteAction: 'NullifyReference',
              references: [],
              reorderEnabled: false,
              sortOrder: 'Asc',
              type: 'EmbeddedReferenceList',
            },
            {
              compact: false,
              name: 'imageasset',
              label: 'Imageasset',
              editable: true,
              nullable: true,
              type: 'ImageUploader',
            },
            {
              compact: false,
              name: 'fileasset',
              label: 'Fileasset',
              editable: true,
              accept: '',
              nullable: true,
              type: 'FileUploader',
            },
            {
              compact: false,
              name: 'deleted',
              label: 'Deleted',
              editable: true,
              defaultValue: false,
              type: 'Boolean',
            },
          ],
          label: 'Field demo',
          references: [
            {
              compact: false,
              name: 'reference',
              label: 'Reference',
              editable: true,
              displayFieldName: 'name',
              reference: {
                targetCmsRecord: { name: 'ref_demo', recordType: 'ref_demo' },
                type: 'DirectReference',
              },
              type: 'ReferenceDropdown',
            },
            {
              compact: false,
              name: 'back_refs',
              label: 'Back refs',
              editable: true,
              displayFieldName: 'name',
              reference: {
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'back_ref_demo',
                  recordType: 'back_ref_demo',
                },
                type: 'ViaBackReference',
              },
              type: 'ReferenceSelect',
            },
            {
              compact: false,
              name: 'back_refs_embedded',
              label: 'Back refs embedded',
              editable: true,
              displayFields: [
                {
                  compact: false,
                  label: 'ID',
                  name: '_id',
                  type: 'TextDisplay',
                },
                {
                  compact: false,
                  name: 'name',
                  label: 'Name',
                  editable: true,
                  type: 'TextInput',
                },
              ],
              positionFieldName: 'field_demo_position',
              reference: {
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'back_ref_demo',
                  recordType: 'back_ref_demo',
                },
                type: 'ViaBackReference',
              },
              referenceDeleteAction: 'NullifyReference',
              references: [],
              reorderEnabled: false,
              sortOrder: 'Asc',
              type: 'EmbeddedReferenceList',
            },
          ],
        },
        list: {
          actions: [
            {
              href: '/records/{record_type}/new',
              label: 'Add',
              target: '',
              type: 'Link',
            },
            {
              label: 'Import records',
              name: 'import-field-demo',
              type: 'Import',
            },
            {
              atomic: true,
              label: 'Import (Atomic)',
              name: 'import-field-demo',
              type: 'Import',
            },
            {
              label: 'Import with asset',
              name: 'import-asset-demo',
              type: 'Import',
            },
            {
              label: 'Export records',
              name: 'export-field-demo',
              type: 'Export',
            },
          ],
          cmsRecord: { name: 'field_demo', recordType: 'field_demo' },
          defaultSort: { fieldName: 'name', order: 'descending' },
          fields: [
            { compact: true, label: 'ID', name: '_id', type: 'TextDisplay' },
            {
              compact: true,
              label: 'Created at',
              name: 'createdAt',
              type: 'DateTimeDisplay',
            },
            {
              compact: true,
              label: 'Updated at',
              name: 'updatedAt',
              type: 'DateTimeDisplay',
            },
            { compact: true, name: 'name', label: 'Name', type: 'TextDisplay' },
            {
              compact: true,
              name: 'textarea',
              label: 'Textarea',
              type: 'TextArea',
            },
            {
              compact: true,
              name: 'dropdown',
              label: 'Dropdown',
              type: 'TextDisplay',
            },
            {
              compact: true,
              name: 'wysiwyg',
              label: 'Wysiwyg',
              type: 'WYSIWYG',
            },
            {
              compact: true,
              name: 'datetime',
              label: 'Datetime',
              type: 'DateTimeDisplay',
            },
            {
              compact: true,
              name: 'boolean',
              label: 'Boolean',
              type: 'Boolean',
            },
            {
              compact: true,
              name: 'integer',
              label: 'Integer',
              type: 'IntegerDisplay',
            },
            {
              compact: true,
              name: 'number',
              label: 'Number',
              type: 'FloatDisplay',
            },
            {
              compact: true,
              name: 'reference',
              label: 'Reference',
              displayFieldName: 'name',
              reference: {
                targetCmsRecord: { name: 'ref_demo', recordType: 'ref_demo' },
                type: 'DirectReference',
              },
              type: 'Reference',
            },
            {
              compact: true,
              name: 'back_refs',
              label: 'Back refs',
              displayFieldName: 'name',
              reference: {
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'back_ref_demo',
                  recordType: 'back_ref_demo',
                },
                type: 'ViaBackReference',
              },
              type: 'ReferenceList',
            },
            {
              compact: true,
              name: 'imageasset',
              label: 'Imageasset',
              type: 'ImageDisplay',
            },
            {
              compact: true,
              name: 'fileasset',
              label: 'Fileasset',
              type: 'FileDisplay',
            },
          ],
          filters: [
            { name: '_id', label: 'ID', nullable: false, type: 'String' },
            {
              name: '_created_at',
              label: 'CreatedAt',
              nullable: false,
              type: 'DateTime',
            },
            {
              name: '_updated_at',
              label: 'UpdatedAt',
              nullable: false,
              type: 'DateTime',
            },
            { name: 'name', label: 'Name', nullable: false, type: 'String' },
            {
              name: 'datetime',
              label: 'Datetime',
              nullable: false,
              type: 'DateTime',
            },
            {
              name: 'boolean',
              label: 'Boolean',
              nullable: false,
              type: 'Boolean',
            },
            {
              name: 'integer',
              label: 'Integer',
              nullable: false,
              type: 'Integer',
            },
            {
              name: 'reference',
              label: 'Reference',
              nullable: true,
              displayFieldName: 'name',
              targetCmsRecord: { name: 'ref_demo', recordType: 'ref_demo' },
              type: 'Reference',
            },
          ],
          itemActions: [
            {
              href: '/record/{record.id}',
              label: 'Show',
              target: '',
              type: 'Link',
            },
            {
              href: '/record/{record.id}/edit',
              label: 'Edit',
              target: '',
              type: 'Link',
            },
            {
              href: 'https://www.google.com/search?q={record.name}',
              label: 'Search',
              target: '_blank',
              type: 'Link',
            },
          ],
          label: 'Field demo',
          perPage: 25,
          predicates: [
            {
              name: 'deleted',
              type: 'NotEqualTo',
              value: true,
              valueType: 'JSONValue',
            },
          ],
          references: [
            {
              compact: true,
              name: 'reference',
              label: 'Reference',
              displayFieldName: 'name',
              reference: {
                targetCmsRecord: { name: 'ref_demo', recordType: 'ref_demo' },
                type: 'DirectReference',
              },
              type: 'Reference',
            },
            {
              compact: true,
              name: 'back_refs',
              label: 'Back refs',
              displayFieldName: 'name',
              reference: {
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'back_ref_demo',
                  recordType: 'back_ref_demo',
                },
                type: 'ViaBackReference',
              },
              type: 'ReferenceList',
            },
          ],
        },
        new: {
          actions: [],
          cmsRecord: { name: 'field_demo', recordType: 'field_demo' },
          fields: [
            { compact: false, label: 'ID', name: '_id', type: 'TextDisplay' },
            {
              compact: false,
              label: 'Created at',
              name: 'createdAt',
              type: 'DateTimeDisplay',
            },
            {
              compact: false,
              label: 'Updated at',
              name: 'updatedAt',
              type: 'DateTimeDisplay',
            },
            {
              compact: false,
              name: 'name',
              label: 'Name',
              editable: true,
              type: 'TextInput',
            },
            {
              compact: false,
              name: 'textarea',
              label: 'Textarea',
              editable: true,
              type: 'TextArea',
            },
            {
              compact: false,
              name: 'dropdown',
              label: 'Dropdown',
              editable: true,
              customOption: { enabled: true, label: 'Others' },
              defaultValue: 'A',
              nullOption: { enabled: false, label: 'Undefined' },
              options: [
                { label: 'Option A', value: 'A' },
                { label: 'Option B', value: 'B' },
                { label: 'Option S', value: 'S' },
              ],
              type: 'Dropdown',
            },
            {
              compact: false,
              name: 'wysiwyg',
              label: 'Wysiwyg',
              editable: true,
              type: 'WYSIWYG',
            },
            {
              compact: false,
              name: 'datetime',
              label: 'Datetime',
              type: 'DateTimePicker',
            },
            {
              compact: false,
              name: 'boolean',
              label: 'Boolean',
              editable: true,
              type: 'Boolean',
            },
            {
              compact: false,
              name: 'integer',
              label: 'Integer',
              editable: true,
              type: 'IntegerInput',
            },
            {
              compact: false,
              name: 'number',
              label: 'Number',
              editable: true,
              type: 'FloatInput',
            },
            {
              compact: false,
              name: 'reference',
              label: 'Reference',
              editable: true,
              displayFieldName: 'name',
              reference: {
                targetCmsRecord: { name: 'ref_demo', recordType: 'ref_demo' },
                type: 'DirectReference',
              },
              type: 'ReferenceDropdown',
            },
            {
              compact: false,
              name: 'back_refs',
              label: 'Back refs',
              editable: true,
              displayFieldName: 'name',
              reference: {
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'back_ref_demo',
                  recordType: 'back_ref_demo',
                },
                type: 'ViaBackReference',
              },
              type: 'ReferenceSelect',
            },
            {
              compact: false,
              name: 'back_refs_embedded',
              label: 'Back refs embedded',
              editable: true,
              displayFields: [
                {
                  compact: false,
                  label: 'ID',
                  name: '_id',
                  type: 'TextDisplay',
                },
                {
                  compact: false,
                  name: 'name',
                  label: 'Name',
                  editable: true,
                  type: 'TextInput',
                },
              ],
              positionFieldName: 'field_demo_position',
              reference: {
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'back_ref_demo',
                  recordType: 'back_ref_demo',
                },
                type: 'ViaBackReference',
              },
              referenceDeleteAction: 'NullifyReference',
              references: [],
              reorderEnabled: false,
              sortOrder: 'Asc',
              type: 'EmbeddedReferenceList',
            },
            {
              compact: false,
              name: 'imageasset',
              label: 'Imageasset',
              editable: true,
              nullable: true,
              type: 'ImageUploader',
            },
            {
              compact: false,
              name: 'fileasset',
              label: 'Fileasset',
              editable: true,
              accept: '',
              nullable: true,
              type: 'FileUploader',
            },
            {
              compact: false,
              name: 'deleted',
              label: 'Deleted',
              editable: true,
              defaultValue: false,
              type: 'Boolean',
            },
          ],
          label: 'Field demo',
          references: [
            {
              compact: false,
              name: 'reference',
              label: 'Reference',
              editable: true,
              displayFieldName: 'name',
              reference: {
                targetCmsRecord: { name: 'ref_demo', recordType: 'ref_demo' },
                type: 'DirectReference',
              },
              type: 'ReferenceDropdown',
            },
            {
              compact: false,
              name: 'back_refs',
              label: 'Back refs',
              editable: true,
              displayFieldName: 'name',
              reference: {
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'back_ref_demo',
                  recordType: 'back_ref_demo',
                },
                type: 'ViaBackReference',
              },
              type: 'ReferenceSelect',
            },
            {
              compact: false,
              name: 'back_refs_embedded',
              label: 'Back refs embedded',
              editable: true,
              displayFields: [
                {
                  compact: false,
                  label: 'ID',
                  name: '_id',
                  type: 'TextDisplay',
                },
                {
                  compact: false,
                  name: 'name',
                  label: 'Name',
                  editable: true,
                  type: 'TextInput',
                },
              ],
              positionFieldName: 'field_demo_position',
              reference: {
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'back_ref_demo',
                  recordType: 'back_ref_demo',
                },
                type: 'ViaBackReference',
              },
              referenceDeleteAction: 'NullifyReference',
              references: [],
              reorderEnabled: false,
              sortOrder: 'Asc',
              type: 'EmbeddedReferenceList',
            },
          ],
        },
        show: {
          actions: [
            {
              href: '/record/{record.id}/edit',
              label: 'Edit',
              target: '',
              type: 'Link',
            },
          ],
          cmsRecord: { name: 'field_demo', recordType: 'field_demo' },
          fields: [
            { compact: false, label: 'ID', name: '_id', type: 'TextDisplay' },
            {
              compact: false,
              label: 'Created at',
              name: 'createdAt',
              type: 'DateTimeDisplay',
            },
            {
              compact: false,
              label: 'Updated at',
              name: 'updatedAt',
              type: 'DateTimeDisplay',
            },
            {
              compact: false,
              name: 'name',
              label: 'Name',
              type: 'TextDisplay',
            },
            {
              compact: false,
              name: 'textarea',
              label: 'Textarea',
              type: 'TextArea',
            },
            {
              compact: false,
              name: 'dropdown',
              label: 'Dropdown',
              type: 'TextDisplay',
            },
            {
              compact: false,
              name: 'wysiwyg',
              label: 'Wysiwyg',
              type: 'WYSIWYG',
            },
            {
              compact: false,
              name: 'datetime',
              label: 'Datetime',
              timezone: 'America/New_York',
              type: 'DateTimeDisplay',
            },
            {
              compact: false,
              name: 'boolean',
              label: 'Boolean',
              type: 'Boolean',
            },
            {
              compact: false,
              name: 'integer',
              label: 'Integer',
              type: 'IntegerDisplay',
            },
            {
              compact: false,
              name: 'number',
              label: 'Number',
              type: 'FloatDisplay',
            },
            {
              compact: false,
              name: 'reference',
              label: 'Reference',
              displayFieldName: 'name',
              reference: {
                targetCmsRecord: { name: 'ref_demo', recordType: 'ref_demo' },
                type: 'DirectReference',
              },
              type: 'Reference',
            },
            {
              compact: false,
              name: 'back_refs',
              label: 'Back refs',
              displayFieldName: 'name',
              reference: {
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'back_ref_demo',
                  recordType: 'back_ref_demo',
                },
                type: 'ViaBackReference',
              },
              type: 'ReferenceList',
            },
            {
              compact: false,
              name: 'asso_refs',
              label: 'Asso refs',
              displayFieldName: 'name',
              reference: {
                associationRecordConfig: {
                  cmsRecord: {
                    name: 'field_asso_ref',
                    recordType: 'field_asso_ref',
                  },
                  referenceConfigPair: [
                    {
                      compact: false,
                      name: 'field_demo',
                      label: 'Field demo',
                      displayFieldName: '_id',
                      reference: {
                        targetCmsRecord: {
                          name: 'field_demo',
                          recordType: 'field_demo',
                        },
                        type: 'DirectReference',
                      },
                      type: 'Reference',
                    },
                    {
                      compact: false,
                      name: 'asso_ref_demo',
                      label: 'Asso ref demo',
                      displayFieldName: '_id',
                      reference: {
                        targetCmsRecord: {
                          name: 'asso_ref_demo',
                          recordType: 'asso_ref_demo',
                        },
                        type: 'DirectReference',
                      },
                      type: 'Reference',
                    },
                  ],
                },
                sourceReference: {
                  compact: false,
                  name: 'field_demo',
                  label: 'Field demo',
                  displayFieldName: '_id',
                  reference: {
                    targetCmsRecord: {
                      name: 'field_demo',
                      recordType: 'field_demo',
                    },
                    type: 'DirectReference',
                  },
                  type: 'Reference',
                },
                targetReference: {
                  compact: false,
                  name: 'asso_ref_demo',
                  label: 'Asso ref demo',
                  displayFieldName: '_id',
                  reference: {
                    targetCmsRecord: {
                      name: 'asso_ref_demo',
                      recordType: 'asso_ref_demo',
                    },
                    type: 'DirectReference',
                  },
                  type: 'Reference',
                },
                type: 'ViaAssociationRecord',
              },
              type: 'ReferenceList',
            },
            {
              compact: false,
              name: 'back_refs_embedded',
              label: 'Back refs embedded',
              displayFields: [
                {
                  compact: false,
                  label: 'ID',
                  name: '_id',
                  type: 'TextDisplay',
                },
                {
                  compact: false,
                  name: 'name',
                  label: 'Name',
                  type: 'TextDisplay',
                },
              ],
              positionFieldName: 'field_demo_position',
              reference: {
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'back_ref_demo',
                  recordType: 'back_ref_demo',
                },
                type: 'ViaBackReference',
              },
              referenceDeleteAction: 'NullifyReference',
              references: [],
              reorderEnabled: false,
              sortOrder: 'Desc',
              type: 'EmbeddedReferenceList',
            },
            {
              compact: false,
              name: 'imageasset',
              label: 'Imageasset',
              type: 'ImageDisplay',
            },
            {
              compact: false,
              name: 'fileasset',
              label: 'Fileasset',
              type: 'FileDisplay',
            },
            {
              compact: false,
              name: 'deleted',
              label: 'Deleted',
              type: 'Boolean',
            },
          ],
          label: 'Field demo',
          references: [
            {
              compact: false,
              name: 'reference',
              label: 'Reference',
              displayFieldName: 'name',
              reference: {
                targetCmsRecord: { name: 'ref_demo', recordType: 'ref_demo' },
                type: 'DirectReference',
              },
              type: 'Reference',
            },
            {
              compact: false,
              name: 'back_refs',
              label: 'Back refs',
              displayFieldName: 'name',
              reference: {
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'back_ref_demo',
                  recordType: 'back_ref_demo',
                },
                type: 'ViaBackReference',
              },
              type: 'ReferenceList',
            },
            {
              compact: false,
              name: 'asso_refs',
              label: 'Asso refs',
              displayFieldName: 'name',
              reference: {
                associationRecordConfig: {
                  cmsRecord: {
                    name: 'field_asso_ref',
                    recordType: 'field_asso_ref',
                  },
                  referenceConfigPair: [
                    {
                      compact: false,
                      name: 'field_demo',
                      label: 'Field demo',
                      displayFieldName: '_id',
                      reference: {
                        targetCmsRecord: {
                          name: 'field_demo',
                          recordType: 'field_demo',
                        },
                        type: 'DirectReference',
                      },
                      type: 'Reference',
                    },
                    {
                      compact: false,
                      name: 'asso_ref_demo',
                      label: 'Asso ref demo',
                      displayFieldName: '_id',
                      reference: {
                        targetCmsRecord: {
                          name: 'asso_ref_demo',
                          recordType: 'asso_ref_demo',
                        },
                        type: 'DirectReference',
                      },
                      type: 'Reference',
                    },
                  ],
                },
                sourceReference: {
                  compact: false,
                  name: 'field_demo',
                  label: 'Field demo',
                  displayFieldName: '_id',
                  reference: {
                    targetCmsRecord: {
                      name: 'field_demo',
                      recordType: 'field_demo',
                    },
                    type: 'DirectReference',
                  },
                  type: 'Reference',
                },
                targetReference: {
                  compact: false,
                  name: 'asso_ref_demo',
                  label: 'Asso ref demo',
                  displayFieldName: '_id',
                  reference: {
                    targetCmsRecord: {
                      name: 'asso_ref_demo',
                      recordType: 'asso_ref_demo',
                    },
                    type: 'DirectReference',
                  },
                  type: 'Reference',
                },
                type: 'ViaAssociationRecord',
              },
              type: 'ReferenceList',
            },
            {
              compact: false,
              name: 'back_refs_embedded',
              label: 'Back refs embedded',
              displayFields: [
                {
                  compact: false,
                  label: 'ID',
                  name: '_id',
                  type: 'TextDisplay',
                },
                {
                  compact: false,
                  name: 'name',
                  label: 'Name',
                  type: 'TextDisplay',
                },
              ],
              positionFieldName: 'field_demo_position',
              reference: {
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'back_ref_demo',
                  recordType: 'back_ref_demo',
                },
                type: 'ViaBackReference',
              },
              referenceDeleteAction: 'NullifyReference',
              references: [],
              reorderEnabled: false,
              sortOrder: 'Desc',
              type: 'EmbeddedReferenceList',
            },
          ],
        },
      },
      field_demo_deleted: {
        cmsRecord: { name: 'field_demo_deleted', recordType: 'field_demo' },
        list: {
          actions: [],
          cmsRecord: { name: 'field_demo_deleted', recordType: 'field_demo' },
          defaultSort: { order: 'undefined' },
          fields: [
            { compact: true, label: 'ID', name: '_id', type: 'TextDisplay' },
            {
              compact: true,
              label: 'Created at',
              name: 'createdAt',
              type: 'DateTimeDisplay',
            },
            {
              compact: true,
              label: 'Updated at',
              name: 'updatedAt',
              type: 'DateTimeDisplay',
            },
            { compact: true, name: 'name', label: 'Name', type: 'TextDisplay' },
          ],
          itemActions: [],
          label: 'Field demo deleted',
          perPage: 25,
          predicates: [
            {
              name: 'deleted',
              type: 'EqualTo',
              value: true,
              valueType: 'JSONValue',
            },
          ],
          references: [],
        },
      },
      ref_demo: {
        cmsRecord: { name: 'ref_demo', recordType: 'ref_demo' },
        edit: {
          actions: [],
          cmsRecord: { name: 'ref_demo', recordType: 'ref_demo' },
          fields: [
            { compact: false, label: 'ID', name: '_id', type: 'TextDisplay' },
            {
              compact: false,
              name: 'name',
              label: 'Name',
              editable: true,
              type: 'TextInput',
            },
            {
              compact: false,
              name: 'field_demos',
              label: 'Field demos',
              editable: true,
              displayFieldName: 'name',
              reference: {
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'field_demo',
                  recordType: 'field_demo',
                },
                type: 'ViaBackReference',
              },
              type: 'ReferenceSelect',
            },
          ],
          label: 'Ref demo',
          references: [
            {
              compact: false,
              name: 'field_demos',
              label: 'Field demos',
              editable: true,
              displayFieldName: 'name',
              reference: {
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'field_demo',
                  recordType: 'field_demo',
                },
                type: 'ViaBackReference',
              },
              type: 'ReferenceSelect',
            },
          ],
        },
        new: {
          actions: [],
          cmsRecord: { name: 'ref_demo', recordType: 'ref_demo' },
          fields: [
            { compact: false, label: 'ID', name: '_id', type: 'TextDisplay' },
            {
              compact: false,
              name: 'name',
              label: 'Name',
              editable: true,
              type: 'TextInput',
            },
            {
              compact: false,
              name: 'field_demos',
              label: 'Field demos',
              editable: true,
              displayFieldName: 'name',
              reference: {
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'field_demo',
                  recordType: 'field_demo',
                },
                type: 'ViaBackReference',
              },
              type: 'ReferenceSelect',
            },
          ],
          label: 'Ref demo',
          references: [
            {
              compact: false,
              name: 'field_demos',
              label: 'Field demos',
              editable: true,
              displayFieldName: 'name',
              reference: {
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'field_demo',
                  recordType: 'field_demo',
                },
                type: 'ViaBackReference',
              },
              type: 'ReferenceSelect',
            },
          ],
        },
        show: {
          actions: [
            {
              href: '/record/{record.id}/edit',
              label: 'Edit',
              target: '',
              type: 'Link',
            },
          ],
          cmsRecord: { name: 'ref_demo', recordType: 'ref_demo' },
          fields: [
            { compact: false, label: 'ID', name: '_id', type: 'TextDisplay' },
            {
              compact: false,
              name: 'name',
              label: 'Name',
              type: 'TextDisplay',
            },
            {
              compact: false,
              name: 'field_references',
              label: 'Field references',
              displayFieldName: 'name',
              reference: {
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'field_demo',
                  recordType: 'field_demo',
                },
                type: 'ViaBackReference',
              },
              type: 'ReferenceList',
            },
          ],
          label: 'Ref demo',
          references: [
            {
              compact: false,
              name: 'field_references',
              label: 'Field references',
              displayFieldName: 'name',
              reference: {
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'field_demo',
                  recordType: 'field_demo',
                },
                type: 'ViaBackReference',
              },
              type: 'ReferenceList',
            },
          ],
        },
      },
      back_ref_demo: {
        cmsRecord: { name: 'back_ref_demo', recordType: 'back_ref_demo' },
        edit: {
          actions: [],
          cmsRecord: { name: 'back_ref_demo', recordType: 'back_ref_demo' },
          fields: [
            { compact: false, label: 'ID', name: '_id', type: 'TextDisplay' },
            {
              compact: false,
              name: 'reference',
              label: 'Reference',
              editable: true,
              displayFieldName: 'name',
              reference: {
                targetCmsRecord: {
                  name: 'field_demo',
                  recordType: 'field_demo',
                },
                type: 'DirectReference',
              },
              type: 'ReferenceDropdown',
            },
            {
              compact: false,
              name: 'name',
              label: 'Name',
              editable: true,
              type: 'TextInput',
            },
          ],
          label: 'Back ref demo',
          references: [
            {
              compact: false,
              name: 'reference',
              label: 'Reference',
              editable: true,
              displayFieldName: 'name',
              reference: {
                targetCmsRecord: {
                  name: 'field_demo',
                  recordType: 'field_demo',
                },
                type: 'DirectReference',
              },
              type: 'ReferenceDropdown',
            },
          ],
        },
        new: {
          actions: [],
          cmsRecord: { name: 'back_ref_demo', recordType: 'back_ref_demo' },
          fields: [
            { compact: false, label: 'ID', name: '_id', type: 'TextDisplay' },
            {
              compact: false,
              name: 'reference',
              label: 'Reference',
              editable: true,
              displayFieldName: 'name',
              reference: {
                targetCmsRecord: {
                  name: 'field_demo',
                  recordType: 'field_demo',
                },
                type: 'DirectReference',
              },
              type: 'ReferenceDropdown',
            },
            {
              compact: false,
              name: 'name',
              label: 'Name',
              editable: true,
              type: 'TextInput',
            },
          ],
          label: 'Back ref demo',
          references: [
            {
              compact: false,
              name: 'reference',
              label: 'Reference',
              editable: true,
              displayFieldName: 'name',
              reference: {
                targetCmsRecord: {
                  name: 'field_demo',
                  recordType: 'field_demo',
                },
                type: 'DirectReference',
              },
              type: 'ReferenceDropdown',
            },
          ],
        },
        show: {
          actions: [
            {
              href: '/record/{record.id}/edit',
              label: 'Edit',
              target: '',
              type: 'Link',
            },
          ],
          cmsRecord: { name: 'back_ref_demo', recordType: 'back_ref_demo' },
          fields: [
            { compact: false, label: 'ID', name: '_id', type: 'TextDisplay' },
            {
              compact: false,
              name: 'reference',
              label: 'Reference',
              displayFieldName: 'name',
              reference: {
                targetCmsRecord: {
                  name: 'field_demo',
                  recordType: 'field_demo',
                },
                type: 'DirectReference',
              },
              type: 'Reference',
            },
            {
              compact: false,
              name: 'name',
              label: 'Name',
              type: 'TextDisplay',
            },
          ],
          label: 'Back ref demo',
          references: [
            {
              compact: false,
              name: 'reference',
              label: 'Reference',
              displayFieldName: 'name',
              reference: {
                targetCmsRecord: {
                  name: 'field_demo',
                  recordType: 'field_demo',
                },
                type: 'DirectReference',
              },
              type: 'Reference',
            },
          ],
        },
      },
      asso_ref_demo: {
        cmsRecord: { name: 'asso_ref_demo', recordType: 'asso_ref_demo' },
        show: {
          actions: [
            {
              href: '/record/{record.id}/edit',
              label: 'Edit',
              target: '',
              type: 'Link',
            },
          ],
          cmsRecord: { name: 'asso_ref_demo', recordType: 'asso_ref_demo' },
          fields: [
            { compact: false, label: 'ID', name: '_id', type: 'TextDisplay' },
            {
              compact: false,
              name: 'name',
              label: 'Name',
              type: 'TextDisplay',
            },
          ],
          label: 'Asso ref demo',
          references: [],
        },
      },
    },
    site: [
      { type: 'UserManagement', label: 'USER' },
      { type: 'PushNotifications', label: 'PUSH' },
      { type: 'FileImport', label: 'FILE' },
      { type: 'Space', size: 'Medium' },
      { type: 'Record', name: 'field_demo', label: 'Field demo' },
      {
        type: 'Record',
        name: 'field_demo_deleted',
        label: 'Field demo deleted',
      },
      { type: 'Space', size: 'Large' },
    ],
    userManagement: { enabled: true },
  });
});
// tslint:enable:object-literal-sort-keys
