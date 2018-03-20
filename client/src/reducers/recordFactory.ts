import { combineReducers, Reducer } from 'redux';
import { Record } from 'skygear';

import { Actions } from '../actions';
import { AuthActionTypes } from '../actions/auth';
import { CmsConfigActionTypes } from '../actions/cmsConfig';
import { RecordActionTypes } from '../actions/record';
import {
  EditState,
  initialEditState,
  initialListState,
  initialNewState,
  initialRecordViewState,
  initialShowState,
  ListState,
  NewState,
  RecordViewState,
  ShowState,
} from '../states';
import { RemoteFailure, RemoteLoading, RemoteSuccess } from '../types';

// fix issue with incorrect redux definition file.
// See https://github.com/reactjs/redux/issues/2709
// tslint:disable: no-any
const recordViewsReducer = combineReducers<RecordViewState>({
  edit: recordEditReducer as Reducer<any>,
  list: recordListReducer as Reducer<any>,
  new: recordNewReducer as Reducer<any>,
  show: recordShowReducer as Reducer<any>,
});
// tslint:enable: no-any

function createRecordViewsByNameReducer() {
  const initialState = {};
  return (state = initialState, action: Actions) => {
    // initialize record view state
    // when cms config fetched
    if (action.type === CmsConfigActionTypes.FetchSuccess) {
      const recordNames = Object.keys(action.payload.result.records);
      state = recordNames.reduce(
        (s, recordName) => ({
          ...s,
          [recordName]: initialRecordViewState,
        }),
        state
      );
    }

    if (action.type === AuthActionTypes.LogoutSuccess) {
      state = {};
    }

    // tslint:disable-next-line: no-any
    const payload: any = action.payload;
    if (payload && payload.cmsRecord) {
      const recordName = payload.cmsRecord.name;
      return {
        ...state,
        [recordName]: recordViewsReducer(state[recordName], action),
      };
    }

    return state;
  };
}

function recordListReducer(
  state: ListState = initialListState,
  action: Actions
): ListState {
  if (action.context !== 'list') {
    return state;
  }

  switch (action.type) {
    case RecordActionTypes.FetchListRequest:
      return { ...state, page: action.payload.page };
    case RecordActionTypes.FetchListSuccess:
      const { queryResult } = action.payload;
      return {
        ...state,
        isLoading: false,
        records: queryResult.map((record: Record) => record),
        totalCount: queryResult.overallCount,
      };
    case RecordActionTypes.FetchListFailure:
      return { ...state, isLoading: false, error: action.payload.error };
    default:
      return state;
  }
}

function recordShowReducer(
  state: ShowState = initialShowState,
  action: Actions
): ShowState {
  if (action.context !== 'show') {
    return state;
  }

  switch (action.type) {
    case RecordActionTypes.FetchRequest:
      return {
        ...state,
        remoteRecord: RemoteLoading,
      };
    case RecordActionTypes.FetchSuccess:
      return {
        ...state,
        remoteRecord: RemoteSuccess<Record>(action.payload.record),
      };
    case RecordActionTypes.FetchFailure:
      return {
        ...state,
        remoteRecord: RemoteFailure(action.payload.error),
      };
    default:
      return state;
  }
}

function recordEditReducer(
  state: EditState = initialEditState,
  action: Actions
): EditState {
  if (action.context !== 'edit') {
    return state;
  }

  switch (action.type) {
    case RecordActionTypes.FetchRequest:
      return {
        ...state,
        remoteRecord: RemoteLoading,
        savingRecord: undefined,
      };
    case RecordActionTypes.FetchSuccess:
      return {
        ...state,
        remoteRecord: RemoteSuccess(action.payload.record),
      };
    case RecordActionTypes.FetchFailure:
      return {
        ...state,
        remoteRecord: RemoteFailure(action.payload.error),
      };
    case RecordActionTypes.SaveRequest:
      return {
        ...state,
        savingRecord: RemoteLoading,
      };
    case RecordActionTypes.SaveSuccess:
      return {
        ...state,
        remoteRecord: RemoteSuccess(action.payload.record),
        savingRecord: RemoteSuccess(action.payload.record),
      };
    case RecordActionTypes.SaveFailure:
      return {
        ...state,
        savingRecord: RemoteFailure(action.payload.error),
      };
    default:
      return state;
  }
}

function recordNewReducer(
  state: NewState = initialNewState,
  action: Actions
): NewState {
  if (action.context !== 'new') {
    return state;
  }

  switch (action.type) {
    case RecordActionTypes.SaveRequest:
      return {
        ...state,
        savingRecord: RemoteLoading,
      };
    case RecordActionTypes.SaveSuccess:
      return {
        ...state,
        savingRecord: RemoteSuccess(action.payload.record),
      };
    case RecordActionTypes.SaveFailure:
      return {
        ...state,
        savingRecord: RemoteFailure(action.payload.error),
      };
    default:
      return state;
  }
}

export default createRecordViewsByNameReducer();
