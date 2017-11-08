import './Sidebar.css';

import * as React from 'react';
import { connect } from 'react-redux';
import { Link, NavLink, withRouter } from 'react-router-dom';

import * as logo from '../assets/logo.png';
import { RecordSiteItemConfig, RecordSiteItemConfigType } from '../cmsConfig';
import { RootState } from '../states';

export interface SidebarProps {
  items: RecordSiteItemConfig[];
}

class Sidebar extends React.PureComponent<SidebarProps> {
  public render() {
    const { items } = this.props;

    return (
      <nav className="col-sm-3 sidebar">
        <Link className="sidebar-logo" to="/">
          <img className="img-fluid" src={logo} alt="Skygear CMS" />
        </Link>
        <ListItems items={items} />
      </nav>
    );
  }
}

function ListItems({ items }: SidebarProps): JSX.Element {
  const listItems = items.map((item, index) => {
    return (
      <li key={index} className="nav-item">
        <Item item={item} />
      </li>
    );
  });

  return <ul className="nav flex-column">{listItems}</ul>;
}

interface ItemProps {
  item: RecordSiteItemConfig;
}

function Item({ item }: ItemProps): JSX.Element {
  switch (item.type) {
    case RecordSiteItemConfigType.Record:
      return (
        <NavLink className="nav-link" to={`/record/${item.name}`}>
          {item.label}
        </NavLink>
      );
    default:
      return (
        <span>
          Unknown item type = {item.type}; name = {item.name}; label ={' '}
          {item.label}
        </span>
      );
  }
}

const mapStateToProps = (state: RootState): SidebarProps => {
  return {
    items: state.cmsConfig.site,
  };
};

const ConnectedSidebar = withRouter(connect(mapStateToProps)(Sidebar));

export default ConnectedSidebar;