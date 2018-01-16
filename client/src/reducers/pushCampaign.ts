import { combineReducers, Reducer } from 'redux';
import { Actions } from '../actions';
import { PushCampaignActionTypes } from '../actions/pushCampaign';
import {
  PushCampaignState,
  initialPushCampaignListState,
  PushCampaignListState,
  NewPushCampaignState,
  initialNewPushCampaignState,
} from '../states';
import { PushCampaign } from '../types';

// fix issue with incorrect redux definition file.
// See https://github.com/reactjs/redux/issues/2709
// tslint:disable: no-any
export const pushCampaignViewsReducer = combineReducers<PushCampaignState>({
  list: pushCampaignListReducer as Reducer<any>,
  new: newPushCampaignReducer as Reducer<any>,
});
// tslint:enable: no-any

function pushCampaignListReducer(
  state: PushCampaignListState = initialPushCampaignListState,
  action: Actions
): PushCampaignListState {
  switch (action.type) {
    case PushCampaignActionTypes.FetchListRequest:
      return { ...state, page: action.payload.page };
    case PushCampaignActionTypes.FetchListSuccess:
      const { fetchResult, totalCount } = action.payload;
      return {
        ...state,
        isLoading: false,
        pushCampaigns: fetchResult.map((pushCampaign: PushCampaign) => pushCampaign),
        totalCount
      };
    case PushCampaignActionTypes.FetchListFailure:
      return { ...state, isLoading: false, error: action.payload.error };
    default:
      return state;
  }
}

function newPushCampaignReducer(
  state: NewPushCampaignState = initialNewPushCampaignState,
  action: Actions
): NewPushCampaignState {
  switch (action.type) {
    case PushCampaignActionTypes.FetchUserListRequest:
      return { ...state };
    case PushCampaignActionTypes.FetchUserListSuccess:
      const { queryResult } = action.payload;
      console.log('queryResult.overallCount:');
      console.log(queryResult.overallCount);
      return {
        ...state,
        userList: queryResult.map((record) => record),
        userListTotalCount: queryResult.overallCount,
      };
    case PushCampaignActionTypes.FetchUserListFailure:
      return { ...state, error: action.payload.error };
    default:
      return state;
  }
}
