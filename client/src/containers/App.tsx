import * as React from 'react';
import { connect } from 'react-redux';

import { RootState } from '../states';

import LoginPage from './LoginPage';
import { MainPage } from './MainPage';

export interface AppProps {
  isLoggedIn: boolean;
}

const App: React.StatelessComponent<AppProps> = ({ isLoggedIn }) => {
  return isLoggedIn ? <MainPage /> : <LoginPage />;
};

function mapStateToProps(state: RootState): AppProps {
  return {
    isLoggedIn: state.auth.user !== undefined,
  };
}

const ConnectedApp = connect(mapStateToProps)(App);

export { ConnectedApp as App };
