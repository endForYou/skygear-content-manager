import { connect } from 'react-redux';
import * as PropTypes from 'prop-types';
import * as React from 'react';

const _FrontPage = user => {
  return <div>My name is {user.username} :D</div>;
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
