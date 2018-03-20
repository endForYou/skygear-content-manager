import { ErrorCodes } from 'skygear';

import { Actions } from '../actions';
import { AuthActionTypes } from '../actions/auth';
import { isOutlawError } from '../recordUtil';
import { AuthState } from '../states';

function errorMessageFromError(error: Error) {
  if (isOutlawError(error)) {
    if (error.error.code === ErrorCodes.ResourceNotFound) {
      return "User with this username doesn't exists.";
    }

    if (error.error.code === ErrorCodes.InvalidCredentials) {
      return "The password that you've entered is incorrect.";
    }

    return `Failed to login: ${error.error.message}`;
  }

  return `Failed to login: ${error}`;
}

export default function auth(
  state: AuthState = { user: undefined, errorMessage: undefined },
  action: Actions
) {
  switch (action.type) {
    case AuthActionTypes.LoginSuccess:
      console.log('Login succeeded:', action.payload.user.name);

      return { ...state, user: action.payload.user, errorMessage: undefined };
    case AuthActionTypes.LoginFailure:
      return {
        ...state,
        errorMessage: errorMessageFromError(action.payload.error),
      };
    case AuthActionTypes.UpdateUser:
      return { ...state, user: action.payload.user };
    case AuthActionTypes.LogoutSuccess:
      return { user: undefined, errorMessage: undefined };
    case AuthActionTypes.LogoutFailure:
      return state;
    default:
      return state;
  }
}
