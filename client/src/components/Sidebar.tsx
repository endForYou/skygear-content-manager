import './Sidebar.css';

import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { Link, NavLink, withRouter } from 'react-router-dom';

import { logout } from '../actions/auth';
import * as logo from '../assets/logo.png';
import { SiteItemConfig, SiteItemConfigTypes } from '../cmsConfig';
import { getCmsConfig, RootState } from '../states';

export interface SidebarProps {
  items: SiteItemConfig[];
  pushNotificationEnabled: boolean;
}

interface DispatchProps {
  onLogout: () => void;
}

type Props = SidebarProps & DispatchProps;

class Sidebar extends React.PureComponent<Props> {
  public render() {
    // const { items } = this.props;

    return (
      <nav className="col-sm-3 sidebar">
        <Link className="sidebar-logo" to="/">
          <img className="img-fluid" src={logo} alt="Skygear CMS" />
        </Link>
        <ListItems {...this.props} />
      </nav>
    );
  }
}

function ListItems({
  items,
  pushNotificationEnabled,
  onLogout,
}: Props): JSX.Element {
  const listItems = items.map((item, index) => {
    return (
      <li key={index} className="nav-item">
        <Item item={item} />
      </li>
    );
  });

  let pushNotificationTab = null;

  if (pushNotificationEnabled) {
    pushNotificationTab = (
      <li key="notification" className="nav-item">
        <NavLink className="nav-link" to={`/notification`}>
          Push Notifications
        </NavLink>
      </li>
    );
  }

  return (
    <ul className="nav flex-column">
      {listItems}
      {pushNotificationTab}
      <li key="logout" className="nav-item">
        <LogoutButton onClick={onLogout} />
      </li>
    </ul>
  );
}

interface ItemProps {
  item: SiteItemConfig;
}

function Item({ item }: ItemProps): JSX.Element {
  switch (item.type) {
    case SiteItemConfigTypes.Record:
      return (
        <NavLink className="nav-link" to={`/records/${item.name}`}>
          {item.label}
        </NavLink>
      );
    case SiteItemConfigTypes.UserManagement:
      return (
        <NavLink className="nav-link" to={`/user-management`}>
          {item.label}
        </NavLink>
      );
  }
}

interface LogoutButtonProps {
  onClick: () => void;
}

function LogoutButton({ onClick }: LogoutButtonProps): JSX.Element {
  return (
    <NavLink className="nav-link" to="#" onClick={onClick}>
      Logout
    </NavLink>
  );
}

const mapStateToProps = (state: RootState): SidebarProps => {
  return {
    items: getCmsConfig(state).site,
    pushNotificationEnabled: getCmsConfig(state).pushNotifications.enabled,
  };
};

const mapDispatchToProps: MapDispatchToProps<DispatchProps, {}> = dispatch => {
  return {
    onLogout: () => {
      dispatch(logout());
    },
  };
};

const ConnectedSidebar = withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Sidebar)
);

export default ConnectedSidebar;
