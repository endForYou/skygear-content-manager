import {
  Database,
  OutlawError,
  Record,
  Reference,
  SkygearError,
} from 'skygear';
import { isArray } from 'util';

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

export class RecordsOperationError extends Error {
  errors: Error[];

  constructor(message: string, errors: Error[]) {
    super(message);

    this.errors = errors;
  }
}

export function saveRecordsProperly(
  database: Database,
  records: Record[]
): Promise<void> {
  if (records.length === 1) {
    return database
      .save(records[0])
      .then(result => undefined)
      .catch(err => {
        throw new RecordsOperationError('Failed to save records', [err]);
      });
  }

  return database.save(records).then(result => {
    const errors = result.errors.filter(error => error != null);

    if (errors.length) {
      errors.forEach(error => {
        console.log('Failed to save record:', error);
      });

      throw new RecordsOperationError('Failed to save records', errors);
    }
  });
}

export function deleteRecordsProperly(
  database: Database,
  records: Record[]
): Promise<void> {
  if (records.length === 1) {
    return database
      .delete(records[0])
      .then(result => undefined)
      .catch(err => {
        throw new RecordsOperationError('Failed to save records', [err]);
      });
  }

  return database.delete(records).then(errors => {
    const filteredErrors = (errors || []).filter(
      error => error
    ) as SkygearError[];

    if (filteredErrors.length) {
      filteredErrors.forEach(error => {
        console.log('Failed to delete record:', error);
      });

      throw new RecordsOperationError(
        'Failed to delete records',
        filteredErrors
      );
    }
  });
}

export function isRecordsOperationError(
  // tslint:disable-next-line:no-any
  error: any
): error is RecordsOperationError {
  if (error == null) {
    return false;
  }

  const errors = error.errors;
  return isArray(errors);
}
