import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import skygear from 'skygear';

import App from './containers/App';
import rootReducer from './reducers';
import { configFromEnv } from './config';
import registerServiceWorker from './registerServiceWorker';

import './index.css';

const config = configFromEnv();

const store = createStore(rootReducer, applyMiddleware(thunk));

skygear
  .config({
    endPoint: config.skygearEndpoint,
    apiKey: config.skygearApiKey,
  })
  .then(
    () => {
      ReactDOM.render(
        <Provider store={store}>
          <App />
        </Provider>,
        document.getElementById('root')
      );
    },
    error => {
      console.log(`Couldn't configure skygear: ${error}`);
    }
  );

registerServiceWorker();
