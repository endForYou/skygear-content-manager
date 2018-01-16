import { Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import skygear from 'skygear';

import { PushCampaign } from '../types';
import { RootState } from '../states';


export type PushCampaignListActions =
  | FetchPushCampaignListRequest
  | FetchPushCampaignListSuccess
  | FetchPushCampaignListFailure;

export enum PushCampaignActionTypes {
  FetchListRequest = 'FETCH_PUSH_CAMPAIGN_LIST_REQUEST',
  FetchListSuccess = 'FETCH_PUSH_CAMPAIGN_SUCCESS',
  FetchListFailure = 'FETCH_PUSH_CAMPAIGN_FAILURE',
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
}
