import './UserListPage.scss';

import classNames from 'classnames';
import { Location } from 'history';
import * as React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import ReactToggle, { ReactToggleElement } from 'react-toggle';
// tslint:disable-next-line: no-submodule-imports
import 'react-toggle/style.css';
import { Dispatch } from 'redux';
import { Role } from 'skygear';

import { UserActionDispatcher } from '../../actions/user';
import {
  Filter,
  FilterConfig,
  FilterConfigTypes,
  filterFactory,
  FilterType,
} from '../../cmsConfig';
import { ClickOutside } from '../../components/ClickOutside';
import { FilterMenu } from '../../components/FilterMenu';
import { FilterTagList } from '../../components/FilterTagList';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';
import {
  InjectedProps as SyncFilterProps,
  syncFilterWithUrl,
} from '../../components/SyncUrl/SyncUrlFilter';
import {
  InjectedProps as SyncPageProps,
  syncPageWithUrl,
} from '../../components/SyncUrl/SyncUrlPage';
import { ToggleButton } from '../../components/ToggleButton';
import { RootState, RouteProps } from '../../states';
import { SkygearUser } from '../../types';
import { debounce } from '../../util';

// constants
const UserListPerPageCount = 20;

// TODO (Steven-Chan):
// Allow custom filter configuration
const filterConfigs: FilterConfig[] = [
  {
    label: '_id',
    name: '_id',
    nullable: false,
    type: FilterConfigTypes.String,
  },
  {
    label: 'Username',
    name: 'username',
    nullable: true,
    type: FilterConfigTypes.String,
  },
  {
    label: 'Email',
    name: 'email',
    nullable: true,
    type: FilterConfigTypes.String,
  },
];

const TableHeader: React.SFC = () => {
  return (
    <div className="table-header">
      <div className="table-row">
        <div className="table-cell">id</div>
        <div className="table-cell">Username</div>
        <div className="table-cell">Email</div>
        <div className="table-cell">CMS Access</div>
        <div className="table-cell" />
      </div>
    </div>
  );
};

interface TableRowProps {
  adminRole: string;
  showCMSAccess: boolean;
  onCMSAccessChange: (newValue: boolean) => void;
  user: SkygearUser;
}

const TableRow: React.SFC<TableRowProps> = ({
  adminRole,
  onCMSAccessChange,
  showCMSAccess,
  user,
}) => {
  const onChange: React.ReactEventHandler<ReactToggleElement> = event => {
    const checked = event.currentTarget.checked;
    onCMSAccessChange(checked);
  };

  const hasAdminRole = user.roles.reduce(
    (hasRole: boolean, role: Role) => hasRole || role.name === adminRole,
    false
  );

  return (
    <div className="table-row">
      <div className="table-cell">{user.id}</div>
      <div className="table-cell">
        {user.record ? user.record.username : ''}
      </div>
      <div className="table-cell">{user.record ? user.record.email : ''}</div>
      <div className="table-cell">
        {showCMSAccess && (
          <ReactToggle
            checked={hasAdminRole}
            disabled={user.isRolesUpdating}
            onChange={onChange}
          />
        )}
        {user.isRolesUpdating && <LoadingSpinner />}
      </div>
      <div className="table-cell">
        <Link className="item-action" to={`/user-management/${user.id}`}>
          Manage
        </Link>
      </div>
    </div>
  );
};

interface TableBodyProps {
  adminRole: string;
  onCMSAccessChange: (user: SkygearUser, newValue: boolean) => void;
  currentUserId: string;
  users: SkygearUser[];
}

const TableBody: React.SFC<TableBodyProps> = ({
  currentUserId,
  users,
  ...rest
}) => {
  const rows = users.map((user, index) => {
    const onCMSAccessChange = (newValue: boolean) => {
      rest.onCMSAccessChange(user, newValue);
    };
    return (
      <TableRow
        {...rest}
        key={index}
        showCMSAccess={user.id !== currentUserId}
        onCMSAccessChange={onCMSAccessChange}
        user={user}
      />
    );
  });
  return <div className="table-body">{rows}</div>;
};

interface ListTableProps {
  adminRole: string;
  onCMSAccessChange: (user: SkygearUser, newValue: boolean) => void;
  currentUserId: string;
  users: SkygearUser[];
}

const ListTable: React.SFC<ListTableProps> = (props: ListTableProps) => {
  return (
    <div key="table" className="list-table">
      <TableHeader />
      <TableBody {...props} />
    </div>
  );
};

type UserListPageProps = StateProps &
  DispatchProps &
  SyncFilterProps &
  SyncPageProps;

interface StateProps {
  adminRole: string;
  filterConfigs: FilterConfig[];
  location: Location;
  maxPage: number;
  isLoading: boolean;
  currentUserId: string;
  users: SkygearUser[];
}

interface DispatchProps {
  dispatch: Dispatch<RootState>;
}
interface State {
  showfilterMenu: boolean;
}

