import { Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import skygear, { Query, QueryResult, Record } from 'skygear';

import { PushCampaign } from '../types';
import { RootState } from '../states';


export type PushCampaignListActions =
  | FetchPushCampaignListRequest
  | FetchPushCampaignListSuccess
  | FetchPushCampaignListFailure
  | FetchUserListRequest
  | FetchUserListSuccess
  | FetchUserListFailure;

export enum PushCampaignActionTypes {
  FetchListRequest = 'FETCH_PUSH_CAMPAIGN_LIST_REQUEST',
  FetchListSuccess = 'FETCH_PUSH_CAMPAIGN_LIST_SUCCESS',
  FetchListFailure = 'FETCH_PUSH_CAMPAIGN_LIST_FAILURE',
  FetchUserListRequest = 'FETCH_USER_LIST_REQUEST',
  FetchUserListSuccess = 'FETCH_USER_LIST_SUCCESS',
  FetchUserListFailure = 'FETCH_USER_LIST_FAILURE',
}

export interface FetchPushCampaignListRequest {
  payload: {
    page: number;
  };
  type: PushCampaignActionTypes.FetchListRequest;
}

export interface FetchPushCampaignListSuccess {
  payload: {
    fetchResult: PushCampaign[];
    page: number;
    perPage: number;
    totalCount: number;
  };
  type: PushCampaignActionTypes.FetchListSuccess;
}

export interface FetchPushCampaignListFailure {
  payload: {
    error: Error;
  };
  type: PushCampaignActionTypes.FetchListFailure;
}

export interface FetchUserListRequest {
  type: PushCampaignActionTypes.FetchUserListRequest;
}

export interface FetchUserListSuccess {
  payload: {
    queryResult: QueryResult<Record>;
  };
  type: PushCampaignActionTypes.FetchUserListSuccess;
}

export interface FetchUserListFailure {
  payload: {
    error: Error;
  };
  type: PushCampaignActionTypes.FetchUserListFailure;
}

function fetchPushCampaignListRequest(
  page: number
): FetchPushCampaignListRequest {
  return {
    payload: {
      page,
    },
    type: PushCampaignActionTypes.FetchListRequest,
  };
}

function fetchPushCampaignListSuccess(
  fetchResult: PushCampaign[],
  page: number,
  perPage: number,
  totalCount: number,
): FetchPushCampaignListSuccess {
  return {
    payload: {
      fetchResult,
      page,
      perPage,
      totalCount,
    },
    type: PushCampaignActionTypes.FetchListSuccess,
  };
}

function fetchPushCampaignListFailure(
  error: Error
): FetchPushCampaignListFailure {
  return {
    payload: {
      error,
    },
    type: PushCampaignActionTypes.FetchListFailure,
  };
}

function fetchUserListRequest(): FetchUserListRequest {
  return {
    type: PushCampaignActionTypes.FetchUserListRequest,
  };
}

function fetchUserListSuccess(
  queryResult: QueryResult<Record>
): FetchUserListSuccess {
  return {
    payload: {
      queryResult,
    },
    type: PushCampaignActionTypes.FetchUserListSuccess,
  };
}

function fetchUserListFailure(
  error: Error
): FetchUserListFailure {
  return {
    payload: {
      error,
    },
    type: PushCampaignActionTypes.FetchUserListFailure,
  };
}

function fetchUserList(): ThunkAction<Promise<void>, {}, {}> {
  return dispatch => {
    const query = new Query(Record.extend('user'));
    query.overallCount = true;
    dispatch(fetchUserListRequest());
    return fetchUserListOperation(query).then(
      queryResult => {
        console.log(queryResult);
        dispatch(fetchUserListSuccess(queryResult));
      },
      error => {
        dispatch(fetchUserListFailure(error));
      }
    );
  };
}

function fetchUserListOperation(query: Query): Promise<QueryResult<Record>> {
  return skygear.publicDB
    .query(query)
    .then((queryResult: QueryResult<Record>) => {
      return queryResult;
    });
}

interface fetchListResult {
  pushCampaigns: PushCampaign[];
  totalCount: number;
}

function fetchListOperation(
  page: number,
  perPage: number
): Promise<fetchListResult> {
  return skygear
    .lambda('push_campaign:get_all', {page, perPage})
    .then(
      // tslint:disable-next-line: no-any
      (queryResult: any) => {
        return {'pushCampaigns': queryResult.pushCampaigns, 'totalCount': queryResult.totalCount};
      });
}

function fetchPushCampaignList(
  page: number = 1,
  perPage: number = 25
): ThunkAction<Promise<void>, {}, {}> {
  return dispatch => {
    dispatch(fetchPushCampaignListRequest(page));
    return fetchListOperation(page, perPage).then(
      fetchResult => {
        dispatch(fetchPushCampaignListSuccess(fetchResult.pushCampaigns, page, perPage, fetchResult.totalCount));
      },
      error => {
        dispatch(fetchPushCampaignListFailure(error));
      }
    );
  };
}

export class PushCampaignActionDispatcher {
  private dispatch: Dispatch<RootState>;

  constructor(
    dispatch: Dispatch<RootState>
  ) {
    this.dispatch = dispatch;
  }

  public fetchList(page: number, perPage: number): Promise<void> {
    return this.dispatch(
      fetchPushCampaignList(page, perPage)
    );
  }

  public fetchUserList(): Promise<void> {
    console.log('fetchUserList');
    return this.dispatch(
      fetchUserList()
    );
  }
}
