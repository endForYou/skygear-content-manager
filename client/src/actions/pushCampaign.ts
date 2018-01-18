import { Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import skygear from 'skygear';

import { RootState } from '../states';
import { NewPushCampaign, PushCampaign } from '../types';

export type PushCampaignActions =
  | FetchPushCampaignListRequest
  | FetchPushCampaignListSuccess
  | FetchPushCampaignListFailure
  | SavePushCampaignRequest
  | SavePushCampaignSuccess
  | SavePushCampaignFailure;

export enum PushCampaignActionTypes {
  FetchListRequest = 'FETCH_PUSH_CAMPAIGN_LIST_REQUEST',
  FetchListSuccess = 'FETCH_PUSH_CAMPAIGN_LIST_SUCCESS',
  FetchListFailure = 'FETCH_PUSH_CAMPAIGN_LIST_FAILURE',
  SavePushCampaignRequest = 'SAVE_PUSH_CAMPAIGN_REQUEST',
  SavePushCampaignSuccess = 'SAVE_PUSH_CAMPAIGN_SUCCESS',
  SavePushCampaignFailure = 'SAVE_PUSH_CAMPAIGN_FAILURE',
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

export interface SavePushCampaignRequest {
  payload: {
    newPushCampaign: NewPushCampaign
  };
  type: PushCampaignActionTypes.SavePushCampaignRequest;
}

export interface SavePushCampaignSuccess {
  payload: {
    newPushCampaign: NewPushCampaign
  };
  type: PushCampaignActionTypes.SavePushCampaignSuccess;
}

export interface SavePushCampaignFailure {
  payload: {
    error: Error;
  };
  type: PushCampaignActionTypes.SavePushCampaignFailure;
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

function savePushCampaignRequest(
  newPushCampaign: NewPushCampaign
): SavePushCampaignRequest {
  return {
    payload: {
      newPushCampaign,
    },
    type: PushCampaignActionTypes.SavePushCampaignRequest,
  };
}

function savePushCampaignSuccess(
  newPushCampaign: NewPushCampaign
): SavePushCampaignSuccess {
  return {
    payload: {
      newPushCampaign,
    },
    type: PushCampaignActionTypes.SavePushCampaignSuccess,
  };
}

function savePushCampaignFailure(
  error: Error
): SavePushCampaignFailure {
  return {
    payload: {
      error,
    },
    type: PushCampaignActionTypes.SavePushCampaignFailure,
  };
}

function savePushCampaign(newPushCampaign: NewPushCampaign): ThunkAction<Promise<void>, {}, {}> {
  return dispatch => {
    dispatch(savePushCampaignRequest(newPushCampaign));
    return savePushCampaignOperation(newPushCampaign).then(
      result => {
        dispatch(savePushCampaignSuccess(newPushCampaign));
      },
      error => {
        dispatch(savePushCampaignFailure(error));
      }
    );
  };
}

function savePushCampaignOperation(newPushCampaign: NewPushCampaign): Promise<void> {
  return skygear
    .lambda('push_campaign:create_new', {new_push_campaign: newPushCampaign})
    .then(
      // tslint:disable-next-line: no-any
      (result: any) => {
        return result;
      });
}

interface FetchListResult {
  pushCampaigns: PushCampaign[];
  totalCount: number;
}

function fetchListOperation(
  page: number,
  perPage: number
): Promise<FetchListResult> {
  return skygear
    .lambda('push_campaign:get_all', {page, perPage})
    .then(
      // tslint:disable-next-line: no-any
      (queryResult: any) => {
        return { pushCampaigns: queryResult.pushCampaigns, totalCount: queryResult.totalCount };
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

  public savePushCampaign(newPushCampaign: NewPushCampaign): Promise<void> {
    return this.dispatch(
      savePushCampaign(newPushCampaign)
    );
  }
}
