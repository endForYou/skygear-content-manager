import { ThunkAction } from 'redux-thunk';
import skygear, { Record } from 'skygear';

import { AuthState } from '../states';

export type AuthActions = LoginSuccess | LoginFailure | UpdateUser | Logout;

export enum AuthActionTypes {
  LoginSuccess = 'LOGIN_SUCCESS',
  LoginFailure = 'LOGIN_FAILURE',
  UpdateUser = 'UPDATE_USER',
  Logout = 'LOGOUT',
}

export interface LoginSuccess {
  type: AuthActionTypes.LoginSuccess;
  payload: {
    user: Record;
  };
  context: undefined;
}

export interface LoginFailure {
  type: AuthActionTypes.LoginFailure;
  payload: {
    error: Error;
  };
  context: undefined;
}

export interface Logout {
  type: AuthActionTypes.Logout;
  payload: undefined;
  context: undefined;
}

export interface UpdateUser {
  type: AuthActionTypes.UpdateUser;
  payload: {
    user: Record;
  };
  context: undefined;
}

export function loginSuccess(user: Record): LoginSuccess {
  return {
    context: undefined,
    payload: {
      user,
    },
    type: AuthActionTypes.LoginSuccess,
  };
}

export function loginFailure(error: Error): LoginFailure {
  return {
    context: undefined,
    payload: {
      error,
    },
    type: AuthActionTypes.LoginFailure,
  };
}

export function updateUser(user: Record): UpdateUser {
  return {
    context: undefined,
    payload: {
      user,
    },
    type: AuthActionTypes.UpdateUser,
  };
}

export function logout(): Logout {
  return {
    context: undefined,
    payload: undefined,
    type: AuthActionTypes.Logout,
  };
}

export function login(
  username: string,
  password: string
): ThunkAction<Promise<void>, AuthState, {}> {
  return dispatch => {
    return skygear.auth.loginWithUsername(username, password).then(
      user => {
        dispatch(loginSuccess(user));
      },
      error => {
        dispatch(loginFailure(error));
      }
    );
  };
}
