import './UserPage.scss';

import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { getCmsConfig, RootState } from '../../states';

import { UserActionDispatcher } from '../../actions/user';
import { UserManagementConfig } from '../../cmsConfig/userManagementConfig';
import { Remote, RemoteType, SkygearUser } from '../../types';
import { DisableUserForm } from './DisableUserForm';
import { PasswordForm } from './PasswordForm';
import { VerificationForm } from './VerificationForm';

interface StateProps {
  user: Remote<SkygearUser>;
  config: UserManagementConfig;
}

interface UserPageContainerProps {
  userId: string;
}

interface DispatchProps {
  dispatch: Dispatch<RootState>;
}

type Props = UserPageContainerProps & StateProps & DispatchProps;

class UserPageImpl extends React.PureComponent<Props> {
  userActionCreator: UserActionDispatcher;

  constructor(props: Props) {
    super(props);

    const { dispatch } = props;
    this.userActionCreator = new UserActionDispatcher(dispatch);
  }

  componentDidMount() {
    this.loadUser(this.props);
  }

  render() {
    const { config, user, userId } = this.props;

    let body;

    switch (user.type) {
      case RemoteType.Loading:
        body = <div className="user-page-form loading">Loading user...</div>;
        break;
      case RemoteType.Success:
        body = (
          <div>
            <PasswordForm className="user-page-form" userId={userId} />
            <DisableUserForm className="user-page-form" user={user.value} />
            {config.verification.enabled && (
              <VerificationForm
                className="user-page-form"
                user={user.value}
                config={config.verification}
              />
            )}
          </div>
        );
        break;
      case RemoteType.Failure:
        body = (
          <div className="user-page-form error">
            Couldn&apos;t fetch record: {user.error.message}
          </div>
        );
        break;
      default:
        throw new Error(`Unknown remote record type = ${this.props.user.type}`);
    }

    return (
      <div className="user-page">
        <div className="topbar">
          <div className="title">User Management</div>
        </div>
        {body}
      </div>
    );
  }

  private loadUser = (props: Props) => {
    this.userActionCreator.fetchUser(props.userId);
  };
}

function mapStateToProps(state: RootState): StateProps {
  return { user: state.user.user, config: getCmsConfig(state).userManagement };
}

function mapDispatchToProps(dispatch: Dispatch<RootState>): DispatchProps {
  return { dispatch };
}

const ConnectedEditPageContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(UserPageImpl);

export const UserPageContainer: React.ComponentType<
  UserPageContainerProps
> = ConnectedEditPageContainer;
