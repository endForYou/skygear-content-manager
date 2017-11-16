import { OutlawError, Reference } from 'skygear';

export interface ParsedReference {
  recordType: string;
  recordId: string;
}

export function parseReference(ref: Reference): ParsedReference {
  const [recordType] = ref.id.split('/', 1);
  const recordId = ref.id.substring(recordType.length + 1);

  if (recordType === '' || recordId === '') {
    throw new Error(`Reference.id = ${ref.id} is not in the form "type/id"`);
  }

  return { recordType, recordId };
}

// tslint:disable-next-line: no-any
export function isOutlawError(e: any): e is OutlawError {
  return (
    e !== undefined &&
    e != null &&
    // we didn't use e.error instanceof SkygearError here
    // because of babel doesn't make it possible
    // with Error subclass
    e.error !== undefined &&
    e.error != null &&
    typeof e.status === 'number'
  );
}

export function errorMessageFromError(e: Error) {
  if (isOutlawError(e)) {
    return e.error.message;
  }

  return e.message;
}
