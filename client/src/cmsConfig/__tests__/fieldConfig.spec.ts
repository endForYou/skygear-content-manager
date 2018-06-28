import {
  ConfigContext,
  DateTimeFieldConfig,
  FieldConfigTypes,
  parseFieldConfig,
} from '..';

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
          targetCmsRecord: {
            name: 'RecordA',
            recordType: 'a',
          },
          type: FieldConfigTypes.Reference,
        },
        {
          compact: false,
          displayFieldName: '_id',
          label: 'B id',
          name: 'b_id',
          targetCmsRecord: {
            name: 'RecordB',
            recordType: 'b',
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
});

describe('parseFieldConfig DateTime', () => {
  it('should parse DateTime field', () => {
    const input = {
      name: 'datetime',
      type: 'DateTime',
    };
    const result = parseFieldConfig(minimalContext, input);
    expect(result).toEqual({
      compact: false,
      label: 'Datetime',
      name: 'datetime',
      type: 'DateTime',
    });
  });

  it('should parse DateTime field and override timezone', () => {
    const input = {
      name: 'datetime',
      timezone: 'Asia/Hong_Kong',
      type: 'DateTime',
    };
    const result = parseFieldConfig(
      minimalContext,
      input
    ) as DateTimeFieldConfig;
    expect(result).toEqual({
      compact: false,
      label: 'Datetime',
      name: 'datetime',
      timezone: 'Asia/Hong_Kong',
      type: 'DateTime',
    });
  });
});

describe('parseFieldConfig Reference', () => {
  it('should parse direct Reference field', () => {
    const input = {
      name: 'A',
      reference_field_name: 'field',
      reference_target: 'RecordA',
      type: 'Reference',
    };
    const result = parseFieldConfig(context, input);
    expect(result).toEqual({
      compact: false,
      displayFieldName: 'field',
      label: 'A',
      name: 'A',
      targetCmsRecord: {
        name: 'RecordA',
        recordType: 'a',
      },
      type: FieldConfigTypes.Reference,
    });
  });

  it('should parse direct Reference field, and display _id by default', () => {
    const input = {
      name: 'A',
      reference_target: 'RecordA',
      type: 'Reference',
    };
    const result = parseFieldConfig(context, input);
    expect(result).toEqual({
      compact: false,
      displayFieldName: '_id',
      label: 'A',
      name: 'A',
      targetCmsRecord: {
        name: 'RecordA',
        recordType: 'a',
      },
      type: FieldConfigTypes.Reference,
    });
  });

  it('should throw error for unknown reference target', () => {
    const input = {
      name: 'A',
      reference_field_name: 'field',
      reference_target: 'Unknown',
      type: 'Reference',
    };
    expect(() => parseFieldConfig(context, input)).toThrow();
  });

  it('should parse back Reference field', () => {
    const input = {
      name: 'A',
      reference_field_name: 'field',
      reference_from_field: 'a_id',
      reference_via_back_reference: 'RecordB',
      type: 'Reference',
    };
    const result = parseFieldConfig(context, input);
    expect(result).toEqual({
      compact: false,
      displayFieldName: 'field',
      label: 'A',
      name: 'A',
      sourceFieldName: 'a_id',
      targetCmsRecord: {
        name: 'RecordB',
        recordType: 'b',
      },
      type: FieldConfigTypes.BackReference,
    });
  });

  it('should throw error for unknown reference via back reference', () => {
    const input = {
      name: 'A',
      reference_field_name: 'field',
      reference_from_field: 'a_id',
      reference_via_back_reference: 'Unknown',
      type: 'Reference',
    };
    expect(() => parseFieldConfig(context, input)).toThrow();
  });

  it('should parse back Reference field', () => {
    const input = {
      name: 'A',
      reference_field_name: 'field',
      reference_target: 'RecordB',
      reference_via_association_record: 'a_has_b',
      type: 'Reference',
    };
    const result = parseFieldConfig(context, input);
    expect(result).toEqual({
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
            targetCmsRecord: {
              name: 'RecordA',
              recordType: 'a',
            },
            type: 'Reference',
          },
          {
            compact: false,
            displayFieldName: '_id',
            label: 'B id',
            name: 'b_id',
            targetCmsRecord: {
              name: 'RecordB',
              recordType: 'b',
            },
            type: 'Reference',
          },
        ],
      },
      compact: false,
      displayFieldName: 'field',
      label: 'A',
      name: 'A',
      sourceReference: {
        compact: false,
        displayFieldName: '_id',
        label: 'A id',
        name: 'a_id',
        targetCmsRecord: {
          name: 'RecordA',
          recordType: 'a',
        },
        type: 'Reference',
      },
      targetReference: {
        compact: false,
        displayFieldName: '_id',
        label: 'B id',
        name: 'b_id',
        targetCmsRecord: {
          name: 'RecordB',
          recordType: 'b',
        },
        type: 'Reference',
      },
      type: FieldConfigTypes.AssociationReference,
    });
  });

  it('should throw error for unknown reference with association record', () => {
    const input = {
      name: 'A',
      reference_field_name: 'field',
      reference_target: 'RecordB',
      reference_via_association_record: 'Unknown',
      type: 'Reference',
    };
    expect(() => parseFieldConfig(context, input)).toThrow();
  });

  it('should throw error for unknown reference with association record', () => {
    const input = {
      name: 'A',
      reference_field_name: 'field',
      reference_target: 'Unknown',
      reference_via_association_record: 'a_has_b',
      type: 'Reference',
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
          type: 'TextDisplay',
        },
      ],
      reference_from_field: 'a_id',
      reference_via_back_reference: 'RecordB',
      type: 'EmbeddedReference',
    };
    const result = parseFieldConfig(context, input);
    expect(result).toEqual({
      compact: false,
      displayFields: [
        {
          compact: false,
          label: 'Name',
          name: 'name',
          type: 'TextDisplay',
        },
      ],
      label: 'A',
      name: 'A',
      positionFieldName: undefined,
      referenceDeleteAction: 'NullifyReference',
      references: [],
      reorderEnabled: false,
      sortOrder: 'Asc',
      sourceFieldName: 'a_id',
      targetCmsRecord: {
        name: 'RecordB',
        recordType: 'b',
      },
      type: FieldConfigTypes.EmbeddedBackReference,
    });
  });

  it('should throw error without reference fields', () => {
    const input = {
      name: 'A',
      reference_delete_action: 'Unknown',
      reference_from_field: 'a_id',
      reference_via_back_reference: 'RecordB',
      type: 'EmbeddedReference',
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
      type: 'EmbeddedReference',
    };
    expect(() => parseFieldConfig(context, input)).toThrow();
  });
});
