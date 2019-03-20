import {
  ConfigContext,
  DateTimePickerFieldConfig,
  FieldConfigTypes,
  parseFieldConfig,
} from '..';
import { ReferenceTypes } from '../fieldConfig';

const minimalContext: ConfigContext = {
  associationRecordByName: {},
  cmsRecordByName: {},
  siteConfig: [],
};

const context: ConfigContext = {
  associationRecordByName: {
    a_has_b: {
      cmsRecord: {
        name: 'a_has_b',
        recordType: 'a_has_b',
      },
      referenceConfigPair: [
        {
          compact: false,
          displayFieldName: '_id',
          label: 'A id',
          name: 'a_id',
          reference: {
            predicates: [],
            targetCmsRecord: {
              name: 'RecordA',
              recordType: 'a',
            },
            type: ReferenceTypes.DirectReference,
          },
          type: FieldConfigTypes.Reference,
        },
        {
          compact: false,
          displayFieldName: '_id',
          label: 'B id',
          name: 'b_id',
          reference: {
            predicates: [],
            targetCmsRecord: {
              name: 'RecordB',
              recordType: 'b',
            },
            type: ReferenceTypes.DirectReference,
          },
          type: FieldConfigTypes.Reference,
        },
      ],
    },
  },
  cmsRecordByName: {
    RecordA: {
      pages: new Set(),
      record: {
        name: 'RecordA',
        recordType: 'a',
      },
    },
    RecordB: {
      pages: new Set(),
      record: {
        name: 'RecordB',
        recordType: 'b',
      },
    },
  },
  siteConfig: [],
};

describe('parseFieldConfig', () => {
  it('should throw error for unknown type', () => {
    const input = {
      name: 'name',
      type: 'Unknown',
    };
    expect(() => parseFieldConfig(minimalContext, input)).toThrow();
  });

  it('should parse built-in fields', () => {
    const inputs = [
      '_id',
      'id',
      '_owner_id',
      'ownerID',
      '_access',
      'access',
      '_updated_at',
      'updatedAt',
      '_created_at',
      'createdAt',
      '_updated_by',
      'updatedBy',
      '_created_by',
      'createdBy',
    ];
    inputs.forEach(input => {
      const result = parseFieldConfig(minimalContext, { name: input });
      expect(result).not.toBeNull();
    });
  });

  it('should ignore built-in field type', () => {
    const input = {
      name: '_updated_at',
      type: 'string',
    };
    const result = parseFieldConfig(minimalContext, input);
    expect(result).toEqual({
      compact: false,
      label: 'Updated at',
      name: 'updatedAt',
      type: 'date_time_display',
    });
  });
});

describe('parseFieldConfig DateTime', () => {
  it('should parse DateTime field', () => {
    const input = {
      name: 'datetime',
      type: 'date_time_picker',
    };
    const result = parseFieldConfig(minimalContext, input);
    expect(result).toEqual({
      compact: false,
      label: 'Datetime',
      name: 'datetime',
      type: 'date_time_picker',
    });
  });

  it('should parse DateTime field and override timezone', () => {
    const input = {
      name: 'datetime',
      timezone: 'Asia/Hong_Kong',
      type: 'date_time_picker',
    };
    const result = parseFieldConfig(
      minimalContext,
      input
    ) as DateTimePickerFieldConfig;
    expect(result).toEqual({
      compact: false,
      label: 'Datetime',
      name: 'datetime',
      timezone: 'Asia/Hong_Kong',
      type: 'date_time_picker',
    });
  });
});

