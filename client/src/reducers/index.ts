import { routerReducer } from 'react-router-redux';
import { combineReducers } from 'redux';

import { RootState } from '../states';

import auth from './auth';
import { recordViewsByNameReducerFactory } from './recordFactory';

const constReducer = (state = {}) => {
  return state;
};

function rootReducerFactory(recordNames: string[]) {
  return combineReducers<RootState>({
    auth,
    cmsConfig: constReducer,
    recordViewsByName: recordViewsByNameReducerFactory(recordNames),
    router: routerReducer,
  });
}

export default rootReducerFactory;
