import * as PropTypes from 'prop-types';
import * as React from 'react';

import Sidebar from './Sidebar';

const Layout = ({ children, ...rest }) => {
  return (
    <div className="container">
      <div className="row">
        <Sidebar {...rest} />
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
    <main className="col-9 pt-3" role="main">
      {children}
    </main>
  );
};

Main.propTypes = {
  children: PropTypes.node.isRequired,
};

export default Layout;
