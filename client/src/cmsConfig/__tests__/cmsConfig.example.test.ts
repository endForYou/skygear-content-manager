import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as process from 'process';

// tslint:disable:object-literal-sort-keys
test('parseCmsConfig should parse example config', () => {
  const text = fs.readFileSync(process.cwd() + '/example/cms-config.yaml', {
    encoding: 'utf-8',
  });
  const parsed = yaml.safeLoad(text);
  expect(parsed).toEqual({
    timezone: 'Asia/Hong_Kong',
    imports: {
      'import-field-demo': {
        record_type: 'field_demo',
        identifier: 'name',
        duplicate_reference_handling: 'throw-error',
        fields: [
          { name: 'name', label: 'Name' },
          { name: 'textarea' },
          { name: 'dropdown' },
          { name: 'wysiwyg' },
          { name: 'datetime' },
          { name: 'boolean' },
          { name: 'integer' },
          { name: 'number' },
          {
            name: 'reference',
            reference_target: 'ref_demo',
            reference_field_name: 'name',
          },
        ],
      },
    },
    exports: {
      'export-field-demo': {
        record_type: 'field_demo',
        fields: [
          { name: '_id' },
          { name: '_created_at' },
          { name: '_updated_at' },
          { name: 'name', label: 'Name' },
          { name: 'textarea' },
          { name: 'dropdown' },
          { name: 'wysiwyg' },
          { name: 'datetime' },
          { name: 'boolean' },
          { name: 'integer' },
          { name: 'number' },
          {
            name: 'reference',
            reference_target: 'ref_demo',
            reference_field_name: 'name',
          },
          {
            name: 'back_refs',
            reference_via_back_reference: 'back_ref_demo',
            reference_from_field: 'reference',
            reference_fields: [
              { name: '_id', label: 'Back ref {index} - ID' },
              { name: 'name', label: 'Back ref {index} - Name' },
            ],
          },
        ],
      },
    },
    user_management: { enabled: true },
    push_notifications: {
      enabled: true,
      filters: [{ name: 'name', type: 'String', label: 'Name' }],
    },
    site: [
      { type: 'UserManagement', label: 'USER' },
      { type: 'PushNotifications', label: 'PUSH' },
      { type: 'Record', name: 'field_demo' },
      { type: 'Record', name: 'field_demo_deleted' },
    ],
    records: {
      field_demo: {
        list: {
          predicates: [
            { name: 'deleted', predicate: 'NotEqualTo', value: true },
          ],
          default_sort: { name: 'name', ascending: false },
          actions: [
            { type: 'AddButton' },
            {
              type: 'Import',
              name: 'import-field-demo',
              label: 'Import records',
            },
            {
              type: 'Export',
              name: 'export-field-demo',
              label: 'Export records',
            },
          ],
          item_actions: [
            { type: 'ShowButton' },
            { type: 'EditButton' },
            {
              type: 'Link',
              label: 'Search',
              href: 'https://www.google.com/search?q={record.name}',
              target: '_blank',
            },
          ],
          fields: [
            { type: '_id' },
            { type: '_created_at' },
            { type: '_updated_at' },
            { name: 'name', label: 'Name', type: 'String' },
            { name: 'textarea', type: 'TextArea' },
            { name: 'dropdown', type: 'String' },
            { name: 'wysiwyg', type: 'WYSIWYG' },
            { name: 'datetime', type: 'DateTime' },
            { name: 'boolean', type: 'Boolean' },
            { name: 'integer', type: 'Integer' },
            { name: 'number', type: 'Number' },
            {
              name: 'reference',
              type: 'Reference',
              reference_target: 'ref_demo',
              reference_field_name: 'name',
            },
            {
              name: 'back_refs',
              type: 'Reference',
              reference_via_back_reference: 'back_ref_demo',
              reference_from_field: 'reference',
              reference_field_name: 'name',
            },
            { name: 'imageasset', type: 'ImageAsset' },
            { name: 'fileasset', type: 'FileAsset' },
          ],
          filters: [
            { name: '_id', label: 'ID', type: 'String' },
            { name: '_created_at', label: 'CreatedAt', type: 'DateTime' },
            { name: '_updated_at', label: 'UpdatedAt', type: 'DateTime' },
            { name: 'name', label: 'Name', type: 'String' },
            { name: 'datetime', type: 'DateTime' },
            { name: 'boolean', type: 'Boolean' },
            { name: 'integer', type: 'Integer' },
            {
              name: 'reference',
              type: 'Reference',
              reference_target: 'ref_demo',
              reference_field_name: 'name',
              nullable: true,
            },
          ],
        },
        show: {
          fields: [
            { type: '_id' },
            { type: '_created_at' },
            { type: '_updated_at' },
            { name: 'name', label: 'Name', type: 'String' },
            { name: 'textarea', type: 'TextArea' },
            { name: 'dropdown', type: 'String' },
            { name: 'wysiwyg', type: 'WYSIWYG' },
            {
              name: 'datetime',
              type: 'DateTime',
              timezone: 'America/New_York',
            },
            { name: 'boolean', type: 'Boolean' },
            { name: 'integer', type: 'Integer' },
            { name: 'number', type: 'Number' },
            {
              name: 'reference',
              type: 'Reference',
              reference_target: 'ref_demo',
              reference_field_name: 'name',
            },
            {
              name: 'back_refs',
              type: 'Reference',
              reference_via_back_reference: 'back_ref_demo',
              reference_from_field: 'reference',
              reference_field_name: 'name',
            },
            {
              name: 'asso_refs',
              type: 'Reference',
              reference_via_association_record: 'field_asso_ref',
              reference_target: 'asso_ref_demo',
              reference_field_name: 'name',
            },
            {
              name: 'back_refs_embedded',
              type: 'EmbeddedReference',
              reference_via_back_reference: 'back_ref_demo',
              reference_from_field: 'reference',
              reference_position_field: 'field_demo_position',
              reference_position_ascending: false,
              reference_fields: [
                { type: '_id' },
                { name: 'name', type: 'String' },
              ],
            },
            { name: 'imageasset', type: 'ImageAsset' },
            { name: 'fileasset', type: 'FileAsset' },
          ],
        },
        edit: {
          fields: [
            { type: '_id' },
            { type: '_created_at' },
            { type: '_updated_at' },
            { name: 'name', label: 'Name', type: 'String' },
            { name: 'textarea', type: 'TextArea' },
            {
              name: 'dropdown',
              type: 'Dropdown',
              null: { enabled: false, label: 'Undefined' },
              custom: { enabled: true },
              options: [
                { label: 'Option A', value: 'A' },
                { label: 'Option B', value: 'B' },
                { label: 'Option S', value: 'S' },
              ],
            },
            { name: 'wysiwyg', type: 'WYSIWYG' },
            { name: 'datetime', type: 'DateTime' },
            { name: 'boolean', type: 'Boolean' },
            { name: 'integer', type: 'Integer' },
            { name: 'number', type: 'Number' },
            {
              name: 'reference',
              type: 'Reference',
              reference_target: 'ref_demo',
              reference_field_name: 'name',
            },
            {
              name: 'back_refs',
              type: 'Reference',
              reference_via_back_reference: 'back_ref_demo',
              reference_from_field: 'reference',
              reference_field_name: 'name',
            },
            {
              name: 'back_refs_embedded',
              type: 'EmbeddedReference',
              reference_via_back_reference: 'back_ref_demo',
              reference_from_field: 'reference',
              reference_position_field: 'field_demo_position',
              reference_position_ascending: true,
              reference_fields: [
                { type: '_id' },
                { name: 'name', type: 'String' },
              ],
            },
            { name: 'imageasset', type: 'ImageAsset' },
            { name: 'fileasset', type: 'FileAsset' },
          ],
        },
        new: {
          fields: [
            { type: '_id' },
            { type: '_created_at' },
            { type: '_updated_at' },
            { name: 'name', label: 'Name', type: 'String' },
            { name: 'textarea', type: 'TextArea' },
            {
              name: 'dropdown',
              type: 'Dropdown',
              null: { enabled: false, label: 'Undefined' },
              custom: { enabled: true },
              options: [
                { label: 'Option A', value: 'A' },
                { label: 'Option B', value: 'B' },
                { label: 'Option S', value: 'S' },
              ],
            },
            { name: 'wysiwyg', type: 'WYSIWYG' },
            { name: 'datetime', type: 'DateTime' },
            { name: 'boolean', type: 'Boolean' },
            { name: 'integer', type: 'Integer' },
            { name: 'number', type: 'Number' },
            {
              name: 'reference',
              type: 'Reference',
              reference_target: 'ref_demo',
              reference_field_name: 'name',
            },
            {
              name: 'back_refs',
              type: 'Reference',
              reference_via_back_reference: 'back_ref_demo',
              reference_from_field: 'reference',
              reference_field_name: 'name',
            },
            {
              name: 'back_refs_embedded',
              type: 'EmbeddedReference',
              reference_via_back_reference: 'back_ref_demo',
              reference_from_field: 'reference',
              reference_position_field: 'field_demo_position',
              reference_position_ascending: true,
              reference_fields: [
                { type: '_id' },
                { name: 'name', type: 'String' },
              ],
            },
            { name: 'imageasset', type: 'ImageAsset' },
            { name: 'fileasset', type: 'FileAsset' },
          ],
        },
      },
      field_demo_deleted: {
        record_type: 'field_demo',
        list: {
          predicates: [{ name: 'deleted', predicate: 'EqualTo', value: true }],
          fields: [
            { type: '_id' },
            { type: '_created_at' },
            { type: '_updated_at' },
            { name: 'name', label: 'Name', type: 'String' },
          ],
        },
      },
      ref_demo: {
        show: {
          fields: [
            { type: '_id' },
            { name: 'name', label: 'Name', type: 'String' },
            {
              name: 'field_references',
              type: 'Reference',
              reference_via_back_reference: 'field_demo',
              reference_from_field: 'reference',
              reference_field_name: 'name',
            },
          ],
        },
        edit: {
          fields: [
            { type: '_id' },
            { name: 'name', label: 'Name', type: 'String' },
            {
              name: 'field_demos',
              type: 'Reference',
              reference_via_back_reference: 'field_demo',
              reference_from_field: 'reference',
              reference_field_name: 'name',
            },
          ],
        },
        new: {
          fields: [
            { type: '_id' },
            { name: 'name', label: 'Name', type: 'String' },
            {
              name: 'field_demos',
              type: 'Reference',
              reference_via_back_reference: 'field_demo',
              reference_from_field: 'reference',
              reference_field_name: 'name',
            },
          ],
        },
      },
      back_ref_demo: {
        show: {
          fields: [
            { type: '_id' },
            {
              name: 'reference',
              type: 'Reference',
              reference_target: 'field_demo',
              reference_field_name: 'name',
            },
            { name: 'name', label: 'Name', type: 'String' },
          ],
        },
        edit: {
          fields: [
            { type: '_id' },
            {
              name: 'reference',
              type: 'Reference',
              reference_target: 'field_demo',
              reference_field_name: 'name',
            },
            { name: 'name', label: 'Name', type: 'String' },
          ],
        },
        new: {
          fields: [
            { type: '_id' },
            {
              name: 'reference',
              type: 'Reference',
              reference_target: 'field_demo',
              reference_field_name: 'name',
            },
            { name: 'name', label: 'Name', type: 'String' },
          ],
        },
      },
      asso_ref_demo: {
        show: {
          fields: [
            { type: '_id' },
            { name: 'name', label: 'Name', type: 'String' },
          ],
        },
      },
    },
    association_records: {
      field_asso_ref: {
        fields: [
          {
            name: 'field_demo',
            type: 'Reference',
            reference_target: 'field_demo',
          },
          {
            name: 'asso_ref_demo',
            type: 'Reference',
            reference_target: 'asso_ref_demo',
          },
        ],
      },
    },
  });
});
// tslint:enable:object-literal-sort-keys
