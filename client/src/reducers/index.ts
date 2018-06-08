import { routerReducer } from 'react-router-redux';
import { combineReducers, Reducer } from 'redux';

import { RootState } from '../states';

import auth from './auth';
import cmsConfigReducer from './cmsConfig';
import { fileImportViewsReducer } from './fileImport';
import importReducer from './import';
import { pushCampaignViewsReducer } from './pushCampaign';
import recordViewsByNameReducer from './recordFactory';
import userReducer from './user';

const constReducer = (state = {}) => {
  return state;
};

function rootReducerFactory() {
  // fix issue with incorrect redux definition file.
  // See https://github.com/reactjs/redux/issues/2709
  // tslint:disable: no-any
  return combineReducers<RootState>({
    adminRole: constReducer as Reducer<any>,
    appConfig: constReducer as Reducer<any>,
    auth: auth as Reducer<any>,
    cmsConfig: cmsConfigReducer as Reducer<any>,
    fileImport: fileImportViewsReducer as Reducer<any>,
    import: importReducer as Reducer<any>,
    pushCampaign: pushCampaignViewsReducer as Reducer<any>,
    recordViewsByName: recordViewsByNameReducer as Reducer<any>,
    router: routerReducer as Reducer<any>,
    user: userReducer as Reducer<any>,
  });
  // tslint:enable: no-any
}

export default rootReducerFactory;
