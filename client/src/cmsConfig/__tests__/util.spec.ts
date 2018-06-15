import {
  parseBoolean,
  parseOptionalBoolean,
  parseOptionalString,
  parseString,
  parseStringArray,
  parseTimezone,
} from '../util';

describe('parseString', () => {
  it('should parse string', () => {
    const input = { key: 'value' };
    expect(parseString(input, 'key', 'Test')).toEqual('value');
  });

  it('should throw error for undefined key', () => {
    const input = { $key: 'value' };
    expect(() => parseString(input, 'key', 'Test')).toThrow();
  });

  it('should throw error for non-string', () => {
    const input = { key: true };
    expect(() => parseString(input, 'key', 'Test')).toThrow();
  });
});

describe('parseBoolean', () => {
  it('should parse boolean', () => {
    const input = { key: true };
    expect(parseBoolean(input, 'key', 'Test')).toEqual(true);
  });

  it('should throw error for undefined key', () => {
    const input = { $key: true };
    expect(() => parseBoolean(input, 'key', 'Test')).toThrow();
  });

  it('should throw error for non-boolean', () => {
    const input = { key: 'true' };
    expect(() => parseBoolean(input, 'key', 'Test')).toThrow();
  });
});

describe('parseOptionalString', () => {
  it('should parse boolean', () => {
    const input = { key: 'value' };
    expect(parseOptionalString(input, 'key', 'Test')).toEqual('value');
  });

  it('should return undefined for undefined key', () => {
    const input = { $key: 'value' };
    expect(parseOptionalString(input, 'key', 'Test')).toEqual(undefined);
  });

  it('should throw error for non-string', () => {
    const input = { key: true };
    expect(() => parseOptionalString(input, 'key', 'Test')).toThrow();
  });
});

describe('parseOptionalBoolean', () => {
  it('should parse boolean', () => {
    const input = { key: true };
    expect(parseOptionalBoolean(input, 'key', 'Test')).toEqual(true);
  });

  it('should return undefined for undefined key', () => {
    const input = { $key: true };
    expect(parseOptionalBoolean(input, 'key', 'Test')).toEqual(undefined);
  });

  it('should throw error for non-string', () => {
    const input = { key: 'true' };
    expect(() => parseOptionalBoolean(input, 'key', 'Test')).toThrow();
  });
});

describe('parseStringArray', () => {
  it('should parse string array', () => {
    const input = { key: ['value1', 'value2'] };
    expect(parseStringArray(input, 'key', 'Test')).toEqual([
      'value1',
      'value2',
    ]);
  });

  it('should throw for array with non-string value', () => {
    const input = { key: ['value1', true] };
    expect(() => parseStringArray(input, 'key', 'Test')).toThrow();
  });

  it('should throw for undefined key', () => {
    const input = { $key: ['value1', 'value'] };
    expect(() => parseStringArray(input, 'key', 'Test')).toThrow();
  });
});

describe('parseTimezone', () => {
  it('should parse timezone', () => {
    const input = { key: 'Asia/Hong_Kong' };

    // Assume the underlying library parse the timezone string correctly
    expect(() => parseTimezone(input, 'key')).not.toThrow();
  });

  it('should throw error for unknown timezone', () => {
    const input = { key: 'unknown' };
    expect(() => parseTimezone(input, 'key')).toThrow();
  });
});
