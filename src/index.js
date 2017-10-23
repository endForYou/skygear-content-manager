import './index.css';

import { Provider } from 'react-redux';
import { BrowserRouter as Router, Route } from 'react-router-dom';
import { createStore, applyMiddleware } from 'redux';
import Promise from 'promise';
import PropTypes from 'prop-types';
import React from 'react';
import ReactDOM from 'react-dom';
import skygear from 'skygear';
import thunk from 'redux-thunk';

import { configFromEnv } from './config';
import App from './containers/App';
import registerServiceWorker from './registerServiceWorker';
import rootReducer from './reducers';

const config = configFromEnv();

const Root = ({ store }) => {
  return (
    <Provider store={store}>
      <Router>
        <Route path="/" component={App} />
      </Router>
    </Provider>
  );
};

Root.propTypes = {
  store: PropTypes.object.isRequired,
};

const fetchCurrentUserIfNeeded = () => {
  if (skygear.auth.currentUser) {
    return skygear.auth.whoami();
  } else {
    return Promise.resolve(null);
  }
};

skygear
  .config({
    endPoint: config.skygearEndpoint,
    apiKey: config.skygearApiKey,
  })
  .then(() => {
    return fetchCurrentUserIfNeeded();
  })
  .then(user => {
    let initialState;
    if (user !== null) {
      initialState = {
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
  });

registerServiceWorker();
