import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as process from 'process';
import { parseCmsConfig } from '..';

// tslint:disable:object-literal-sort-keys
test('parseCmsConfig should parse example config', () => {
  const text = fs.readFileSync(process.cwd() + '/example/dev-config.yaml', {
    encoding: 'utf-8',
  });
  const parsed = yaml.safeLoad(text);
  const config = parseCmsConfig(parsed);
  // console.log(JSON.stringify(config));
  expect(config).toEqual({
    associationRecordByName: {
      field_asso_ref: {
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
              predicates: [],
              targetCmsRecord: {
                name: 'field_demo',
                recordType: 'field_demo',
              },
              type: 'DirectReference',
            },
            type: 'reference',
          },
          {
            compact: false,
            name: 'asso_ref_demo',
            label: 'Asso ref demo',
            displayFieldName: '_id',
            reference: {
              predicates: [],
              targetCmsRecord: {
                name: 'asso_ref_demo',
                recordType: 'asso_ref_demo',
              },
              type: 'DirectReference',
            },
            type: 'reference',
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
        {
          name: 'name',
          label: 'Name',
          nullable: false,
          type: 'string',
        },
      ],
    },
    records: {
      field_demo: {
        cmsRecord: {
          name: 'field_demo',
          recordType: 'field_demo',
        },
        edit: {
          actions: [],
          cmsRecord: {
            name: 'field_demo',
            recordType: 'field_demo',
          },
          fields: [
            {
              compact: false,
              label: 'ID',
              name: '_id',
              type: 'text_display',
            },
            {
              compact: false,
              label: 'Created at',
              name: 'createdAt',
              type: 'date_time_display',
            },
            {
              compact: false,
              label: 'Updated at',
              name: 'updatedAt',
              type: 'date_time_display',
            },
            {
              compact: false,
              name: 'name',
              label: 'Name',
              validations: [
                {
                  expression:
                    'not (value != null and substring(value, 0, 1) != "_") or (length(value) < 10)',
                  message: 'Length should be smaller than 10.',
                },
                {
                  expression:
                    'not (value != null) or (lower(value) not in ("admin", "god"))',
                  message: 'Reserved name.',
                },
              ],
              editable: true,
              type: 'text_input',
            },
            {
              compact: false,
              name: 'textarea',
              label: 'Textarea',
              editable: true,
              type: 'text_area',
            },
            {
              compact: false,
              name: 'dropdown',
              label: 'Dropdown',
              editable: true,
              customOption: {
                enabled: true,
                label: 'Others',
              },
              defaultValue: 'A',
              nullOption: {
                enabled: false,
                label: 'Undefined',
              },
              options: [
                {
                  label: 'Option A',
                  value: 'A',
                },
                {
                  label: 'Option B',
                  value: 'B',
                },
                {
                  label: 'Option S',
                  value: 'S',
                },
              ],
              type: 'dropdown',
            },
            {
              compact: false,
              name: 'wysiwyg',
              label: 'Wysiwyg',
              editable: true,
              type: 'wysiwyg',
            },
            {
              compact: false,
              name: 'datetime',
              label: 'Datetime',
              type: 'date_time_picker',
            },
            {
              compact: false,
              name: 'boolean',
              label: 'Boolean',
              editable: true,
              type: 'boolean',
            },
            {
              compact: false,
              name: 'integer',
              label: 'Integer',
              editable: true,
              type: 'integer_input',
            },
            {
              compact: false,
              name: 'number',
              label: 'Number',
              editable: true,
              type: 'float_input',
            },
            {
              compact: false,
              name: 'reference',
              label: 'Reference',
              editable: true,
              addButton: {
                enabled: true,
                label: 'Create New Reference',
              },
              displayFieldName: 'name',
              reference: {
                predicates: [
                  {
                    name: 'name',
                    type: 'not_equal_to',
                    value: '',
                    valueType: 'json_value',
                  },
                ],
                targetCmsRecord: {
                  name: 'ref_demo',
                  recordType: 'ref_demo',
                },
                type: 'DirectReference',
              },
              type: 'reference_dropdown',
            },
            {
              compact: false,
              name: 'back_refs',
              label: 'Back refs',
              editable: true,
              displayFieldName: 'name',
              reference: {
                predicates: [
                  {
                    name: 'name',
                    type: 'not_equal_to',
                    value: '',
                    valueType: 'json_value',
                  },
                ],
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'back_ref_demo',
                  recordType: 'back_ref_demo',
                },
                type: 'ViaBackReference',
              },
              type: 'reference_select',
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
                  type: 'text_display',
                },
                {
                  compact: false,
                  name: 'name',
                  label: 'Name',
                  editable: true,
                  type: 'text_input',
                },
              ],
              deleteButton: {
                enabled: false,
              },
              positionFieldName: 'field_demo_position',
              reference: {
                predicates: [],
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'back_ref_demo',
                  recordType: 'back_ref_demo',
                },
                type: 'ViaBackReference',
              },
              referenceDeleteAction: 'nullify_reference',
              references: [],
              reorderEnabled: false,
              sortOrder: 'Asc',
              type: 'embedded_reference_list',
            },
            {
              compact: false,
              name: 'asso_refs_embedded',
              label: 'Asso refs embedded',
              editable: true,
              displayFields: [
                {
                  compact: false,
                  label: 'ID',
                  name: '_id',
                  type: 'text_display',
                },
                {
                  compact: false,
                  name: 'name',
                  label: 'Name',
                  editable: true,
                  type: 'text_input',
                },
              ],
              deleteButton: {
                enabled: false,
              },
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
                        predicates: [],
                        targetCmsRecord: {
                          name: 'field_demo',
                          recordType: 'field_demo',
                        },
                        type: 'DirectReference',
                      },
                      type: 'reference',
                    },
                    {
                      compact: false,
                      name: 'asso_ref_demo',
                      label: 'Asso ref demo',
                      displayFieldName: '_id',
                      reference: {
                        predicates: [],
                        targetCmsRecord: {
                          name: 'asso_ref_demo',
                          recordType: 'asso_ref_demo',
                        },
                        type: 'DirectReference',
                      },
                      type: 'reference',
                    },
                  ],
                },
                predicates: [],
                sourceReference: {
                  compact: false,
                  name: 'field_demo',
                  label: 'Field demo',
                  displayFieldName: '_id',
                  reference: {
                    predicates: [],
                    targetCmsRecord: {
                      name: 'field_demo',
                      recordType: 'field_demo',
                    },
                    type: 'DirectReference',
                  },
                  type: 'reference',
                },
                targetReference: {
                  compact: false,
                  name: 'asso_ref_demo',
                  label: 'Asso ref demo',
                  displayFieldName: '_id',
                  reference: {
                    predicates: [],
                    targetCmsRecord: {
                      name: 'asso_ref_demo',
                      recordType: 'asso_ref_demo',
                    },
                    type: 'DirectReference',
                  },
                  type: 'reference',
                },
                type: 'ViaAssociationRecord',
              },
              referenceDeleteAction: 'nullify_reference',
              references: [],
              reorderEnabled: false,
              sortOrder: 'Asc',
              type: 'embedded_reference_list',
            },
            {
              compact: false,
              name: 'imageasset',
              label: 'Imageasset',
              editable: true,
              nullable: true,
              type: 'image_uploader',
            },
            {
              compact: false,
              name: 'fileasset',
              label: 'Fileasset',
              validations: [
                {
                  expression:
                    '(typeof(value) not in ("string", "array") or length(value) > 0) and value != null',
                  message: 'Required field.',
                },
                {
                  expression:
                    'not (value != null) or (regex(get(value, "content_type"), "^(image|video)"))',
                },
              ],
              editable: true,
              accept: '',
              nullable: true,
              type: 'file_uploader',
            },
            {
              compact: false,
              name: 'deleted',
              label: 'Deleted',
              editable: true,
              defaultValue: false,
              type: 'boolean',
            },
          ],
          label: 'Field demo',
          references: [
            {
              compact: false,
              name: 'reference',
              label: 'Reference',
              editable: true,
              addButton: {
                enabled: true,
                label: 'Create New Reference',
              },
              displayFieldName: 'name',
              reference: {
                predicates: [
                  {
                    name: 'name',
                    type: 'not_equal_to',
                    value: '',
                    valueType: 'json_value',
                  },
                ],
                targetCmsRecord: {
                  name: 'ref_demo',
                  recordType: 'ref_demo',
                },
                type: 'DirectReference',
              },
              type: 'reference_dropdown',
            },
            {
              compact: false,
              name: 'back_refs',
              label: 'Back refs',
              editable: true,
              displayFieldName: 'name',
              reference: {
                predicates: [
                  {
                    name: 'name',
                    type: 'not_equal_to',
                    value: '',
                    valueType: 'json_value',
                  },
                ],
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'back_ref_demo',
                  recordType: 'back_ref_demo',
                },
                type: 'ViaBackReference',
              },
              type: 'reference_select',
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
                  type: 'text_display',
                },
                {
                  compact: false,
                  name: 'name',
                  label: 'Name',
                  editable: true,
                  type: 'text_input',
                },
              ],
              deleteButton: {
                enabled: false,
              },
              positionFieldName: 'field_demo_position',
              reference: {
                predicates: [],
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'back_ref_demo',
                  recordType: 'back_ref_demo',
                },
                type: 'ViaBackReference',
              },
              referenceDeleteAction: 'nullify_reference',
              references: [],
              reorderEnabled: false,
              sortOrder: 'Asc',
              type: 'embedded_reference_list',
            },
            {
              compact: false,
              name: 'asso_refs_embedded',
              label: 'Asso refs embedded',
              editable: true,
              displayFields: [
                {
                  compact: false,
                  label: 'ID',
                  name: '_id',
                  type: 'text_display',
                },
                {
                  compact: false,
                  name: 'name',
                  label: 'Name',
                  editable: true,
                  type: 'text_input',
                },
              ],
              deleteButton: {
                enabled: false,
              },
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
                        predicates: [],
                        targetCmsRecord: {
                          name: 'field_demo',
                          recordType: 'field_demo',
                        },
                        type: 'DirectReference',
                      },
                      type: 'reference',
                    },
                    {
                      compact: false,
                      name: 'asso_ref_demo',
                      label: 'Asso ref demo',
                      displayFieldName: '_id',
                      reference: {
                        predicates: [],
                        targetCmsRecord: {
                          name: 'asso_ref_demo',
                          recordType: 'asso_ref_demo',
                        },
                        type: 'DirectReference',
                      },
                      type: 'reference',
                    },
                  ],
                },
                predicates: [],
                sourceReference: {
                  compact: false,
                  name: 'field_demo',
                  label: 'Field demo',
                  displayFieldName: '_id',
                  reference: {
                    predicates: [],
                    targetCmsRecord: {
                      name: 'field_demo',
                      recordType: 'field_demo',
                    },
                    type: 'DirectReference',
                  },
                  type: 'reference',
                },
                targetReference: {
                  compact: false,
                  name: 'asso_ref_demo',
                  label: 'Asso ref demo',
                  displayFieldName: '_id',
                  reference: {
                    predicates: [],
                    targetCmsRecord: {
                      name: 'asso_ref_demo',
                      recordType: 'asso_ref_demo',
                    },
                    type: 'DirectReference',
                  },
                  type: 'reference',
                },
                type: 'ViaAssociationRecord',
              },
              referenceDeleteAction: 'nullify_reference',
              references: [],
              reorderEnabled: false,
              sortOrder: 'Asc',
              type: 'embedded_reference_list',
            },
          ],
        },
        list: {
          actions: [
            {
              href: '/records/{cmsRecord.name}/new',
              label: 'Add',
              target: '',
              type: 'link',
            },
            {
              label: 'Import records',
              name: 'import-field-demo',
              type: 'import',
            },
            {
              atomic: true,
              label: 'Import (Atomic)',
              name: 'import-field-demo',
              type: 'import',
            },
            {
              label: 'Import with asset',
              name: 'import-asset-demo',
              type: 'import',
            },
            {
              label: 'Export records',
              name: 'export-field-demo',
              type: 'export',
            },
          ],
          cmsRecord: {
            name: 'field_demo',
            recordType: 'field_demo',
          },
          defaultSort: {
            fieldName: 'name',
            order: 'descending',
          },
          fields: [
            {
              compact: true,
              label: 'ID',
              name: '_id',
              type: 'text_display',
            },
            {
              compact: true,
              label: 'Created at',
              name: 'createdAt',
              type: 'date_time_display',
            },
            {
              compact: true,
              label: 'Updated at',
              name: 'updatedAt',
              type: 'date_time_display',
            },
            {
              compact: true,
              name: 'name',
              label: 'Name',
              type: 'text_display',
            },
            {
              compact: true,
              name: 'textarea',
              label: 'Textarea',
              type: 'text_area',
            },
            {
              compact: true,
              name: 'dropdown',
              label: 'Dropdown',
              type: 'text_display',
            },
            {
              compact: true,
              name: 'wysiwyg',
              label: 'Wysiwyg',
              type: 'wysiwyg',
            },
            {
              compact: true,
              name: 'datetime',
              label: 'Datetime',
              type: 'date_time_display',
            },
            {
              compact: true,
              name: 'boolean',
              label: 'Boolean',
              type: 'boolean',
            },
            {
              compact: true,
              name: 'integer',
              label: 'Integer',
              type: 'integer_display',
            },
            {
              compact: true,
              name: 'number',
              label: 'Number',
              type: 'float_display',
            },
            {
              compact: true,
              name: 'reference',
              label: 'Reference',
              displayFieldName: 'name',
              reference: {
                predicates: [
                  {
                    name: 'name',
                    type: 'not_equal_to',
                    value: '',
                    valueType: 'json_value',
                  },
                ],
                targetCmsRecord: {
                  name: 'ref_demo',
                  recordType: 'ref_demo',
                },
                type: 'DirectReference',
              },
              type: 'reference',
            },
            {
              compact: true,
              name: 'back_refs',
              label: 'Back refs',
              displayFieldName: 'name',
              reference: {
                predicates: [
                  {
                    name: 'name',
                    type: 'not_equal_to',
                    value: '',
                    valueType: 'json_value',
                  },
                ],
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'back_ref_demo',
                  recordType: 'back_ref_demo',
                },
                type: 'ViaBackReference',
              },
              type: 'reference_list',
            },
            {
              compact: true,
              name: 'imageasset',
              label: 'Imageasset',
              type: 'image_display',
            },
            {
              compact: true,
              name: 'fileasset',
              label: 'Fileasset',
              type: 'file_display',
            },
          ],
          filters: [
            {
              name: '_id',
              label: 'ID',
              nullable: false,
              type: 'string',
            },
            {
              name: '_created_at',
              label: 'CreatedAt',
              nullable: false,
              type: 'date_time',
            },
            {
              name: '_updated_at',
              label: 'UpdatedAt',
              nullable: false,
              type: 'date_time',
            },
            {
              name: 'name',
              label: 'Name',
              nullable: false,
              type: 'string',
            },
            {
              name: 'datetime',
              label: 'Datetime',
              nullable: false,
              type: 'date_time',
            },
            {
              name: 'boolean',
              label: 'Boolean',
              nullable: false,
              type: 'boolean',
            },
            {
              name: 'integer',
              label: 'Integer',
              nullable: false,
              type: 'number',
            },
            {
              name: 'number',
              label: 'Number',
              nullable: false,
              type: 'number',
            },
            {
              name: 'reference',
              label: 'Reference',
              nullable: true,
              displayFieldName: 'name',
              predicates: [
                {
                  name: 'name',
                  type: 'not_equal_to',
                  value: '',
                  valueType: 'json_value',
                },
              ],
              targetCmsRecord: {
                name: 'ref_demo',
                recordType: 'ref_demo',
              },
              type: 'reference',
            },
          ],
          itemActions: [
            {
              href: '/record/{cmsRecord.name}/{record._id}',
              label: 'Show',
              target: '',
              type: 'link',
            },
            {
              href: '/record/{cmsRecord.name}/{record._id}/edit',
              label: 'Edit',
              target: '',
              type: 'link',
            },
            {
              href: 'https://www.google.com/search?q={record.name}',
              label: 'Search',
              target: '_blank',
              type: 'link',
            },
          ],
          label: 'Field demo',
          perPage: 25,
          predicates: [
            {
              name: 'deleted',
              type: 'not_equal_to',
              value: true,
              valueType: 'json_value',
            },
          ],
          references: [
            {
              compact: true,
              name: 'reference',
              label: 'Reference',
              displayFieldName: 'name',
              reference: {
                predicates: [
                  {
                    name: 'name',
                    type: 'not_equal_to',
                    value: '',
                    valueType: 'json_value',
                  },
                ],
                targetCmsRecord: {
                  name: 'ref_demo',
                  recordType: 'ref_demo',
                },
                type: 'DirectReference',
              },
              type: 'reference',
            },
            {
              compact: true,
              name: 'back_refs',
              label: 'Back refs',
              displayFieldName: 'name',
              reference: {
                predicates: [
                  {
                    name: 'name',
                    type: 'not_equal_to',
                    value: '',
                    valueType: 'json_value',
                  },
                ],
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'back_ref_demo',
                  recordType: 'back_ref_demo',
                },
                type: 'ViaBackReference',
              },
              type: 'reference_list',
            },
          ],
        },
        new: {
          actions: [],
          cmsRecord: {
            name: 'field_demo',
            recordType: 'field_demo',
          },
          fields: [
            {
              compact: false,
              label: 'ID',
              name: '_id',
              type: 'text_display',
            },
            {
              compact: false,
              label: 'Created at',
              name: 'createdAt',
              type: 'date_time_display',
            },
            {
              compact: false,
              label: 'Updated at',
              name: 'updatedAt',
              type: 'date_time_display',
            },
            {
              compact: false,
              name: 'name',
              label: 'Name',
              editable: true,
              type: 'text_input',
            },
            {
              compact: false,
              name: 'textarea',
              label: 'Textarea',
              editable: true,
              type: 'text_area',
            },
            {
              compact: false,
              name: 'dropdown',
              label: 'Dropdown',
              editable: true,
              customOption: {
                enabled: true,
                label: 'Others',
              },
              defaultValue: 'A',
              nullOption: {
                enabled: false,
                label: 'Undefined',
              },
              options: [
                {
                  label: 'Option A',
                  value: 'A',
                },
                {
                  label: 'Option B',
                  value: 'B',
                },
                {
                  label: 'Option S',
                  value: 'S',
                },
              ],
              type: 'dropdown',
            },
            {
              compact: false,
              name: 'wysiwyg',
              label: 'Wysiwyg',
              editable: true,
              type: 'wysiwyg',
            },
            {
              compact: false,
              name: 'datetime',
              label: 'Datetime',
              type: 'date_time_picker',
            },
            {
              compact: false,
              name: 'boolean',
              label: 'Boolean',
              editable: true,
              type: 'boolean',
            },
            {
              compact: false,
              name: 'integer',
              label: 'Integer',
              editable: true,
              type: 'integer_input',
            },
            {
              compact: false,
              name: 'number',
              label: 'Number',
              editable: true,
              type: 'float_input',
            },
            {
              compact: false,
              name: 'reference',
              label: 'Reference',
              editable: true,
              addButton: {
                enabled: false,
                label: '',
              },
              displayFieldName: 'name',
              reference: {
                predicates: [],
                targetCmsRecord: {
                  name: 'ref_demo',
                  recordType: 'ref_demo',
                },
                type: 'DirectReference',
              },
              type: 'reference_dropdown',
            },
            {
              compact: false,
              name: 'back_refs',
              label: 'Back refs',
              editable: true,
              displayFieldName: 'name',
              reference: {
                predicates: [],
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'back_ref_demo',
                  recordType: 'back_ref_demo',
                },
                type: 'ViaBackReference',
              },
              type: 'reference_select',
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
                  type: 'text_display',
                },
                {
                  compact: false,
                  name: 'name',
                  label: 'Name',
                  editable: true,
                  type: 'text_input',
                },
              ],
              deleteButton: {
                enabled: false,
              },
              positionFieldName: 'field_demo_position',
              reference: {
                predicates: [],
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'back_ref_demo',
                  recordType: 'back_ref_demo',
                },
                type: 'ViaBackReference',
              },
              referenceDeleteAction: 'nullify_reference',
              references: [],
              reorderEnabled: false,
              sortOrder: 'Asc',
              type: 'embedded_reference_list',
            },
            {
              compact: false,
              name: 'asso_refs_embedded',
              label: 'Asso refs embedded',
              editable: true,
              displayFields: [
                {
                  compact: false,
                  label: 'ID',
                  name: '_id',
                  type: 'text_display',
                },
                {
                  compact: false,
                  name: 'name',
                  label: 'Name',
                  editable: true,
                  type: 'text_input',
                },
              ],
              deleteButton: {
                enabled: false,
              },
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
                        predicates: [],
                        targetCmsRecord: {
                          name: 'field_demo',
                          recordType: 'field_demo',
                        },
                        type: 'DirectReference',
                      },
                      type: 'reference',
                    },
                    {
                      compact: false,
                      name: 'asso_ref_demo',
                      label: 'Asso ref demo',
                      displayFieldName: '_id',
                      reference: {
                        predicates: [],
                        targetCmsRecord: {
                          name: 'asso_ref_demo',
                          recordType: 'asso_ref_demo',
                        },
                        type: 'DirectReference',
                      },
                      type: 'reference',
                    },
                  ],
                },
                predicates: [],
                sourceReference: {
                  compact: false,
                  name: 'field_demo',
                  label: 'Field demo',
                  displayFieldName: '_id',
                  reference: {
                    predicates: [],
                    targetCmsRecord: {
                      name: 'field_demo',
                      recordType: 'field_demo',
                    },
                    type: 'DirectReference',
                  },
                  type: 'reference',
                },
                targetReference: {
                  compact: false,
                  name: 'asso_ref_demo',
                  label: 'Asso ref demo',
                  displayFieldName: '_id',
                  reference: {
                    predicates: [],
                    targetCmsRecord: {
                      name: 'asso_ref_demo',
                      recordType: 'asso_ref_demo',
                    },
                    type: 'DirectReference',
                  },
                  type: 'reference',
                },
                type: 'ViaAssociationRecord',
              },
              referenceDeleteAction: 'nullify_reference',
              references: [],
              reorderEnabled: false,
              sortOrder: 'Asc',
              type: 'embedded_reference_list',
            },
            {
              compact: false,
              name: 'imageasset',
              label: 'Imageasset',
              editable: true,
              nullable: true,
              type: 'image_uploader',
            },
            {
              compact: false,
              name: 'fileasset',
              label: 'Fileasset',
              editable: true,
              accept: '',
              nullable: true,
              type: 'file_uploader',
            },
            {
              compact: false,
              name: 'deleted',
              label: 'Deleted',
              editable: true,
              defaultValue: false,
              type: 'boolean',
            },
          ],
          label: 'Field demo',
          references: [
            {
              compact: false,
              name: 'reference',
              label: 'Reference',
              editable: true,
              addButton: {
                enabled: false,
                label: '',
              },
              displayFieldName: 'name',
              reference: {
                predicates: [],
                targetCmsRecord: {
                  name: 'ref_demo',
                  recordType: 'ref_demo',
                },
                type: 'DirectReference',
              },
              type: 'reference_dropdown',
            },
            {
              compact: false,
              name: 'back_refs',
              label: 'Back refs',
              editable: true,
              displayFieldName: 'name',
              reference: {
                predicates: [],
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'back_ref_demo',
                  recordType: 'back_ref_demo',
                },
                type: 'ViaBackReference',
              },
              type: 'reference_select',
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
                  type: 'text_display',
                },
                {
                  compact: false,
                  name: 'name',
                  label: 'Name',
                  editable: true,
                  type: 'text_input',
                },
              ],
              deleteButton: {
                enabled: false,
              },
              positionFieldName: 'field_demo_position',
              reference: {
                predicates: [],
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'back_ref_demo',
                  recordType: 'back_ref_demo',
                },
                type: 'ViaBackReference',
              },
              referenceDeleteAction: 'nullify_reference',
              references: [],
              reorderEnabled: false,
              sortOrder: 'Asc',
              type: 'embedded_reference_list',
            },
            {
              compact: false,
              name: 'asso_refs_embedded',
              label: 'Asso refs embedded',
              editable: true,
              displayFields: [
                {
                  compact: false,
                  label: 'ID',
                  name: '_id',
                  type: 'text_display',
                },
                {
                  compact: false,
                  name: 'name',
                  label: 'Name',
                  editable: true,
                  type: 'text_input',
                },
              ],
              deleteButton: {
                enabled: false,
              },
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
                        predicates: [],
                        targetCmsRecord: {
                          name: 'field_demo',
                          recordType: 'field_demo',
                        },
                        type: 'DirectReference',
                      },
                      type: 'reference',
                    },
                    {
                      compact: false,
                      name: 'asso_ref_demo',
                      label: 'Asso ref demo',
                      displayFieldName: '_id',
                      reference: {
                        predicates: [],
                        targetCmsRecord: {
                          name: 'asso_ref_demo',
                          recordType: 'asso_ref_demo',
                        },
                        type: 'DirectReference',
                      },
                      type: 'reference',
                    },
                  ],
                },
                predicates: [],
                sourceReference: {
                  compact: false,
                  name: 'field_demo',
                  label: 'Field demo',
                  displayFieldName: '_id',
                  reference: {
                    predicates: [],
                    targetCmsRecord: {
                      name: 'field_demo',
                      recordType: 'field_demo',
                    },
                    type: 'DirectReference',
                  },
                  type: 'reference',
                },
                targetReference: {
                  compact: false,
                  name: 'asso_ref_demo',
                  label: 'Asso ref demo',
                  displayFieldName: '_id',
                  reference: {
                    predicates: [],
                    targetCmsRecord: {
                      name: 'asso_ref_demo',
                      recordType: 'asso_ref_demo',
                    },
                    type: 'DirectReference',
                  },
                  type: 'reference',
                },
                type: 'ViaAssociationRecord',
              },
              referenceDeleteAction: 'nullify_reference',
              references: [],
              reorderEnabled: false,
              sortOrder: 'Asc',
              type: 'embedded_reference_list',
            },
          ],
        },
        show: {
          actions: [
            {
              href: '/record/{cmsRecord.name}/{record._id}/edit',
              label: 'Edit',
              target: '',
              type: 'link',
            },
          ],
          cmsRecord: {
            name: 'field_demo',
            recordType: 'field_demo',
          },
          fields: [
            {
              compact: false,
              label: 'ID',
              name: '_id',
              type: 'text_display',
            },
            {
              compact: false,
              label: 'Created at',
              name: 'createdAt',
              type: 'date_time_display',
            },
            {
              compact: false,
              label: 'Updated at',
              name: 'updatedAt',
              type: 'date_time_display',
            },
            {
              compact: false,
              name: 'name',
              label: 'Name',
              type: 'text_display',
            },
            {
              compact: false,
              name: 'textarea',
              label: 'Textarea',
              type: 'text_area',
            },
            {
              compact: false,
              name: 'dropdown',
              label: 'Dropdown',
              type: 'text_display',
            },
            {
              compact: false,
              name: 'wysiwyg',
              label: 'Wysiwyg',
              type: 'wysiwyg',
            },
            {
              compact: false,
              name: 'datetime',
              label: 'Datetime',
              timezone: 'America/New_York',
              type: 'date_time_display',
            },
            {
              compact: false,
              name: 'boolean',
              label: 'Boolean',
              type: 'boolean',
            },
            {
              compact: false,
              name: 'integer',
              label: 'Integer',
              type: 'integer_display',
            },
            {
              compact: false,
              name: 'number',
              label: 'Number',
              type: 'float_display',
            },
            {
              compact: false,
              name: 'reference',
              label: 'Reference',
              displayFieldName: 'name',
              reference: {
                predicates: [
                  {
                    name: 'name',
                    type: 'not_equal_to',
                    value: '',
                    valueType: 'json_value',
                  },
                ],
                targetCmsRecord: {
                  name: 'ref_demo',
                  recordType: 'ref_demo',
                },
                type: 'DirectReference',
              },
              type: 'reference',
            },
            {
              compact: false,
              name: 'back_refs',
              label: 'Back refs',
              displayFieldName: 'name',
              reference: {
                predicates: [
                  {
                    name: 'name',
                    type: 'not_equal_to',
                    value: '',
                    valueType: 'json_value',
                  },
                ],
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'back_ref_demo',
                  recordType: 'back_ref_demo',
                },
                type: 'ViaBackReference',
              },
              type: 'reference_list',
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
                        predicates: [],
                        targetCmsRecord: {
                          name: 'field_demo',
                          recordType: 'field_demo',
                        },
                        type: 'DirectReference',
                      },
                      type: 'reference',
                    },
                    {
                      compact: false,
                      name: 'asso_ref_demo',
                      label: 'Asso ref demo',
                      displayFieldName: '_id',
                      reference: {
                        predicates: [],
                        targetCmsRecord: {
                          name: 'asso_ref_demo',
                          recordType: 'asso_ref_demo',
                        },
                        type: 'DirectReference',
                      },
                      type: 'reference',
                    },
                  ],
                },
                predicates: [
                  {
                    name: 'name',
                    type: 'not_equal_to',
                    value: '',
                    valueType: 'json_value',
                  },
                ],
                sourceReference: {
                  compact: false,
                  name: 'field_demo',
                  label: 'Field demo',
                  displayFieldName: '_id',
                  reference: {
                    predicates: [],
                    targetCmsRecord: {
                      name: 'field_demo',
                      recordType: 'field_demo',
                    },
                    type: 'DirectReference',
                  },
                  type: 'reference',
                },
                targetReference: {
                  compact: false,
                  name: 'asso_ref_demo',
                  label: 'Asso ref demo',
                  displayFieldName: '_id',
                  reference: {
                    predicates: [],
                    targetCmsRecord: {
                      name: 'asso_ref_demo',
                      recordType: 'asso_ref_demo',
                    },
                    type: 'DirectReference',
                  },
                  type: 'reference',
                },
                type: 'ViaAssociationRecord',
              },
              type: 'reference_list',
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
                  type: 'text_display',
                },
                {
                  compact: false,
                  name: 'name',
                  label: 'Name',
                  type: 'text_display',
                },
              ],
              deleteButton: {
                enabled: false,
              },
              positionFieldName: 'field_demo_position',
              reference: {
                predicates: [],
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'back_ref_demo',
                  recordType: 'back_ref_demo',
                },
                type: 'ViaBackReference',
              },
              referenceDeleteAction: 'nullify_reference',
              references: [],
              reorderEnabled: false,
              sortOrder: 'Desc',
              type: 'embedded_reference_list',
            },
            {
              compact: false,
              name: 'asso_refs_embedded',
              label: 'Asso refs embedded',
              displayFields: [
                {
                  compact: false,
                  label: 'ID',
                  name: '_id',
                  type: 'text_display',
                },
                {
                  compact: false,
                  name: 'name',
                  label: 'Name',
                  type: 'text_display',
                },
              ],
              deleteButton: {
                enabled: false,
              },
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
                        predicates: [],
                        targetCmsRecord: {
                          name: 'field_demo',
                          recordType: 'field_demo',
                        },
                        type: 'DirectReference',
                      },
                      type: 'reference',
                    },
                    {
                      compact: false,
                      name: 'asso_ref_demo',
                      label: 'Asso ref demo',
                      displayFieldName: '_id',
                      reference: {
                        predicates: [],
                        targetCmsRecord: {
                          name: 'asso_ref_demo',
                          recordType: 'asso_ref_demo',
                        },
                        type: 'DirectReference',
                      },
                      type: 'reference',
                    },
                  ],
                },
                predicates: [],
                sourceReference: {
                  compact: false,
                  name: 'field_demo',
                  label: 'Field demo',
                  displayFieldName: '_id',
                  reference: {
                    predicates: [],
                    targetCmsRecord: {
                      name: 'field_demo',
                      recordType: 'field_demo',
                    },
                    type: 'DirectReference',
                  },
                  type: 'reference',
                },
                targetReference: {
                  compact: false,
                  name: 'asso_ref_demo',
                  label: 'Asso ref demo',
                  displayFieldName: '_id',
                  reference: {
                    predicates: [],
                    targetCmsRecord: {
                      name: 'asso_ref_demo',
                      recordType: 'asso_ref_demo',
                    },
                    type: 'DirectReference',
                  },
                  type: 'reference',
                },
                type: 'ViaAssociationRecord',
              },
              referenceDeleteAction: 'nullify_reference',
              references: [],
              reorderEnabled: false,
              sortOrder: 'Asc',
              type: 'embedded_reference_list',
            },
            {
              compact: false,
              name: 'imageasset',
              label: 'Imageasset',
              type: 'image_display',
            },
            {
              compact: false,
              name: 'fileasset',
              label: 'Fileasset',
              type: 'file_display',
            },
            {
              compact: false,
              name: 'deleted',
              label: 'Deleted',
              type: 'boolean',
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
                predicates: [
                  {
                    name: 'name',
                    type: 'not_equal_to',
                    value: '',
                    valueType: 'json_value',
                  },
                ],
                targetCmsRecord: {
                  name: 'ref_demo',
                  recordType: 'ref_demo',
                },
                type: 'DirectReference',
              },
              type: 'reference',
            },
            {
              compact: false,
              name: 'back_refs',
              label: 'Back refs',
              displayFieldName: 'name',
              reference: {
                predicates: [
                  {
                    name: 'name',
                    type: 'not_equal_to',
                    value: '',
                    valueType: 'json_value',
                  },
                ],
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'back_ref_demo',
                  recordType: 'back_ref_demo',
                },
                type: 'ViaBackReference',
              },
              type: 'reference_list',
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
                        predicates: [],
                        targetCmsRecord: {
                          name: 'field_demo',
                          recordType: 'field_demo',
                        },
                        type: 'DirectReference',
                      },
                      type: 'reference',
                    },
                    {
                      compact: false,
                      name: 'asso_ref_demo',
                      label: 'Asso ref demo',
                      displayFieldName: '_id',
                      reference: {
                        predicates: [],
                        targetCmsRecord: {
                          name: 'asso_ref_demo',
                          recordType: 'asso_ref_demo',
                        },
                        type: 'DirectReference',
                      },
                      type: 'reference',
                    },
                  ],
                },
                predicates: [
                  {
                    name: 'name',
                    type: 'not_equal_to',
                    value: '',
                    valueType: 'json_value',
                  },
                ],
                sourceReference: {
                  compact: false,
                  name: 'field_demo',
                  label: 'Field demo',
                  displayFieldName: '_id',
                  reference: {
                    predicates: [],
                    targetCmsRecord: {
                      name: 'field_demo',
                      recordType: 'field_demo',
                    },
                    type: 'DirectReference',
                  },
                  type: 'reference',
                },
                targetReference: {
                  compact: false,
                  name: 'asso_ref_demo',
                  label: 'Asso ref demo',
                  displayFieldName: '_id',
                  reference: {
                    predicates: [],
                    targetCmsRecord: {
                      name: 'asso_ref_demo',
                      recordType: 'asso_ref_demo',
                    },
                    type: 'DirectReference',
                  },
                  type: 'reference',
                },
                type: 'ViaAssociationRecord',
              },
              type: 'reference_list',
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
                  type: 'text_display',
                },
                {
                  compact: false,
                  name: 'name',
                  label: 'Name',
                  type: 'text_display',
                },
              ],
              deleteButton: {
                enabled: false,
              },
              positionFieldName: 'field_demo_position',
              reference: {
                predicates: [],
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'back_ref_demo',
                  recordType: 'back_ref_demo',
                },
                type: 'ViaBackReference',
              },
              referenceDeleteAction: 'nullify_reference',
              references: [],
              reorderEnabled: false,
              sortOrder: 'Desc',
              type: 'embedded_reference_list',
            },
            {
              compact: false,
              name: 'asso_refs_embedded',
              label: 'Asso refs embedded',
              displayFields: [
                {
                  compact: false,
                  label: 'ID',
                  name: '_id',
                  type: 'text_display',
                },
                {
                  compact: false,
                  name: 'name',
                  label: 'Name',
                  type: 'text_display',
                },
              ],
              deleteButton: {
                enabled: false,
              },
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
                        predicates: [],
                        targetCmsRecord: {
                          name: 'field_demo',
                          recordType: 'field_demo',
                        },
                        type: 'DirectReference',
                      },
                      type: 'reference',
                    },
                    {
                      compact: false,
                      name: 'asso_ref_demo',
                      label: 'Asso ref demo',
                      displayFieldName: '_id',
                      reference: {
                        predicates: [],
                        targetCmsRecord: {
                          name: 'asso_ref_demo',
                          recordType: 'asso_ref_demo',
                        },
                        type: 'DirectReference',
                      },
                      type: 'reference',
                    },
                  ],
                },
                predicates: [],
                sourceReference: {
                  compact: false,
                  name: 'field_demo',
                  label: 'Field demo',
                  displayFieldName: '_id',
                  reference: {
                    predicates: [],
                    targetCmsRecord: {
                      name: 'field_demo',
                      recordType: 'field_demo',
                    },
                    type: 'DirectReference',
                  },
                  type: 'reference',
                },
                targetReference: {
                  compact: false,
                  name: 'asso_ref_demo',
                  label: 'Asso ref demo',
                  displayFieldName: '_id',
                  reference: {
                    predicates: [],
                    targetCmsRecord: {
                      name: 'asso_ref_demo',
                      recordType: 'asso_ref_demo',
                    },
                    type: 'DirectReference',
                  },
                  type: 'reference',
                },
                type: 'ViaAssociationRecord',
              },
              referenceDeleteAction: 'nullify_reference',
              references: [],
              reorderEnabled: false,
              sortOrder: 'Asc',
              type: 'embedded_reference_list',
            },
          ],
        },
      },
      field_demo_deleted: {
        cmsRecord: {
          name: 'field_demo_deleted',
          recordType: 'field_demo',
        },
        list: {
          actions: [],
          cmsRecord: {
            name: 'field_demo_deleted',
            recordType: 'field_demo',
          },
          defaultSort: {
            order: 'undefined',
          },
          fields: [
            {
              compact: true,
              label: 'ID',
              name: '_id',
              type: 'text_display',
            },
            {
              compact: true,
              label: 'Created at',
              name: 'createdAt',
              type: 'date_time_display',
            },
            {
              compact: true,
              label: 'Updated at',
              name: 'updatedAt',
              type: 'date_time_display',
            },
            {
              compact: true,
              name: 'name',
              label: 'Name',
              type: 'text_display',
            },
          ],
          itemActions: [
            {
              href: '/record/{cmsRecord.name}/{record._id}',
              label: 'Show',
              target: '',
              type: 'link',
            },
          ],
          label: 'Field demo deleted',
          perPage: 25,
          predicates: [
            {
              name: 'deleted',
              type: 'equal_to',
              value: true,
              valueType: 'json_value',
            },
          ],
          references: [],
        },
        show: {
          actions: [],
          cmsRecord: {
            name: 'field_demo_deleted',
            recordType: 'field_demo',
          },
          fields: [
            {
              compact: false,
              label: 'ID',
              name: '_id',
              type: 'text_display',
            },
            {
              compact: false,
              label: 'Created at',
              name: 'createdAt',
              type: 'date_time_display',
            },
            {
              compact: false,
              label: 'Updated at',
              name: 'updatedAt',
              type: 'date_time_display',
            },
            {
              compact: false,
              name: 'name',
              label: 'Name',
              type: 'text_display',
            },
          ],
          label: 'Field demo deleted',
          references: [],
        },
      },
      ref_demo: {
        cmsRecord: {
          name: 'ref_demo',
          recordType: 'ref_demo',
        },
        edit: {
          actions: [],
          cmsRecord: {
            name: 'ref_demo',
            recordType: 'ref_demo',
          },
          fields: [
            {
              compact: false,
              label: 'ID',
              name: '_id',
              type: 'text_display',
            },
            {
              compact: false,
              name: 'name',
              label: 'Name',
              editable: true,
              type: 'text_input',
            },
            {
              compact: false,
              name: 'field_demos',
              label: 'Field demos',
              editable: true,
              displayFieldName: 'name',
              reference: {
                predicates: [],
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'field_demo',
                  recordType: 'field_demo',
                },
                type: 'ViaBackReference',
              },
              type: 'reference_select',
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
                predicates: [],
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'field_demo',
                  recordType: 'field_demo',
                },
                type: 'ViaBackReference',
              },
              type: 'reference_select',
            },
          ],
        },
        new: {
          actions: [],
          cmsRecord: {
            name: 'ref_demo',
            recordType: 'ref_demo',
          },
          fields: [
            {
              compact: false,
              label: 'ID',
              name: '_id',
              type: 'text_display',
            },
            {
              compact: false,
              name: 'name',
              label: 'Name',
              editable: true,
              type: 'text_input',
            },
            {
              compact: false,
              name: 'field_demos',
              label: 'Field demos',
              editable: true,
              displayFieldName: 'name',
              reference: {
                predicates: [],
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'field_demo',
                  recordType: 'field_demo',
                },
                type: 'ViaBackReference',
              },
              type: 'reference_select',
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
                predicates: [],
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'field_demo',
                  recordType: 'field_demo',
                },
                type: 'ViaBackReference',
              },
              type: 'reference_select',
            },
          ],
        },
        show: {
          actions: [
            {
              href: '/record/{cmsRecord.name}/{record._id}/edit',
              label: 'Edit',
              target: '',
              type: 'link',
            },
          ],
          cmsRecord: {
            name: 'ref_demo',
            recordType: 'ref_demo',
          },
          fields: [
            {
              compact: false,
              label: 'ID',
              name: '_id',
              type: 'text_display',
            },
            {
              compact: false,
              name: 'name',
              label: 'Name',
              type: 'text_display',
            },
            {
              compact: false,
              name: 'field_references',
              label: 'Field references',
              displayFieldName: 'name',
              reference: {
                predicates: [],
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'field_demo',
                  recordType: 'field_demo',
                },
                type: 'ViaBackReference',
              },
              type: 'reference_list',
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
                predicates: [],
                sourceFieldName: 'reference',
                targetCmsRecord: {
                  name: 'field_demo',
                  recordType: 'field_demo',
                },
                type: 'ViaBackReference',
              },
              type: 'reference_list',
            },
          ],
        },
      },
      back_ref_demo: {
        cmsRecord: {
          name: 'back_ref_demo',
          recordType: 'back_ref_demo',
        },
        edit: {
          actions: [],
          cmsRecord: {
            name: 'back_ref_demo',
            recordType: 'back_ref_demo',
          },
          fields: [
            {
              compact: false,
              label: 'ID',
              name: '_id',
              type: 'text_display',
            },
            {
              compact: false,
              name: 'reference',
              label: 'Reference',
              editable: true,
              addButton: {
                enabled: false,
                label: '',
              },
              displayFieldName: 'name',
              reference: {
                predicates: [],
                targetCmsRecord: {
                  name: 'field_demo',
                  recordType: 'field_demo',
                },
                type: 'DirectReference',
              },
              type: 'reference_dropdown',
            },
            {
              compact: false,
              name: 'name',
              label: 'Name',
              editable: true,
              type: 'text_input',
            },
          ],
          label: 'Back ref demo',
          references: [
            {
              compact: false,
              name: 'reference',
              label: 'Reference',
              editable: true,
              addButton: {
                enabled: false,
                label: '',
              },
              displayFieldName: 'name',
              reference: {
                predicates: [],
                targetCmsRecord: {
                  name: 'field_demo',
                  recordType: 'field_demo',
                },
                type: 'DirectReference',
              },
              type: 'reference_dropdown',
            },
          ],
        },
        new: {
          actions: [],
          cmsRecord: {
            name: 'back_ref_demo',
            recordType: 'back_ref_demo',
          },
          fields: [
            {
              compact: false,
              label: 'ID',
              name: '_id',
              type: 'text_display',
            },
            {
              compact: false,
              name: 'reference',
              label: 'Reference',
              editable: true,
              addButton: {
                enabled: false,
                label: '',
              },
              displayFieldName: 'name',
              reference: {
                predicates: [],
                targetCmsRecord: {
                  name: 'field_demo',
                  recordType: 'field_demo',
                },
                type: 'DirectReference',
              },
              type: 'reference_dropdown',
            },
            {
              compact: false,
              name: 'name',
              label: 'Name',
              editable: true,
              type: 'text_input',
            },
          ],
          label: 'Back ref demo',
          references: [
            {
              compact: false,
              name: 'reference',
              label: 'Reference',
              editable: true,
              addButton: {
                enabled: false,
                label: '',
              },
              displayFieldName: 'name',
              reference: {
                predicates: [],
                targetCmsRecord: {
                  name: 'field_demo',
                  recordType: 'field_demo',
                },
                type: 'DirectReference',
              },
              type: 'reference_dropdown',
            },
          ],
        },
        show: {
          actions: [
            {
              href: '/record/{cmsRecord.name}/{record._id}/edit',
              label: 'Edit',
              target: '',
              type: 'link',
            },
          ],
          cmsRecord: {
            name: 'back_ref_demo',
            recordType: 'back_ref_demo',
          },
          fields: [
            {
              compact: false,
              label: 'ID',
              name: '_id',
              type: 'text_display',
            },
            {
              compact: false,
              name: 'reference',
              label: 'Reference',
              displayFieldName: 'name',
              reference: {
                predicates: [],
                targetCmsRecord: {
                  name: 'field_demo',
                  recordType: 'field_demo',
                },
                type: 'DirectReference',
              },
              type: 'reference',
            },
            {
              compact: false,
              name: 'name',
              label: 'Name',
              type: 'text_display',
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
                predicates: [],
                targetCmsRecord: {
                  name: 'field_demo',
                  recordType: 'field_demo',
                },
                type: 'DirectReference',
              },
              type: 'reference',
            },
          ],
        },
      },
      asso_ref_demo: {
        cmsRecord: {
          name: 'asso_ref_demo',
          recordType: 'asso_ref_demo',
        },
        show: {
          actions: [],
          cmsRecord: {
            name: 'asso_ref_demo',
            recordType: 'asso_ref_demo',
          },
          fields: [
            {
              compact: false,
              label: 'ID',
              name: '_id',
              type: 'text_display',
            },
            {
              compact: false,
              name: 'name',
              label: 'Name',
              type: 'text_display',
            },
          ],
          label: 'Asso ref demo',
          references: [],
        },
      },
    },
    site: [
      {
        type: 'user_management',
        label: 'USER',
      },
      {
        type: 'push_notifications',
        label: 'PUSH',
      },
      {
        type: 'file_import',
        label: 'FILE',
      },
      {
        type: 'space',
        size: 'medium',
      },
      {
        type: 'record',
        name: 'field_demo',
        label: 'Field demo',
      },
      {
        type: 'record',
        name: 'field_demo_deleted',
        label: 'Field demo deleted',
      },
      {
        type: 'space',
        size: 'large',
      },
    ],
    userManagement: {
      enabled: true,
      verification: {
        editable: false,
        enabled: true,
        fields: [
          {
            editable: true,
            label: 'Email',
            name: 'email',
          },
          {
            editable: true,
            label: 'Phone number',
            name: 'phone',
          },
        ],
      },
    },
  });
});
// tslint:enable:object-literal-sort-keys
