import { ThunkAction } from 'redux-thunk';
import skygear, { Record } from 'skygear';

import { AuthState } from '../states';

export type AuthActions = LoginSuccess | LoginFailure | UpdateUser;

export enum AuthActionTypes {
  LoginSuccess = 'LOGIN_SUCCESS',
  LoginFailure = 'LOGIN_FAILURE',
  UpdateUser = 'UPDATE_USER',
}

export interface LoginSuccess {
  type: AuthActionTypes.LoginSuccess;
  payload: {
    user: Record;
  };
}

export interface LoginFailure {
  type: AuthActionTypes.LoginFailure;
  payload: {
    error: Error;
  };
}

export interface UpdateUser {
  type: AuthActionTypes.UpdateUser;
  payload: {
    user: Record;
  };
}

export function loginSuccess(user: Record): LoginSuccess {
  return {
    payload: {
      user,
    },
    type: AuthActionTypes.LoginSuccess,
  };
}

export function loginFailure(error: Error): LoginFailure {
  return {
    payload: {
      error,
    },
    type: AuthActionTypes.LoginFailure,
  };
}

export function updateUser(user: Record): UpdateUser {
  return {
    payload: {
      user,
    },
    type: AuthActionTypes.UpdateUser,
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
