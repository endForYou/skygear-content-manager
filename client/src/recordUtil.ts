import { OutlawError } from 'skygear';

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
