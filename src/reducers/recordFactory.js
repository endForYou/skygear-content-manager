import { combineReducers } from 'redux';

import {
  FETCH_RECORD_LIST_FAILURE,
  FETCH_RECORD_LIST_REQUEST,
  FETCH_RECORD_LIST_SUCCESS,
  isRecordNamed,
} from '../actions/record';

function recordViewsByNameReducerFactory(recordNames = []) {
  const initialRecordState = recordViewsReducer();
  const initialState = recordNames.reduce((state, recordName) => {
    return { ...state, [recordName]: initialRecordState };
  }, {});

  return (state = initialState, action) => {
    if (!isRecordNamed(action)) {
      return state;
    }

    const recordName = action.recordName;
    return {
      ...state,
      [recordName]: recordViewsReducer(state[recordName], action),
    };
  };
}

const recordViewsReducer = combineReducers({ list: recordListReducer });

function recordListReducer(
  state = {
    isLoading: true,
    page: 1,
    records: [],
    totalCount: 0,
    error: null,
  },
  action
) {
  if (!action) {
    return state;
  }

  switch (action.type) {
    case FETCH_RECORD_LIST_REQUEST:
      return { ...state, page: action.page };
    case FETCH_RECORD_LIST_SUCCESS:
      return {
        ...state,
        isLoading: false,
        records: action.queryResult.map(record => record),
        totalCount: action.queryResult.overallCount,
      };
    case FETCH_RECORD_LIST_FAILURE:
      return { ...state, isLoading: false, error: action.error };
  }

  return state;
}

export { recordViewsByNameReducerFactory };
