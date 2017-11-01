import skygear from 'skygear';

import { LOGIN_SUCCESS, LOGIN_FAILURE, UPDATE_USER } from '../actions/auth';

const errorMessageFromError = error => {
  if (error.error.code === skygear.ErrorCodes.ResourceNotFound) {
    return "User with this username doesn't exists.";
  }

  if (error.error.code === skygear.ErrorCodes.InvalidCredentials) {
    return "The password that you've entered is incorrect.";
  }

  return `Failed to login: ${error.error.message || error}`;
};

export default function auth(state = { user: null, errorMessage: '' }, action) {
  switch (action.type) {
    case LOGIN_SUCCESS:
      console.log(`Login succeeded: ${action.user.username}`);

      return { ...state, user: action.user, errorMessage: '' };
    case LOGIN_FAILURE:
      return { ...state, errorMessage: errorMessageFromError(action.error) };
    case UPDATE_USER:
      return { ...state, user: action.user };
  }

  return state;
}
