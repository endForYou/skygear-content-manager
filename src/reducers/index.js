import { combineReducers } from 'redux';

import auth from './auth';

const constReducer = (state = {}) => {
  return state;
};

const rootReducer = combineReducers({
  auth,
  cmsConfig: constReducer,
});

export default rootReducer;
