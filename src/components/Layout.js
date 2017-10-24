import PropTypes from 'prop-types';
import React from 'react';

import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="container">
      <div className="row">
        <Sidebar />
        <Main>{children}</Main>
      </div>
    </div>
  );
};

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};

const Main = ({ children }) => {
  return (
    <main className="col-9" role="main">
      {children}
    </main>
  );
};

Main.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
