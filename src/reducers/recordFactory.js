import { combineReducers } from 'redux';

import {
  FETCH_RECORD_LIST_FAILURE,
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
  state = { isLoading: true, records: [], error: null },
  action
) {
  if (!action) {
    return state;
  }

  switch (action.type) {
    case FETCH_RECORD_LIST_SUCCESS:
      return { ...state, isLoading: false, records: action.records };
    case FETCH_RECORD_LIST_FAILURE:
      return { ...state, isLoading: false, error: action.error };
  }

  return state;
}

export { recordViewsByNameReducerFactory };
