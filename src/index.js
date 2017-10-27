import 'whatwg-fetch';

import './index.css';

import { Provider } from 'react-redux';
import { Route, BrowserRouter as Router, Switch } from 'react-router-dom';
import { createStore, applyMiddleware } from 'redux';
import Promise from 'bluebird';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import skygear from 'skygear';
import thunk from 'redux-thunk';
import yaml from 'js-yaml';

import { configFromEnv } from './config';
import { isObject } from './util';
import { parseCmsConfig } from './cmsConfig';
import App from './containers/App';
import registerServiceWorker from './registerServiceWorker';
import rootReducerFactory from './reducers';

const config = configFromEnv();

const Root = ({ store }) => {
  return (
    <Provider store={store}>
      <Router>
        <Switch>
          <Route path="/" component={App} />
        </Switch>
      </Router>
    </Provider>
  );
};

Root.propTypes = {
  store: PropTypes.object.isRequired,
};

const fetchUser = config => {
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
    return skygear.auth.whoami().catch(error => {
      console.log(`failed to fetch current user: ${error}`);

      throw error;
    });
  } else {
    return Promise.resolve(null);
  }
};

const fetchCmsConfig = config => {
  return fetch(config.cmsConfigUri)
    .then(resp => {
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
  ([user, cmsConfig]) => {
    const rootReducer = rootReducerFactory(Object.keys(cmsConfig.records));

    let initialState = {
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
      applyMiddleware(thunk)
    );
    ReactDOM.render(<Root store={store} />, document.getElementById('root'));
  },
  error => {
    console.log(`Failed to initialize CMS: ${error}`);
  }
);

registerServiceWorker();
