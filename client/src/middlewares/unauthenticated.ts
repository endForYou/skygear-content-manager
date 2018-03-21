import { Middleware } from 'redux';

import { logoutSuccess } from '../actions/auth';
import { isOutlawError } from '../recordUtil';

// tslint:disable: no-any
const isUnauthenticatedError = (error: any) => {
  if (isOutlawError(error)) {
    return error.status === 401;
  }

  const unauthenticatedErrorCodes = [101, 103, 104, 105, 106];
  return unauthenticatedErrorCodes.indexOf(error.code) !== -1;
};

export function getUnauthenticatedMiddleware() {
  const unauthenticatedMiddleware: Middleware = (api: any) => (next: any) => (
    action: any
  ) => {
    const payload = action.payload;
    if (!payload) {
      return next(action);
    }

    const error = payload.error;
    if (!error) {
      return next(action);
    }

    if (!isUnauthenticatedError(error)) {
      return next(action);
    }

    return next(logoutSuccess());
  };

  return unauthenticatedMiddleware;
}
// tslint:enable: no-any
