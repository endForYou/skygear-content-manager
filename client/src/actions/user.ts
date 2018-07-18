import { Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import skygear, { Role } from 'skygear';

import { queryWithFilters } from './record';

import { Filter } from '../cmsConfig';
import { RootState } from '../states';
import { SkygearUser } from '../types';

export type UserActions =
  | FetchUserListRequest
  | FetchUserListSuccess
  | FetchUserListFailure
  | UpdateUserCMSAccessRequest
  | UpdateUserCMSAccessSuccess
  | UpdateUserCMSAccessFailure
  | FetchUserRequest
  | FetchUserSuccess
  | FetchUserFailure;

export enum UserActionTypes {
  FetchListRequest = 'FETCH_USER_LIST_REQUEST',
  FetchListSuccess = 'FETCH_USER_LIST_SUCCESS',
  FetchListFailure = 'FETCH_USER_LIST_FAILURE',
  UpdateUserCMSAccessRequest = 'UPDATE_USER_CMS_ACCESS_REQUEST',
  UpdateUserCMSAccessSuccess = 'UPDATE_USER_CMS_ACCESS_SUCCESS',
  UpdateUserCMSAccessFailure = 'UPDATE_USER_CMS_ACCESS_FAILURE',
  FetchUserRequest = 'FETCH_USER_REQUEST',
  FetchUserSuccess = 'FETCH_USER_SUCCESS',
  FetchUserFailure = 'FETCH_USER_FAILURE',
}

interface UserQueryResult {
  users: SkygearUser[];
  overallCount: number;
}

export interface FetchUserListRequest {
  payload: {
    page: number;
  };
  type: UserActionTypes.FetchListRequest;
  context: undefined;
}

export interface FetchUserListSuccess {
  payload: {
    page: number;
    perPage: number;
    users: SkygearUser[];
    overallCount: number;
  };
  type: UserActionTypes.FetchListSuccess;
  context: undefined;
}

export interface FetchUserListFailure {
  payload: {
    error: Error;
  };
  type: UserActionTypes.FetchListFailure;
  context: undefined;
}

export interface UpdateUserCMSAccessRequest {
  payload: {
    id: string;
  };
  type: UserActionTypes.UpdateUserCMSAccessRequest;
  context: undefined;
}

export interface UpdateUserCMSAccessSuccess {
  payload: {
    id: string;
    hasAccess: boolean;
    adminRole: string;
  };
  type: UserActionTypes.UpdateUserCMSAccessSuccess;
  context: undefined;
}

export interface UpdateUserCMSAccessFailure {
  payload: {
    id: string;
    error: Error;
  };
  type: UserActionTypes.UpdateUserCMSAccessFailure;
  context: undefined;
}

export interface FetchUserRequest {
  payload: {
    userId: string;
  };
  type: UserActionTypes.FetchUserRequest;
  context: undefined;
}

export interface FetchUserSuccess {
  payload: {
    user: SkygearUser;
  };
  type: UserActionTypes.FetchUserSuccess;
  context: undefined;
}

export interface FetchUserFailure {
  payload: {
    userId: string;
    error: Error;
  };
  type: UserActionTypes.FetchUserFailure;
  context: undefined;
}

function fetchUserListRequest(page: number): FetchUserListRequest {
  return {
    context: undefined,
    payload: {
      page,
    },
    type: UserActionTypes.FetchListRequest,
  };
}

function fetchUserListSuccess(
  page: number,
  perPage: number,
  queryResult: UserQueryResult
): FetchUserListSuccess {
  return {
    context: undefined,
    payload: {
      overallCount: queryResult.overallCount,
      page,
      perPage,
      users: queryResult.users,
    },
    type: UserActionTypes.FetchListSuccess,
  };
}

function fetchUserListFailure(error: Error): FetchUserListFailure {
  return {
    context: undefined,
    payload: {
      error,
    },
    type: UserActionTypes.FetchListFailure,
  };
}

function updateUserCMSAccessRequest(
  userId: string
): UpdateUserCMSAccessRequest {
  return {
    context: undefined,
    payload: {
      id: userId,
    },
    type: UserActionTypes.UpdateUserCMSAccessRequest,
  };
}

function updateUserCMSAccessSuccess(
  userId: string,
  hasAccess: boolean,
  adminRole: string
): UpdateUserCMSAccessSuccess {
  return {
    context: undefined,
    payload: {
      adminRole,
      hasAccess,
      id: userId,
    },
    type: UserActionTypes.UpdateUserCMSAccessSuccess,
  };
}

function updateUserCMSAccessFailure(
  userId: string,
  error: Error
): UpdateUserCMSAccessFailure {
  return {
    context: undefined,
    payload: {
      error,
      id: userId,
    },
    type: UserActionTypes.UpdateUserCMSAccessFailure,
  };
}

function fetchUserRequest(userId: string): FetchUserRequest {
  return {
    context: undefined,
    payload: {
      userId,
    },
    type: UserActionTypes.FetchUserRequest,
  };
}

function fetchUserSuccess(user: SkygearUser): FetchUserSuccess {
  return {
    context: undefined,
    payload: {
      user,
    },
    type: UserActionTypes.FetchUserSuccess,
  };
}

function fetchUserFailure(userId: string, error: Error): FetchUserFailure {
  return {
    context: undefined,
    payload: {
      error,
      userId,
    },
    type: UserActionTypes.FetchUserFailure,
  };
}

function fetchUsersImpl(
  page: number = 1,
  perPage: number = 25,
  filters: Filter[]
): Promise<UserQueryResult> {
  const params = {
    // filter: getImportedFileFilter(filters),
    page,
    perPage,
  };

  const recordCls = skygear.UserRecord;
  const query = queryWithFilters(filters, recordCls);

  query.overallCount = true;
  query.limit = perPage;
  query.offset = (page - 1) * perPage;
  query.addDescending('_created_at');

  return (
    skygear
      .lambda('user:get_all', params)
      // tslint:disable-next-line:no-any
      .then((result: any) => {
        return {
          overallCount: result.totalCount,
          users: result.users.map(SkygearUser),
        };
      })
  );
}

function fetchUsers(
  page: number,
  perPage: number,
  filters: Filter[]
): ThunkAction<Promise<void>, {}, {}> {
  return dispatch => {
    dispatch(fetchUserListRequest(page));

    return fetchUsersImpl(page, perPage, filters)
      .then((result: UserQueryResult) => {
        dispatch(fetchUserListSuccess(page, perPage, result));
      })
      .catch((error: Error) => {
        dispatch(fetchUserListFailure(error));
      });
  };
}

function updateUserCMSAccessImpl(
  userId: string,
  hasAccess: boolean,
  adminRole: string
): Promise<'OK'> {
  const promise = hasAccess
    ? skygear.auth.assignUserRole([userId], [adminRole])
    : skygear.auth.revokeUserRole([userId], [adminRole]);

  return promise
    .then(() => {
      return skygear.auth.fetchUserRole([userId]);
    })
    .then((userRoles: { [id: string]: Role[] }) => {
      const roles = userRoles[userId];
      const hasAdminRole = roles.filter(r => r.name === adminRole).length > 0;
      if ((hasAccess && !hasAdminRole) || (!hasAccess && hasAdminRole)) {
        throw new Error('Failed to update roles');
      }

      return 'OK' as 'OK';
    });
}

function updateUserCMSAccess(
  userId: string,
  hasAccess: boolean,
  adminRole: string
): ThunkAction<Promise<void>, {}, {}> {
  return dispatch => {
    dispatch(updateUserCMSAccessRequest(userId));

    return updateUserCMSAccessImpl(userId, hasAccess, adminRole)
      .then(() => {
        dispatch(updateUserCMSAccessSuccess(userId, hasAccess, adminRole));
      })
      .catch((error: Error) => {
        dispatch(updateUserCMSAccessFailure(userId, error));
      });
  };
}

export function changePassword(
  userId: string,
  password: string
): Promise<string> {
  return skygear.auth.adminResetPassword(userId, password);
}

function fetchUserImpl(userId: string): Promise<SkygearUser> {
  return (
    skygear
      .lambda('user:get', { user_id: userId })
      // tslint:disable-next-line:no-any
      .then((result: any) => {
        return SkygearUser(result.user);
      })
  );
}

export function fetchUser(userId: string): ThunkAction<Promise<void>, {}, {}> {
  return dispatch => {
    dispatch(fetchUserRequest(userId));

    return fetchUserImpl(userId)
      .then(user => {
        dispatch(fetchUserSuccess(user));
      })
      .catch((error: Error) => {
        dispatch(fetchUserFailure(userId, error));
      });
  };
}

export function enableUser(userId: string): Promise<string> {
  return skygear.auth.adminEnableUser(userId);
}

export function disableUser(
  userId: string,
  message: string,
  expiry?: Date
): Promise<string> {
  return skygear.auth.adminDisableUser(userId, message, expiry);
}

export class UserActionDispatcher {
  private dispatch: Dispatch<RootState>;

  constructor(dispatch: Dispatch<RootState>) {
    this.dispatch = dispatch;
  }

  public fetchList(page: number, perPage: number, filters: Filter[]) {
    this.dispatch(fetchUsers(page, perPage, filters));
  }

  public updateUserCMSAccess(
    userId: string,
    hasAccess: boolean,
    adminRole: string
  ) {
    this.dispatch(updateUserCMSAccess(userId, hasAccess, adminRole));
  }

  public fetchUser(userId: string) {
    this.dispatch(fetchUser(userId));
  }
}
