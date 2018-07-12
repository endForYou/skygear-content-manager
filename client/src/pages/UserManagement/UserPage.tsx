import './UserPage.scss';

import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { RootState } from '../../states';

import { PasswordForm } from './PasswordForm';

interface UserPageContainerProps {
  userId: string;
}

interface DispatchProps {
  dispatch: Dispatch<RootState>;
}

type Props = UserPageContainerProps & DispatchProps;

const UserPageImpl: React.SFC<Props> = ({ userId }) => {
  return (
    <div className="user-page">
      <div className="topbar">
        <div className="title">User Management</div>
      </div>
      <PasswordForm className="user-page-section" userId={userId} />
    </div>
  );
};

function mapStateToProps(
  state: RootState,
  ownProps: UserPageContainerProps
): UserPageContainerProps {
  return { ...ownProps };
}

function mapDispatchToProps(dispatch: Dispatch<RootState>): DispatchProps {
  return { dispatch };
}

const ConnectedEditPageContainer = connect(mapStateToProps, mapDispatchToProps)(
  UserPageImpl
);

export const UserPageContainer: React.ComponentType<
  UserPageContainerProps
> = ConnectedEditPageContainer;
