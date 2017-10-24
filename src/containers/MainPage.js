import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

import Layout from '../components/Layout';

const _MainPage = ({ user }) => {
  return (
    <Layout>
      <div>My name is {user.username} :D</div>
    </Layout>
  );
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
