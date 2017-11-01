import { AnyAction, combineReducers, Reducer } from 'redux';
import { Record } from 'skygear';

import {
  FETCH_RECORD_FAILURE,
  FETCH_RECORD_LIST_FAILURE,
  FETCH_RECORD_LIST_REQUEST,
  FETCH_RECORD_LIST_SUCCESS,
  FETCH_RECORD_REQUEST,
  FETCH_RECORD_SUCCESS,
} from '../actions/record';
import {
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
    if (action.payload && action.payload.recordName) {
      const recordName = action.payload.recordName;
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
    case FETCH_RECORD_LIST_REQUEST:
      return { ...state, page: action.payload.page };
    case FETCH_RECORD_LIST_SUCCESS:
      const { queryResult } = action.payload;
      return {
        ...state,
        isLoading: false,
        records: queryResult.map((record: Record) => record),
        totalCount: queryResult.overallCount,
      };
    case FETCH_RECORD_LIST_FAILURE:
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
    case FETCH_RECORD_REQUEST:
      return {
        ...state,
        remoteRecord: RemoteLoading,
      };
    case FETCH_RECORD_SUCCESS:
      return {
        ...state,
        remoteRecord: RemoteSuccess<Record>(action.payload.record),
      };
    case FETCH_RECORD_FAILURE:
      return {
        ...state,
        remoteRecord: RemoteFailure(action.payload.error),
      };
    default:
      return state;
  }
}

export { recordViewsByNameReducerFactory };
