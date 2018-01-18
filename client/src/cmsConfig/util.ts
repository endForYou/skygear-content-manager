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

export function parseOptionalString(
  // tslint:disable-next-line: no-any
  a: any,
  fieldName: string,
  context: string
): string | undefined {
  const value = a[fieldName];

  if (value == null) {
    return undefined;
  }

  if (typeof value === 'string') {
    return value;
  }

  throw new Error(`${context}.${fieldName} want a string, got ${typeof a}`);
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