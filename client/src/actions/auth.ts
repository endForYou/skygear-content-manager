import { ThunkAction } from 'redux-thunk';
import skygear, { Record } from 'skygear';

import { AuthState } from '../states';

export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export type LOGIN_SUCCESS = typeof LOGIN_SUCCESS;
export interface LoginSuccess {
  type: LOGIN_SUCCESS;
  payload: {
    user: Record;
  };
}

export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export type LOGIN_FAILURE = typeof LOGIN_FAILURE;
export interface LoginFailure {
  type: LOGIN_FAILURE;
  payload: {
    error: Error;
  };
}

export const UPDATE_USER = 'UPDATE_USER';
export type UPDATE_USER = typeof UPDATE_USER;
export interface UpdateUser {
  type: UPDATE_USER;
  payload: {
    user: Record;
  };
}

export function loginSuccess(user: Record): LoginSuccess {
  return {
    payload: {
      user,
    },
    type: LOGIN_SUCCESS,
  };
}

export function loginFailure(error: Error): LoginFailure {
  return {
    payload: {
      error,
    },
    type: LOGIN_FAILURE,
  };
}

export function updateUser(user: Record): UpdateUser {
  return {
    payload: {
      user,
    },
    type: UPDATE_USER,
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
