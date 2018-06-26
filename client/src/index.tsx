import './index.scss';

import { createBrowserHistory, History } from 'history';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router-dom';
import { ConnectedRouter, routerMiddleware } from 'react-router-redux';
import { applyMiddleware, createStore, Store } from 'redux';
import thunk from 'redux-thunk';
import skygear from 'skygear';

import defaultAppConfig, { AppConfig } from './config';
import { App } from './containers/App';
import { CMSConfigProvider } from './containers/CMSConfigProvider';
import { getUnauthenticatedMiddleware } from './middlewares';
import rootReducerFactory from './reducers';
import { getSettings } from './settings';
import { initialRootState, RootState } from './states';
import { generateCSSClass } from './theme';
import { getPath } from './util';

// tslint:disable-next-line: no-any
type User = any;

interface RootProps {
  history: History;
  store: Store<RootState>;
}

const Root = ({ history, store }: RootProps) => {
  return (
    <Provider store={store}>
      <CMSConfigProvider>
        <ConnectedRouter history={history}>
          <Switch>
            <Route path="/" component={App} />
          </Switch>
        </ConnectedRouter>
      </CMSConfigProvider>
    </Provider>
  );
};

// TODO (Steven-Chan):
// support registering custom CMSConfigProvider
function main(appConfig: AppConfig = defaultAppConfig): void {
  fetchUser(
    appConfig.skygearEndpoint,
    appConfig.skygearApiKey
  ).then((user: User) => {
    const publicUrl: string = appConfig.publicUrl;
    const history: History = createHistoryFromPublicUrl(publicUrl);
    const settings = getSettings();

    const initialState = initialRootState(
      appConfig.adminRole,
      appConfig,
      user,
      settings
    );
    const rootReducer = rootReducerFactory();
    const store = createStore<RootState>(
      rootReducer,
      initialState,
      applyMiddleware(
        thunk,
        routerMiddleware(history),
        getUnauthenticatedMiddleware()
      )
    );

    ReactDOM.render(
      <Root history={history} store={store} />,
      document.getElementById('root')
    );

    // inject theme classes to head
    const head = document.getElementsByTagName('head')[0];
    const linkElement: HTMLLinkElement = document.createElement('link');
    linkElement.setAttribute('rel', 'stylesheet');
    linkElement.setAttribute('type', 'text/css');
    linkElement.setAttribute(
      'href',
      'data:text/css;charset=UTF-8,' +
        encodeURIComponent(generateCSSClass(appConfig.style))
    );
    head.appendChild(linkElement);
  });
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
  skygear.pubsub.autoPubsub = false;
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
      return null;
    });
  } else {
    return Promise.resolve(null);
  }
}

/**
 * Export functions
 */
export const start = main;
