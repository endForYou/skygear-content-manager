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
import { LoadingSpinner } from '../../components/LoadingSpinner';
import Pagination from '../../components/Pagination';
import { RootState } from '../../states';
import { SkygearUser } from '../../types';
import { debounce } from '../../util';

// constants
const UserListPerPageCount = 20;

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

type UserListPageProps = StateProps & DispatchProps;

interface StateProps {
  adminRole: string;
  page: number;
  maxPage: number;
  isLoading: boolean;
  users: SkygearUser[];
}

interface DispatchProps {
  dispatch: Dispatch<RootState>;
}

class UserListPageImpl extends React.PureComponent<UserListPageProps> {
  public userActionCreator: UserActionDispatcher;

  constructor(props: UserListPageProps) {
    super(props);

    const { dispatch } = props;

    this.userActionCreator = new UserActionDispatcher(dispatch);
    this.fetchList = debounce(this.fetchList.bind(this), 200);

    this.onPageItemClicked = this.onPageItemClicked.bind(this);
    this.onCMSAccessChange = this.onCMSAccessChange.bind(this);
  }

  public componentDidMount() {
    const { page } = this.props;
    this.fetchList(page, UserListPerPageCount);
  }

  public render() {
    const { adminRole, isLoading, maxPage, page, users } = this.props;

    return (
      <div>
        <div className="navbar">
          <h1 className="display-4">User Management</h1>
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
              pathname="/user-management"
              currentPage={page}
              maxPage={maxPage}
              onItemClicked={this.onPageItemClicked}
            />
          ) : null}
        </div>
      </div>
    );
  }

  public onPageItemClicked = (page: number) => {
    this.fetchList(page, UserListPerPageCount);
  };

  public fetchList(page: number, perPage: number) {
    this.userActionCreator.fetchList(page, perPage);
  }

  public onCMSAccessChange(user: SkygearUser, hasAccess: boolean) {
    const { adminRole } = this.props;
    this.userActionCreator.updateUserCMSAccess(user.id, hasAccess, adminRole);
  }
}

function UserListPageFactory() {
  function mapStateToProps(state: RootState): StateProps {
    const { location } = state.router;
    const { page: pageStr = '1' } = qs.parse(location ? location.search : '');
    const page = parseInt(pageStr, 10);

    const adminRole = state.adminRole;
    const { isLoading, users, totalCount } = state.user;

    const maxPage = Math.ceil(totalCount / UserListPerPageCount);

    return {
      adminRole,
      isLoading,
      maxPage,
      page,
      users,
    };
  }

  function mapDispatchToProps(dispatch: Dispatch<RootState>): DispatchProps {
    return { dispatch };
  }

  return connect(mapStateToProps, mapDispatchToProps)(UserListPageImpl);
}

export { UserListPageFactory };
