import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

const _MainPage = ({ user }) => {
  return <div>My name is {user.username} :D</div>;
};

_MainPage.propTypes = {
  user: PropTypes.object,
};

const mapStateToProps = state => {
  return {
    user: state.auth.user,
  };
};

const MainPage = connect(mapStateToProps)(_MainPage);

export default MainPage;
