import React from 'react';

import logo from '../assets/logo.png';

import './Sidebar.css';

const Sidebar = () => {
  return (
    <nav className="col-3 sidebar">
      <a className="sidebar-logo" href="/">
        <img className="img-fluid" src={logo} alt="Skygear CMS" />
      </a>
      <ul className="nav flex-column">
        <li className="nav-item">
          <a className="nav-link active" href="/">
            Active
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="/">
            Link
          </a>
        </li>
        <li className="nav-item">
          <a className="nav-link" href="/">
            Link
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;
