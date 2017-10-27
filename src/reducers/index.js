import { combineReducers } from 'redux';

import { recordViewsByNameReducerFactory } from './recordFactory';
import auth from './auth';

const constReducer = (state = {}) => {
  return state;
};

function rootReducerFactory(recordNames) {
  return combineReducers({
    auth,
    cmsConfig: constReducer,
    recordViewsByName: recordViewsByNameReducerFactory(recordNames),
  });
}

export default rootReducerFactory;
