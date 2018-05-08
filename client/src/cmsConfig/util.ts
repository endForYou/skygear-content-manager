import moment from 'moment-timezone';

import { TimezoneValue } from '../types';

export function parseString(
  // tslint:disable-next-line: no-any
  a: any,
  fieldName: string,
  context: string
): string {
  const optionalString = parseOptionalString(a, fieldName, context);
  if (optionalString === undefined) {
    throw new Error(`${context}.${fieldName} want a string, got undefined`);
  }

  return optionalString;
}

export function parseBoolean(
  // tslint:disable-next-line: no-any
  a: any,
  fieldName: string,
  context: string
): boolean {
  const optionalBoolean = parseOptionalBoolean(a, fieldName, context);
  if (optionalBoolean === undefined) {
    throw new Error(`${context}.${fieldName} want a boolean, got undefined`);
  }

  return optionalBoolean;
}

export function parseOptionalString(
  // tslint:disable-next-line: no-any
  a: any,
  fieldName: string,
  context: string
): string | undefined {
  return parseOptional<string>('string', a, fieldName, context);
}

export function parseOptionalBoolean(
  // tslint:disable-next-line: no-any
  a: any,
  fieldName: string,
  context: string
): boolean | undefined {
  return parseOptional<boolean>('boolean', a, fieldName, context);
}

export function parseStringArray(
  // tslint:disable-next-line: no-any
  a: any,
  fieldName: string,
  context: string
): string[] {
  const value = a[fieldName];
  if (value instanceof Array) {
    return value.map(name => {
      if (typeof name === 'string') {
        return name;
      }

      throw new Error(`${context}.${fieldName} want a string, got ${typeof a}`);
    });
  }

  throw new Error(`${context}.${fieldName} want an array, got ${typeof value}`);
}

export function parseOptional<T>(
  t: string,
  // tslint:disable-next-line: no-any
  a: any,
  fieldName: string,
  context: string
): T | undefined {
  const value = a[fieldName];

  if (value == null) {
    return undefined;
  }

  if (typeof value === t) {
    return value;
  }

  throw new Error(`${context}.${fieldName} want a ${t}, got ${typeof a}`);
}

// tslint:disable-next-line: no-any
export function parseTimezone(a: any, fieldName: string): TimezoneValue {
  const value = a[fieldName];

  if (value == null || value === 'Local') {
    return 'Local';
  }

  const zone = moment.tz.zone(value);
  if (zone == null) {
    throw new Error(`Unexpected timezone value: ${value}`);
  }

  return value;
}