class UserListPageImpl extends React.PureComponent<UserListPageProps, State> {
  public userActionCreator: UserActionDispatcher;

  constructor(props: UserListPageProps) {
    super(props);

    const { dispatch } = props;

    this.state = {
      showfilterMenu: false,
    };

    this.userActionCreator = new UserActionDispatcher(dispatch);
    this.fetchList = debounce(this.fetchList.bind(this), 200);

    this.onCMSAccessChange = this.onCMSAccessChange.bind(this);
  }

  public componentDidMount() {
    this.reloadList(this.props);
  }

  public componentWillReceiveProps(nextProps: UserListPageProps) {
    const { filters, page } = this.props;

    if (filters !== nextProps.filters || page !== nextProps.page) {
      this.reloadList(nextProps);
    }
  }

  public toggleFilterMenu() {
    this.setState({ showfilterMenu: !this.state.showfilterMenu });
  }

  public onFilterChange = (filters: Filter[]) => {
    this.props.onChangePage();
    this.props.onChangeFilter(filters);
  };

  public onFilterItemClicked(filterConfig: FilterConfig) {
    const newFilter = filterFactory(filterConfig);

    const filters =
      filterConfig.type === FilterConfigTypes.General
        ? [newFilter]
        : [
            ...this.props.filters.filter(
              f => f.type !== FilterType.GeneralFilterType
            ),
            newFilter,
          ];

    this.onFilterChange(filters);
    this.toggleFilterMenu();
  }

  public render() {
    const {
      adminRole,
      currentUserId,
      filters,
      isLoading,
      location,
      maxPage,
      page,
      users,
    } = this.props;
    const { showfilterMenu } = this.state;

    return (
      <div className="user-list">
        <div className="topbar">
          <div className="title">User Management</div>
          <div className="action-container">
            <ClickOutside
              className={classNames('d-inline-block', {
                dropdown: !showfilterMenu,
                dropup: showfilterMenu,
              })}
              onClickOutside={() => this.setState({ showfilterMenu: false })}
            >
              <ToggleButton
                type="button"
                className="list-action dropdown-toggle"
                isActive={showfilterMenu}
                onClick={() => this.toggleFilterMenu()}
              >
                Add Filter <span className="caret" />
              </ToggleButton>

              <div
                className={classNames(
                  'list-filter-menu-wrapper',
                  showfilterMenu ? 'show' : ''
                )}
              >
                <div className="list-filter-menu">
                  <FilterMenu
                    filterConfigs={this.props.filterConfigs}
                    filters={filters}
                    onChangeFilter={this.onFilterChange}
                  />
                </div>
              </div>
            </ClickOutside>
          </div>
        </div>

        {filters.length > 0 && (
          <div className="list-filter-tag-list-container">
            <div className="list-filter-tag-list-label">Filter</div>
            <FilterTagList
              className="list-filter-tag-list"
              filters={filters}
              filterConfigs={this.props.filterConfigs}
              onChangeFilter={this.onFilterChange}
            />
          </div>
        )}

        <div className="list-content">
          {(() => {
            if (isLoading) {
              return <div className="list-loading">Loading...</div>;
            } else {
              if (users.length === 0) {
                return <div className="list-empty">No users found.</div>;
              } else {
                return (
                  <ListTable
                    adminRole={adminRole}
                    onCMSAccessChange={this.onCMSAccessChange}
                    currentUserId={currentUserId}
                    users={users}
                  />
                );
              }
            }
          })()}
        </div>

        {maxPage > 0 ? (
          <Pagination
            className="pagination"
            location={location}
            currentPage={page}
            maxPage={maxPage}
          />
        ) : null}
      </div>
    );
  }

  public reloadList(props: UserListPageProps) {
    const { filters, page } = props;
    this.fetchList(page, UserListPerPageCount, filters);
  }

  public fetchList(page: number, perPage: number, filters: Filter[]) {
    this.userActionCreator.fetchList(page, perPage, filters);
  }

  public onCMSAccessChange(user: SkygearUser, hasAccess: boolean) {
    const { adminRole } = this.props;
    this.userActionCreator.updateUserCMSAccess(user.id, hasAccess, adminRole);
  }
}

function UserListPageFactory() {
  function mapStateToProps(state: RootState, props: RouteProps): StateProps {
    const { location } = props;

    const adminRole = state.adminRole;
    const { isLoading, users, totalCount } = state.user;
    const currentUserId = state.auth.user ? state.auth.user._id : '';

    const maxPage = Math.ceil(totalCount / UserListPerPageCount);

    return {
      adminRole,
      currentUserId,
      filterConfigs,
      isLoading,
      location,
      maxPage,
      users,
    };
  }

  function mapDispatchToProps(dispatch: Dispatch<RootState>): DispatchProps {
    return { dispatch };
  }

  const SyncedListPage = syncFilterWithUrl(syncPageWithUrl(UserListPageImpl));
  return connect(
    mapStateToProps,
    mapDispatchToProps
  )(SyncedListPage);
}

export { UserListPageFactory };
