import './index.css';

import { ConnectedRouter, routerMiddleware } from 'react-router-redux';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { Store, applyMiddleware, createStore } from 'redux';
import * as Promise from 'bluebird';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import createHistory from 'history/createBrowserHistory';
import skygear from 'skygear';
import thunk from 'redux-thunk';
import * as yaml from 'js-yaml';

import { CmsConfig } from './cmsConfig';
import { configFromEnv } from './config';
import { isObject } from './util';
import { parseCmsConfig } from './cmsConfig';
import App from './containers/App';
import registerServiceWorker from './registerServiceWorker';
import rootReducerFactory from './reducers';

type User = any;

export interface AuthState {
  user: User;
}

export interface StoreState {
  cmsConfig: CmsConfig;
  auth?: AuthState;
}

export interface RootProps {
  store: Store<StoreState>;
}

export interface AppConfig {
  skygearEndpoint: string;
  skygearApiKey: string;
  cmsConfigUri: string;
}

const history = createHistory();
const config: AppConfig = configFromEnv();

const Root = ({ store }: RootProps) => {
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

const fetchUser = (config: AppConfig) => {
  return skygear
    .config({
      endPoint: config.skygearEndpoint,
      apiKey: config.skygearApiKey,
    })
    .then(() => {
      return fetchCurrentUserIfNeeded();
    });
};

const fetchCurrentUserIfNeeded = () => {
  if (skygear.auth.currentUser) {
    return skygear.auth.whoami().catch((error: Error) => {
      console.log(`failed to fetch current user: ${error}`);

      throw error;
    });
  } else {
    return Promise.resolve(null);
  }
};

const fetchCmsConfig = (config: AppConfig) => {
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
};

Promise.all([fetchUser(config), fetchCmsConfig(config)]).then(
  ([user, cmsConfig]: [User, CmsConfig]) => {
    const rootReducer = rootReducerFactory(Object.keys(cmsConfig.records));

    let initialState: StoreState = {
      cmsConfig: cmsConfig,
    };

    if (user !== null) {
      initialState = {
        ...initialState,
        auth: {
          user: user,
        },
      };
    }

    const store = createStore(
      rootReducer,
      initialState,
      applyMiddleware(thunk, routerMiddleware(history))
    );
    ReactDOM.render(<Root store={store} />, document.getElementById('root'));
  },
  error => {
    console.log(`Failed to initialize CMS: ${error}`);
  }
);

registerServiceWorker();
