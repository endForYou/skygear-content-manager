import * as React from 'react';

import Sidebar from './Sidebar';

const Main: React.SFC = ({ children }) => {
  return (
    <main className="col-sm-9 pt-3" role="main">
      {children}
    </main>
  );
};

const Layout: React.SFC = ({ children, ...rest }) => {
  return (
    <div className="container-fluid">
      <div className="row">
        <Sidebar {...rest} />
        <Main>{children}</Main>
      </div>
    </div>
  );
};

export default Layout;
