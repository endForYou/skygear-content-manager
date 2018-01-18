import './index.css';

import { createBrowserHistory, History } from 'history';
import * as yaml from 'js-yaml';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { ConnectedRouter, routerMiddleware } from 'react-router-redux';
import { applyMiddleware, createStore, Store } from 'redux';
import thunk from 'redux-thunk';
import skygear from 'skygear';

import { CmsConfig, parseCmsConfig } from './cmsConfig';
import defaultAppConfig, { AppConfig } from './config';
import { App } from './containers/App';
import rootReducerFactory from './reducers';
import { initialRootState, RootState } from './states';
import { getPath, isObject } from './util';

// tslint:disable-next-line: no-any
type User = any;

interface RootProps {
  history: History;
  store: Store<RootState>;
}

export interface CmsRenderConfig {
  cmsConfig: CmsConfig;
  publicUrl: string;
  skygearApiKey: string;
  skygearEndpoint: string;
}

const Root = ({ history, store }: RootProps) => {
  return (
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <Switch>
          <Route path="/" component={App} />
        </Switch>
      </ConnectedRouter>
    </Provider>
  );
};

function main(appConfig: AppConfig = defaultAppConfig): void {
  fetchCmsConfig(appConfig).then(
    (cmsConfig: CmsConfig) => {
      const cmsRenderConfig: CmsRenderConfig = {
        cmsConfig,
        publicUrl: appConfig.publicUrl,
        skygearApiKey: appConfig.skygearApiKey,
        skygearEndpoint: appConfig.skygearEndpoint,
      };

      renderCms(cmsRenderConfig);
    },
    error => {
      console.log('Failed to initialize CMS:', error);
    }
  );
}

export function renderCms(cmsRenderConfig: CmsRenderConfig): void {
  const cmsConfig: CmsConfig = cmsRenderConfig.cmsConfig;
  const publicUrl: string = cmsRenderConfig.publicUrl;
  const history: History = createHistoryFromPublicUrl(publicUrl);

  fetchUser(
    cmsRenderConfig.skygearEndpoint,
    cmsRenderConfig.skygearApiKey
  ).then(
    (user: User) => {
      const recordNames = Object.keys(cmsConfig.records);

      const rootReducer = rootReducerFactory(recordNames);
      const initialState = initialRootState(cmsConfig, recordNames, user);

      const store = createStore<RootState>(
        rootReducer,
        initialState,
        applyMiddleware(thunk, routerMiddleware(history))
      );
      ReactDOM.render(
        <Root history={history} store={store} />,
        document.getElementById('root')
      );
    },
    error => {
      console.log('Failed to render CMS:', error);
    }
  );
}

function createHistoryFromPublicUrl(publicUrl: string): History {
  if (publicUrl === '.') {
    return createBrowserHistory();
  } else {
    let pathname: string;
    try {
      pathname = getPath(publicUrl);
    } catch (_) {
      pathname = publicUrl;
    }

    return createBrowserHistory({
      basename: pathname,
    });
  }
}

function fetchUser(endPoint: string, apiKey: string) {
  return skygear
    .config({
      apiKey,
      endPoint,
    })
    .then(() => {
      return fetchCurrentUserIfNeeded();
    });
}

function fetchCurrentUserIfNeeded() {
  if (skygear.auth.currentUser) {
    return skygear.auth.whoami().catch((error: Error) => {
      console.log('Failed to fetch current user:', error);

      throw error;
    });
  } else {
    return Promise.resolve(null);
  }
}

function fetchCmsConfig(config: AppConfig) {
  return fetch(config.cmsConfigUrl)
    .then((resp: Response) => {
      return resp.text();
    })
    .then(text => {
      const parsed = yaml.safeLoad(text);
      if (isObject(parsed)) {
        return parseCmsConfig(parsed);
      } else {
        throw new Error(`Couldn't parse config file: ${text}`);
      }
    });
}

/**
 * Export functions
 */
export const start = main;
