import * as React from 'react';
import { connect } from 'react-redux';

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
    return <LoginPage />;
  }

  if (cmsConfig && cmsConfig.type === RemoteType.Success) {
    return <MainPage />;
  }

  // TODO (Steven-Chan):
  // render cms loading page
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
