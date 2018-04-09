import './App.css';

import * as React from 'react';
import { connect } from 'react-redux';
import { Redirect, Route, Switch } from 'react-router-dom';

import * as loading from '../assets/loading.gif';
import { CmsConfigState, RootState } from '../states';
import { RemoteType } from '../types';

import LoginPage from './LoginPage';
import { MainPage } from './MainPage';

export interface AppProps {
  cmsConfig: CmsConfigState;
  isLoggedIn: boolean;
}

const App: React.StatelessComponent<AppProps> = ({ cmsConfig, isLoggedIn }) => {
  if (!isLoggedIn) {
    return (
      <Switch>
        <Route exact={true} path="/" component={LoginPage} />
        <Redirect to="/" />
      </Switch>
    );
  }

  if (cmsConfig) {
    switch (cmsConfig.type) {
      case RemoteType.Loading:
        return <img className="img-config-loading" src={loading} />;
      case RemoteType.Failure:
        return (
          <div>
            <h4 className="m-1">Failed to load configuration file.</h4>
            <p className="m-1 text-danger">{`${cmsConfig.error}`}</p>
          </div>
        );
      case RemoteType.Success:
        return <MainPage />;
    }
  }

  return null;
};

function mapStateToProps(state: RootState): AppProps {
  return {
    cmsConfig: state.cmsConfig,
    isLoggedIn: state.auth.user !== undefined,
  };
}

const ConnectedApp = connect(mapStateToProps)(App);

export { ConnectedApp as App };
