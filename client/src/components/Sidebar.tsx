import './Sidebar.css';

import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { Link, NavLink, withRouter } from 'react-router-dom';

import { logout } from '../actions/auth';
import * as logo from '../assets/logo.png';
import {
  SiteItemConfig,
  SiteItemConfigTypes,
  SpaceSizeType,
} from '../cmsConfig';
import { getCmsConfig, RootState } from '../states';

export interface SidebarProps {
  items: SiteItemConfig[];
}

interface DispatchProps {
  onLogout: () => void;
}

type Props = SidebarProps & DispatchProps;

class Sidebar extends React.PureComponent<Props> {
  public render() {
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

function ListItems({ items, onLogout }: Props): JSX.Element {
  const listItems = items.map((item, index) => {
    return (
      <li key={index} className="nav-item">
        <Item item={item} />
      </li>
    );
  });

  return (
    <ul className="nav flex-column">
      {listItems}
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
    case SiteItemConfigTypes.PushNotifications:
      return (
        <NavLink className="nav-link" to={`/notification`}>
          {item.label}
        </NavLink>
      );
    case SiteItemConfigTypes.Space:
      return <Spacer size={item.size} />;
  }
}

interface SpacerProps {
  size: SpaceSizeType;
}

function Spacer({ size }: SpacerProps): JSX.Element {
  let sizeClassName;
  switch (size) {
    case SpaceSizeType.Small:
      sizeClassName = 'my-2';
      break;
    case SpaceSizeType.Medium:
      sizeClassName = 'my-4';
      break;
    case SpaceSizeType.Large:
      sizeClassName = 'my-5';
      break;
  }

  return <div className={sizeClassName} />;
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
