import { connect } from 'react-redux';
import * as PropTypes from 'prop-types';
import * as React from 'react';

import LoginPage from './LoginPage';
import MainPage from './MainPage';

const _App = ({ isLoggedIn }) => {
  return isLoggedIn ? <MainPage /> : <LoginPage />;
};

_App.propTypes = {
  isLoggedIn: PropTypes.bool,
};

const mapStateToProps = state => {
  return {
    isLoggedIn: state.auth.user !== null,
  };
};

const App = connect(mapStateToProps)(_App);

export default App;
