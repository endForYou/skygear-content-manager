import './Layout.scss';

import * as React from 'react';

import Sidebar from './Sidebar';

const Main: React.SFC = ({ children }) => {
  return (
    <div className="scroll-view">
      <main className="content" role="main">
        {children}
      </main>
    </div>
  );
};

const Layout: React.SFC = ({ children, ...rest }) => {
  return (
    <div className="layout">
      <Sidebar {...rest} />
      <Main>{children}</Main>
    </div>
  );
};

export default Layout;