describe('parseFieldConfig Reference', () => {
  it('should parse direct Reference field', () => {
    const input = {
      name: 'A',
      reference_field_name: 'field',
      reference_target: 'RecordA',
      type: 'reference',
    };
    const result = parseFieldConfig(context, input);
    expect(result).toEqual({
      compact: false,
      displayFieldName: 'field',
      label: 'A',
      name: 'A',
      reference: {
        predicates: [],
        targetCmsRecord: {
          name: 'RecordA',
          recordType: 'a',
        },
        type: ReferenceTypes.DirectReference,
      },
      type: FieldConfigTypes.Reference,
    });
  });

  it('should parse direct Reference field, and display _id by default', () => {
    const input = {
      name: 'A',
      reference_target: 'RecordA',
      type: 'reference',
    };
    const result = parseFieldConfig(context, input);
    expect(result).toEqual({
      compact: false,
      displayFieldName: '_id',
      label: 'A',
      name: 'A',
      reference: {
        predicates: [],
        targetCmsRecord: {
          name: 'RecordA',
          recordType: 'a',
        },
        type: ReferenceTypes.DirectReference,
      },
      type: FieldConfigTypes.Reference,
    });
  });

  it('should throw error for unknown reference target', () => {
    const input = {
      name: 'A',
      reference_field_name: 'field',
      reference_target: 'Unknown',
      type: 'reference',
    };
    expect(() => parseFieldConfig(context, input)).toThrow();
  });

  it('should parse back Reference field', () => {
    const input = {
      name: 'A',
      reference_field_name: 'field',
      reference_from_field: 'a_id',
      reference_via_back_reference: 'RecordB',
      type: 'reference_list',
    };
    const result = parseFieldConfig(context, input);
    expect(result).toEqual({
      compact: false,
      displayFieldName: 'field',
      label: 'A',
      name: 'A',
      reference: {
        predicates: [],
        sourceFieldName: 'a_id',
        targetCmsRecord: {
          name: 'RecordB',
          recordType: 'b',
        },
        type: ReferenceTypes.ViaBackReference,
      },
      type: FieldConfigTypes.ReferenceList,
    });
  });

  it('should throw error for unknown reference via back reference', () => {
    const input = {
      name: 'A',
      reference_field_name: 'field',
      reference_from_field: 'a_id',
      reference_via_back_reference: 'Unknown',
      type: 'reference_list',
    };
    expect(() => parseFieldConfig(context, input)).toThrow();
  });

  it('should parse back Reference field', () => {
    const input = {
      name: 'A',
      reference_field_name: 'field',
      reference_target: 'RecordB',
      reference_via_association_record: 'a_has_b',
      type: 'reference_list',
    };
    const result = parseFieldConfig(context, input);
    expect(result).toEqual({
      compact: false,
      displayFieldName: 'field',
      label: 'A',
      name: 'A',
      reference: {
        associationRecordConfig: {
          cmsRecord: {
            name: 'a_has_b',
            recordType: 'a_has_b',
          },
          referenceConfigPair: [
            {
              compact: false,
              displayFieldName: '_id',
              label: 'A id',
              name: 'a_id',
              reference: {
                predicates: [],
                targetCmsRecord: {
                  name: 'RecordA',
                  recordType: 'a',
                },
                type: ReferenceTypes.DirectReference,
              },
              type: FieldConfigTypes.Reference,
            },
            {
              compact: false,
              displayFieldName: '_id',
              label: 'B id',
              name: 'b_id',
              reference: {
                predicates: [],
                targetCmsRecord: {
                  name: 'RecordB',
                  recordType: 'b',
                },
                type: ReferenceTypes.DirectReference,
              },
              type: FieldConfigTypes.Reference,
            },
          ],
        },
        predicates: [],
        sourceReference: {
          compact: false,
          displayFieldName: '_id',
          label: 'A id',
          name: 'a_id',
          reference: {
            predicates: [],
            targetCmsRecord: {
              name: 'RecordA',
              recordType: 'a',
            },
            type: ReferenceTypes.DirectReference,
          },
          type: FieldConfigTypes.Reference,
        },
        targetReference: {
          compact: false,
          displayFieldName: '_id',
          label: 'B id',
          name: 'b_id',
          reference: {
            predicates: [],
            targetCmsRecord: {
              name: 'RecordB',
              recordType: 'b',
            },
            type: ReferenceTypes.DirectReference,
          },
          type: FieldConfigTypes.Reference,
        },
        type: ReferenceTypes.ViaAssociationRecord,
      },
      type: FieldConfigTypes.ReferenceList,
    });
  });

  it('should throw error for unknown reference with association record', () => {
    const input = {
      name: 'A',
      reference_field_name: 'field',
      reference_target: 'RecordB',
      reference_via_association_record: 'Unknown',
      type: 'reference_list',
    };
    expect(() => parseFieldConfig(context, input)).toThrow();
  });

  it('should throw error for unknown reference with association record', () => {
    const input = {
      name: 'A',
      reference_field_name: 'field',
      reference_target: 'Unknown',
      reference_via_association_record: 'a_has_b',
      type: 'reference_list',
    };
    expect(() => parseFieldConfig(context, input)).toThrow();
  });
});

describe('parseFieldConfig EmbeddedReference', () => {
  it('should parse Embedded reference via back reference', () => {
    const input = {
      name: 'A',
      reference_fields: [
        {
          name: 'name',
          type: 'text_display',
        },
      ],
      reference_from_field: 'a_id',
      reference_via_back_reference: 'RecordB',
      type: 'embedded_reference_list',
    };
    const result = parseFieldConfig(context, input);
    expect(result).toEqual({
      compact: false,
      deleteButton: {
        enabled: false,
      },
      displayFields: [
        {
          compact: false,
          label: 'Name',
          name: 'name',
          type: FieldConfigTypes.TextDisplay,
        },
      ],
      label: 'A',
      name: 'A',
      positionFieldName: undefined,
      reference: {
        predicates: [],
        sourceFieldName: 'a_id',
        targetCmsRecord: {
          name: 'RecordB',
          recordType: 'b',
        },
        type: ReferenceTypes.ViaBackReference,
      },
      referenceDeleteAction: 'nullify_reference',
      references: [],
      reorderEnabled: false,
      sortOrder: 'Asc',
      type: FieldConfigTypes.EmbeddedReferenceList,
    });
  });

  it('should throw error without reference fields', () => {
    const input = {
      name: 'A',
      reference_delete_action: 'Unknown',
      reference_from_field: 'a_id',
      reference_via_back_reference: 'RecordB',
      type: 'embedded_reference_list',
    };
    expect(() => parseFieldConfig(context, input)).toThrow();
  });

  it('should throw error for unknwon referenceDeleteAction', () => {
    const input = {
      name: 'A',
      reference_delete_action: 'Unknown',
      reference_fields: [],
      reference_from_field: 'a_id',
      reference_via_back_reference: 'RecordB',
      type: 'embedded_reference_list',
    };
    expect(() => parseFieldConfig(context, input)).toThrow();
  });
});
