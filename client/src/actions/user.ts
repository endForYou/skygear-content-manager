import { Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import skygear, { Query, QueryResult, Record, Role } from 'skygear';

import { RootState } from '../states';
import { SkygearUser } from '../types';

export type UserActions =
  | FetchUserListReuest
  | FetchUserListSuccess
  | FetchUserListFailure
  | UpdateUserCMSAccessRequest
  | UpdateUserCMSAccessSuccess
  | UpdateUserCMSAccessFailure;

export enum UserActionTypes {
  FetchListRequest = 'FETCH_USER_LIST_REQUEST',
  FetchListSuccess = 'FETCH_USER_LIST_SUCCESS',
  FetchListFailure = 'FETCH_USER_LIST_FAILURE',
  UpdateUserCMSAccessRequest = 'UPDATE_USER_CMS_ACCESS_REQUEST',
  UpdateUserCMSAccessSuccess = 'UPDATE_USER_CMS_ACCESS_SUCCESS',
  UpdateUserCMSAccessFailure = 'UPDATE_USER_CMS_ACCESS_FAILURE',
}

interface UserQueryResult {
  users: SkygearUser[];
  overallCount: number;
}

export interface FetchUserListReuest {
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

function fetchUserListRequest(page: number): FetchUserListReuest {
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
  user: SkygearUser
): UpdateUserCMSAccessRequest {
  return {
    context: undefined,
    payload: {
      id: user.id,
    },
    type: UserActionTypes.UpdateUserCMSAccessRequest,
  };
}

function updateUserCMSAccessSuccess(
  user: SkygearUser,
  hasAccess: boolean,
  adminRole: string
): UpdateUserCMSAccessSuccess {
  return {
    context: undefined,
    payload: {
      adminRole,
      hasAccess,
      id: user.id,
    },
    type: UserActionTypes.UpdateUserCMSAccessSuccess,
  };
}

function updateUserCMSAccessFailure(
  user: SkygearUser,
  error: Error
): UpdateUserCMSAccessFailure {
  return {
    context: undefined,
    payload: {
      error,
      id: user.id,
    },
    type: UserActionTypes.UpdateUserCMSAccessFailure,
  };
}

function fetchUsersImpl(
  page: number = 1,
  perPage: number = 25
): Promise<UserQueryResult> {
  const recordCls = skygear.UserRecord;
  const query = new Query(recordCls);

  query.overallCount = true;
  query.limit = perPage;
  query.offset = (page - 1) * perPage;
  query.addDescending('_created_at');

  let userRecords: Record[];
  let overallCount: number;

  return skygear.publicDB
    .query(query)
    .then((queryResult: QueryResult<Record>) => {
      userRecords = queryResult.map((r: Record) => r);
      overallCount = queryResult.overallCount;
      return skygear.auth.fetchUserRole(userRecords);
    })
    .then((userRoles: { [id: string]: Role[] }) => ({
      overallCount,
      users: userRecords.map((record: Record) =>
        SkygearUser(record, userRoles)
      ),
    }));
}

function fetchUsers(
  page: number,
  perPage: number
): ThunkAction<Promise<void>, {}, {}> {
  return dispatch => {
    dispatch(fetchUserListRequest(page));

    return fetchUsersImpl(page, perPage)
      .then((result: UserQueryResult) => {
        dispatch(fetchUserListSuccess(page, perPage, result));
      })
      .catch((error: Error) => {
        dispatch(fetchUserListFailure(error));
      });
  };
}

function updateUserCMSAccessImpl(
  user: SkygearUser,
  hasAccess: boolean,
  adminRole: string
): Promise<'OK'> {
  const promise = hasAccess
    ? skygear.auth.assignUserRole([user.id], [adminRole])
    : skygear.auth.revokeUserRole([user.id], [adminRole]);

  return promise
    .then(() => {
      return skygear.auth.fetchUserRole([user.id]);
    })
    .then((userRoles: { [id: string]: Role[] }) => {
      const roles = userRoles[user.id];
      const hasAdminRole = roles.filter(r => r.name === adminRole).length > 0;
      if ((hasAccess && !hasAdminRole) || (!hasAccess && hasAdminRole)) {
        throw new Error('Failed to update roles');
      }

      return 'OK' as 'OK';
    });
}

function updateUserCMSAccess(
  user: SkygearUser,
  hasAccess: boolean,
  adminRole: string
): ThunkAction<Promise<void>, {}, {}> {
  return dispatch => {
    dispatch(updateUserCMSAccessRequest(user));

    return updateUserCMSAccessImpl(user, hasAccess, adminRole)
      .then(() => {
        dispatch(updateUserCMSAccessSuccess(user, hasAccess, adminRole));
      })
      .catch((error: Error) => {
        dispatch(updateUserCMSAccessFailure(user, error));
      });
  };
}

export class UserActionDispatcher {
  private dispatch: Dispatch<RootState>;
  private adminRole: string;

  constructor(dispatch: Dispatch<RootState>, adminRole: string) {
    this.dispatch = dispatch;
    this.adminRole = adminRole;
  }

  public fetchList(page: number, perPage: number) {
    this.dispatch(fetchUsers(page, perPage));
  }

  public updateUserCMSAccess(user: SkygearUser, hasAccess: boolean) {
    this.dispatch(updateUserCMSAccess(user, hasAccess, this.adminRole));
  }
}
