import {
  ConfigContext,
  DateTimeFieldConfig,
  FieldConfigTypes,
  parseFieldConfig,
} from '..';
import { TimezoneValue } from '../../types';

const minimalContext = {
  associationRecordByName: {},
  cmsRecordByName: {},
  timezone: 'Local' as TimezoneValue,
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
      name: 'RecordA',
      recordType: 'a',
    },
    RecordB: {
      name: 'RecordB',
      recordType: 'b',
    },
  },
  timezone: 'Local' as TimezoneValue,
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
      timezone: 'Local',
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
    const timezone = result.timezone;

    delete result.timezone;
    expect(result).toEqual({
      compact: false,
      label: 'Datetime',
      name: 'datetime',
      type: 'DateTime',
    });

    // expecte timezone to be an object, not a string
    expect(timezone).toBeInstanceOf(Object);
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
