import classNames from 'classnames';
import { Location } from 'history';
import * as qs from 'query-string';
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
import { FilterList } from '../../components/FilterList';
import { withEventHandler as withFilterListEventHandler } from '../../components/FilterListEventHandler';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';
import {
  InjectedProps as SyncFilterProps,
  syncFilterWithUrl,
} from '../../components/SyncUrl/SyncUrlFilter';
import { RootState, RouteProps } from '../../states';
import { SkygearUser } from '../../types';
import { debounce } from '../../util';

const HandledFilterList = withFilterListEventHandler(FilterList);

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
    <thead className="thead-light">
      <tr>
        <th>id</th>
        <th>Username</th>
        <th>Email</th>
        <th>CMS Access</th>
        <th />
      </tr>
    </thead>
  );
};

interface TableRowProps {
  adminRole: string;
  onCMSAccessChange: (newValue: boolean) => void;
  user: SkygearUser;
}

const TableRow: React.SFC<TableRowProps> = ({
  adminRole,
  onCMSAccessChange,
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
    <tr>
      <td>{user.record._id}</td>
      <td>{user.record.username}</td>
      <td>{user.record.email}</td>
      <td>
        <ReactToggle
          checked={hasAdminRole}
          disabled={user.isRolesUpdating}
          onChange={onChange}
        />
        {user.isRolesUpdating && <LoadingSpinner />}
      </td>
      <td>
        <Link
          className="btn btn-light"
          to={`/user-management/${user.record._id}/change-password`}
        >
          Change Password
        </Link>
      </td>
    </tr>
  );
};

interface TableBodyProps {
  adminRole: string;
  onCMSAccessChange: (user: SkygearUser, newValue: boolean) => void;
  users: SkygearUser[];
}

const TableBody: React.SFC<TableBodyProps> = ({ users, ...rest }) => {
  const rows = users.map((user, index) => {
    const onCMSAccessChange = (newValue: boolean) => {
      rest.onCMSAccessChange(user, newValue);
    };
    return (
      <TableRow
        {...rest}
        key={index}
        onCMSAccessChange={onCMSAccessChange}
        user={user}
      />
    );
  });
  return <tbody>{rows}</tbody>;
};

interface ListTableProps {
  adminRole: string;
  onCMSAccessChange: (user: SkygearUser, newValue: boolean) => void;
  users: SkygearUser[];
}

const ListTable: React.SFC<ListTableProps> = ({ users, ...rest }) => {
  return (
    <table key="table" className="table table-sm table-hover table-responsive">
      <TableHeader />
      <TableBody {...rest} users={users} />
    </table>
  );
};

type UserListPageProps = StateProps & DispatchProps & SyncFilterProps;

interface StateProps {
  adminRole: string;
  filterConfigs: FilterConfig[];
  location: Location;
  page: number;
  maxPage: number;
  isLoading: boolean;
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

    this.props.onChangeFilter(filters);
    this.toggleFilterMenu();
  }

  public render() {
    const {
      adminRole,
      filters,
      isLoading,
      location,
      maxPage,
      page,
      users,
    } = this.props;
    const { showfilterMenu } = this.state;

    return (
      <div>
        <div className="navbar">
          <h1 className="display-4">User Management</h1>
          <div className="float-right">
            <div className="dropdown float-right ml-2">
              <button
                type="button"
                className="btn btn-primary dropdown-toggle"
                onClick={() => this.toggleFilterMenu()}
              >
                Add Filter <span className="caret" />
              </button>

              <div
                style={{ right: 0, left: 'unset' }}
                className={classNames(
                  'dropdown-menu-right',
                  'dropdown-menu',
                  showfilterMenu ? 'show' : ''
                )}
              >
                {this.props.filterConfigs.map(filterConfig => (
                  <a
                    key={filterConfig.label}
                    className="dropdown-item"
                    onClick={() => this.onFilterItemClicked(filterConfig)}
                  >
                    {filterConfig.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="float-right">
          <HandledFilterList
            filters={filters}
            filterConfigs={this.props.filterConfigs}
            onChangeFilter={this.props.onChangeFilter}
          />
        </div>
        <div className="table-responsive">
          {(() => {
            if (isLoading) {
              return <div>Loading...</div>;
            } else {
              if (users.length === 0) {
                return <div>No records found.</div>;
              } else {
                return (
                  <ListTable
                    adminRole={adminRole}
                    onCMSAccessChange={this.onCMSAccessChange}
                    users={users}
                  />
                );
              }
            }
          })()}
          {maxPage > 0 ? (
            <Pagination
              location={location}
              currentPage={page}
              maxPage={maxPage}
            />
          ) : null}
        </div>
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
    const { page: pageStr = '1' } = qs.parse(location.search);
    const page = parseInt(pageStr, 10);

    const adminRole = state.adminRole;
    const { isLoading, users, totalCount } = state.user;

    const maxPage = Math.ceil(totalCount / UserListPerPageCount);

    return {
      adminRole,
      filterConfigs,
      isLoading,
      location,
      maxPage,
      page,
      users,
    };
  }

  function mapDispatchToProps(dispatch: Dispatch<RootState>): DispatchProps {
    return { dispatch };
  }

  const SyncedListPage = syncFilterWithUrl(UserListPageImpl);
  return connect(mapStateToProps, mapDispatchToProps)(SyncedListPage);
}

export { UserListPageFactory };
