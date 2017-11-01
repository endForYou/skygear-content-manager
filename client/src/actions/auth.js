import skygear from 'skygear';

export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';

export const UPDATE_USER = 'UPDATE_USER';

export function loginSuccess(user) {
  return {
    type: LOGIN_SUCCESS,
    user,
  };
}

export function loginFailure(error) {
  return {
    type: LOGIN_FAILURE,
    error,
  };
}

export function updateUser(user) {
  return {
    type: UPDATE_USER,
    user,
  };
}

export const login = (username, password) => {
  return dispatch => {
    skygear.auth.loginWithUsername(username, password).then(
      user => {
        dispatch(loginSuccess(user));
      },
      error => {
        dispatch(loginFailure(error));
      }
    );
  };
};
