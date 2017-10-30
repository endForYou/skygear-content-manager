import './index.css';

import * as Promise from 'bluebird';
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
import { AppConfig, configFromEnv } from './config';
import App from './containers/App';
import rootReducerFactory from './reducers';
import registerServiceWorker from './registerServiceWorker';
import { isObject } from './util';

// tslint:disable-next-line: no-any
type User = any;

export interface AuthState {
  user: User;
}

export interface StoreState {
  cmsConfig: CmsConfig;
  auth?: AuthState;
}

export interface RootProps {
  config: AppConfig;
  history: History;
  store: Store<StoreState>;
}

const Root = ({ config, history, store }: RootProps) => {
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

function main(): void {
  const appConfig: AppConfig = configFromEnv();
  const history = createBrowserHistory({ basename: appConfig.publicUrl });

  Promise.all([fetchUser(appConfig), fetchCmsConfig(appConfig)]).then(
    ([user, cmsConfig]: [User, CmsConfig]) => {
      const rootReducer = rootReducerFactory(Object.keys(cmsConfig.records));

      let initialState: StoreState = { cmsConfig };

      if (user !== null) {
        initialState = {
          ...initialState,
          auth: { user },
        };
      }

      const store = createStore<StoreState>(
        rootReducer,
        initialState,
        applyMiddleware(thunk, routerMiddleware(history))
      );
      ReactDOM.render(
        <Root config={appConfig} history={history} store={store} />,
        document.getElementById('root')
      );
    },
    error => {
      console.log(`Failed to initialize CMS: ${error}`);
    }
  );
}

function fetchUser(config: AppConfig) {
  return skygear
    .config({
      apiKey: config.skygearApiKey,
      endPoint: config.skygearEndpoint,
    })
    .then(() => {
      return fetchCurrentUserIfNeeded();
    });
}

function fetchCurrentUserIfNeeded() {
  if (skygear.auth.currentUser) {
    return skygear.auth.whoami().catch((error: Error) => {
      console.log(`failed to fetch current user: ${error}`);

      throw error;
    });
  } else {
    return Promise.resolve(null);
  }
}

function fetchCmsConfig(config: AppConfig) {
  return fetch(config.cmsConfigUri)
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

registerServiceWorker();

main();
