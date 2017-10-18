import React from 'react';
import ReactDOM from 'react-dom';
import skygear from 'skygear';

import './index.css';
import App from './containers/App';
import registerServiceWorker from './registerServiceWorker';
import { configFromEnv } from './config';

const config = configFromEnv();

skygear
  .config({
    endPoint: config.skygearEndpoint,
    apiKey: config.skygearApiKey,
  })
  .then(
    () => {
      ReactDOM.render(<App />, document.getElementById('root'));
    },
    error => {
      console.log(`Couldn't configure skygear: ${error}`);
    }
  );

registerServiceWorker();
