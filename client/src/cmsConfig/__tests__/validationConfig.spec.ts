import { parseValidationConfig } from '../validationConfig';

describe('parseValidationConfig', () => {
  it('should parse validation with expression', () => {
    expect(
      parseValidationConfig({
        expression: 'true',
      })
    ).toEqual({
      expression: 'not (value != null) or (true)',
    });
  });

  it('should override message with predefined validation', () => {
    expect(
      parseValidationConfig({
        message: 'I am your father.',
        required: true,
      })
    ).toEqual({
      expression:
        '(typeof(value) in ("string", "array") and length(value) > 0) or value != null',
      message: 'I am your father.',
    });
  });

  it('should parse length validation with either min or max', () => {
    expect(
      parseValidationConfig({
        length: {
          max: 20,
        },
      })
    ).toEqual({
      expression: 'not (value != null) or (length(value) <= 20)',
      message: 'Length should be smaller than or equal to 20.',
    });
  });

  it('should parse length validation with both min and max', () => {
    expect(
      parseValidationConfig({
        length: {
          max: 20,
          min: 10,
        },
      })
    ).toEqual({
      expression:
        'not (value != null) or (length(value) >= 10 and length(value) <= 20)',
      message:
        'Length should be larger than or equal to 10 and smaller than or equal to 20.',
    });
  });

  it('should parse exclusive length validation', () => {
    expect(
      parseValidationConfig({
        inclusive: false,
        length: {
          max: 20,
          min: 10,
        },
      })
    ).toEqual({
      expression:
        'not (value != null) or (length(value) > 10 and length(value) < 20)',
      message: 'Length should be larger than 10 and smaller than 20.',
    });
  });

  it('should parse range validation with date', () => {
    expect(
      parseValidationConfig({
        range: {
          max: new Date(1000),
        },
      })
    ).toEqual({
      expression: 'not (value != null) or (timestamp(value) <= 1000)',
      message:
        'Value should be smaller than or equal to 1970-01-01T00:00:01.000Z.',
    });
  });
});
