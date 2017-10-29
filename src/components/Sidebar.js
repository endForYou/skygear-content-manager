import './Sidebar.css';

import { NavLink, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import * as PropTypes from 'prop-types';
import * as React from 'react';

import logo from '../assets/logo.png';

const ItemPropTypes = {
  type: PropTypes.oneOf(['Record']).isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

const ItemListPropTypes = PropTypes.arrayOf(PropTypes.shape(ItemPropTypes));

const SidebarItemList = ({ items = [] }) => {
  const listItems = items.map(({ name, label }, index) => {
    return (
      <li key={index} className="nav-item">
        <NavLink className="nav-link" to={`/record/${name}`}>
          {label}
        </NavLink>
      </li>
    );
  });

  return <ul className="nav flex-column">{listItems}</ul>;
};

SidebarItemList.propTypes = {
  items: ItemListPropTypes.isRequired,
};

const _Sidebar = ({ items = [], ...rest }) => {
  return (
    <nav className="col-3 sidebar">
      <a className="sidebar-logo" href="/">
        <img className="img-fluid" src={logo} alt="Skygear CMS" />
      </a>
      <SidebarItemList items={items} {...rest} />
    </nav>
  );
};

_Sidebar.propTypes = {
  items: ItemListPropTypes.isRequired,
};

const mapStateToProps = state => {
  return {
    items: state.cmsConfig.site,
  };
};

const Sidebar = withRouter(connect(mapStateToProps)(_Sidebar));

export default Sidebar;
