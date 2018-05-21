import './Sidebar.scss';

import * as React from 'react';
import { connect, MapDispatchToProps } from 'react-redux';
import { Link, NavLink, withRouter } from 'react-router-dom';
import { Record } from 'skygear';

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
  user?: Record;
}

interface DispatchProps {
  onLogout: () => void;
}

type Props = SidebarProps & DispatchProps;

class Sidebar extends React.PureComponent<Props> {
  public render() {
    const { user } = this.props;

    return (
      <nav className="sidebar sidebar-color">
        <Link className="sidebar-logo-link" to="/">
          <img className="sidebar-logo" src={logo} alt="Skygear CMS" />
        </Link>
        <div className="user">
          <div className="name">{user ? user.username : 'Unknown user'}</div>
          <NavLink className="btn-logout" to="#" onClick={this.props.onLogout}>
            LOG OUT
          </NavLink>
        </div>
        <ListItems {...this.props} />
      </nav>
    );
  }
}

function ListItems({ items }: Props): JSX.Element {
  const listItems = items.map((item, index) => {
    return (
      <div key={index}>
        <Item item={item} />
      </div>
    );
  });

  return <div>{listItems}</div>;
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

const mapStateToProps = (state: RootState): SidebarProps => {
  return {
    items: getCmsConfig(state).site,
    user: state.auth.user,
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
