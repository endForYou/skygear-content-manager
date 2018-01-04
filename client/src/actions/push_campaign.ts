import { Dispatch } from 'redux';
import { ThunkAction } from 'redux-thunk';
import skygear from 'skygear';

import { RootState } from '../states';

export interface PushCampaignHistory {
  id: string;
  content: string;
  device: string;
  send_time: Date;
  user_id: string;
}

export type RecordActions =
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
    fetchResult: PushCampaignHistory[];
    page: number;
    perPage: number;
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
  fetchResult: PushCampaignHistory[],
  page: number,
  perPage: number,
): FetchPushCampaignListSuccess {
  return {
    payload: {
      fetchResult,
      page,
      perPage,
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

function fetchListOperation(
  page: number,
  perPage: number
): Promise<PushCampaignHistory[]> {
  // WTF: To avoid compilation error: 
  // "Property 'lambda' does not exist on type 'Container'."
  // tslint:disable-next-line: no-any
  return (skygear as any)
    .lambda('push_campaign:get_all', {page, perPage})
    .then(
      // tslint:disable-next-line: no-any
      (queryResult: any) => {
        return queryResult.result;
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
        dispatch(fetchPushCampaignListSuccess(fetchResult, page, perPage));
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
