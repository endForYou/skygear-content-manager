import { Middleware } from 'redux';

import { logout } from '../actions/auth';
import { isOutlawError } from '../recordUtil';

export function getForbiddenMiddleware() {
  // tslint:disable: no-any
  const forbiddenMiddleware: Middleware = (api: any) => (next: any) => (
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

    const isForbiddenError = isOutlawError(error)
      ? error.status === 403
      : error.code === 102;

    if (!isForbiddenError) {
      return next(action);
    }

    return next(logout());
  };
  // tslint:enable: no-any

  return forbiddenMiddleware;
}
