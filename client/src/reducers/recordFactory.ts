import { AnyAction, combineReducers, Reducer } from 'redux';
import { Record } from 'skygear';

import { RecordActionTypes } from '../actions/record';
import {
  EditState,
  initialEditState,
  initialListState,
  initialRecordViewState,
  initialShowState,
  ListState,
  RecordViewsByName,
  RecordViewState,
  ShowState,
} from '../states';
import { RemoteFailure, RemoteLoading, RemoteSuccess } from '../types';

const recordViewsReducer = combineReducers<RecordViewState>({
  edit: recordEditReducer,
  list: recordListReducer,
  show: recordShowReducer,
});

function recordViewsByNameReducerFactory(
  recordNames: string[] = []
): Reducer<RecordViewsByName> {
  const initialRecordState = initialRecordViewState;
  const initialState = recordNames.reduce((state, recordName) => {
    return { ...state, [recordName]: initialRecordState };
  }, {});

  return (state = initialState, action) => {
    if (action.payload && action.payload.cmsRecord) {
      const recordName = action.payload.cmsRecord.name;
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
  action: AnyAction
): ListState {
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
  action: AnyAction
): ShowState {
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
  action: AnyAction
): EditState {
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
    case RecordActionTypes.SaveRequest:
      return {
        ...state,
        remoteRecord: RemoteLoading,
      };
    case RecordActionTypes.SaveSuccess:
      return {
        ...state,
        remoteRecord: RemoteSuccess<Record>(action.payload.record),
      };
    case RecordActionTypes.SaveFailure:
      return {
        ...state,
        remoteRecord: RemoteFailure(action.payload.error),
      };
    default:
      return state;
  }
}

export { recordViewsByNameReducerFactory };
