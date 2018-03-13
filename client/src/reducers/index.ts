import { routerReducer } from 'react-router-redux';
import { combineReducers, Reducer } from 'redux';

import { RootState } from '../states';

import auth from './auth';
import importReducer from './import';
import { pushCampaignViewsReducer } from './pushCampaign';
import { recordViewsByNameReducerFactory } from './recordFactory';
import userReducer from './user';

const constReducer = (state = {}) => {
  return state;
};

function rootReducerFactory(recordNames: string[]) {
  // fix issue with incorrect redux definition file.
  // See https://github.com/reactjs/redux/issues/2709
  // tslint:disable: no-any
  return combineReducers<RootState>({
    adminRole: constReducer as Reducer<any>,
    auth: auth as Reducer<any>,
    cmsConfig: constReducer as Reducer<any>,
    import: importReducer as Reducer<any>,
    pushCampaign: pushCampaignViewsReducer as Reducer<any>,
    recordViewsByName: recordViewsByNameReducerFactory(recordNames) as Reducer<
      any
    >,
    router: routerReducer as Reducer<any>,
    user: userReducer as Reducer<any>,
  });
  // tslint:enable: no-any
}

export default rootReducerFactory;
