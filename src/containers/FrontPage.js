import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

const _FrontPage = user => {
  return <div className="pt-3">My name is {user.username} :D</div>;
};

_FrontPage.propTypes = {
  user: PropTypes.object,
};

const mapStateToProps = state => {
  return {
    user: state.auth.user,
  };
};

const FrontPage = connect(mapStateToProps)(_FrontPage);

export default FrontPage;
