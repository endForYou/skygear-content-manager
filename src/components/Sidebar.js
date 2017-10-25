import './Sidebar.css';

import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import React from 'react';

import logo from '../assets/logo.png';

const ItemPropTypes = {
  type: PropTypes.oneOf(['record']),
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
};

const ItemListPropTypes = PropTypes.arrayOf(PropTypes.shape(ItemPropTypes));

const SidebarItemList = ({ items = [] }) => {
  const listItems = items.map(({ name, label }, index) => {
    return (
      <li key={index} className="nav-item">
        <a className="nav-link" href={`record/${name}`}>
          {label}
        </a>
      </li>
    );
  });

  return <ul className="nav flex-column">{listItems}</ul>;
};

SidebarItemList.propTypes = {
  items: ItemListPropTypes,
};

const _Sidebar = ({ items = [] }) => {
  return (
    <nav className="col-3 sidebar">
      <a className="sidebar-logo" href="/">
        <img className="img-fluid" src={logo} alt="Skygear CMS" />
      </a>
      <SidebarItemList items={items} />
    </nav>
  );
};

_Sidebar.propTypes = {
  items: ItemListPropTypes,
};

const mapStateToProps = state => {
  return { items: state.cmsConfig.site };
};

const Sidebar = connect(mapStateToProps)(_Sidebar);

export default Sidebar;
