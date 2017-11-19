import * as React from 'react';
import { connect, MapStateToProps } from 'react-redux';
import { Record } from 'skygear';

interface StateProps {
  user: Record;
}

const FrontPageImpl: React.SFC<StateProps> = ({ user }) => {
  return <div>My name is {user.username} :D</div>;
};

const mapStateToProps: MapStateToProps<StateProps, {}> = state => {
  return {
    user: state.auth.user,
  };
};

const FrontPage: React.ComponentType = connect(mapStateToProps)(FrontPageImpl);

export default FrontPage;
