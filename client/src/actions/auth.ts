import { ThunkAction } from 'redux-thunk';
import skygear, { Record } from 'skygear';

import { AuthState } from '../states';

export type AuthActions =
  | LoginSuccess
  | LoginFailure
  | UpdateUser
  | LogoutSuccess
  | LogoutFailure;

export enum AuthActionTypes {
  LoginSuccess = 'LOGIN_SUCCESS',
  LoginFailure = 'LOGIN_FAILURE',
  UpdateUser = 'UPDATE_USER',
  LogoutSuccess = 'LOGOUT_SUCCESS',
  LogoutFailure = 'LOGOUT_FAILURE',
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

export interface LogoutSuccess {
  type: AuthActionTypes.LogoutSuccess;
  payload: undefined;
  context: undefined;
}

export interface LogoutFailure {
  type: AuthActionTypes.LogoutFailure;
  payload: {
    error: Error;
  };
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

export function logoutSuccess(): LogoutSuccess {
  return {
    context: undefined,
    payload: undefined,
    type: AuthActionTypes.LogoutSuccess,
  };
}

export function logoutFailure(error: Error): LogoutFailure {
  return {
    context: undefined,
    payload: { error },
    type: AuthActionTypes.LogoutFailure,
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

export function logout(): ThunkAction<Promise<void>, AuthState, {}> {
  return dispatch => {
    return skygear.auth.logout().then(
      () => {
        dispatch(logoutSuccess());
      },
      error => {
        dispatch(logoutFailure(error));
      }
    );
  };
}
