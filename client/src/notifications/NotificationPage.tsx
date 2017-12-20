import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Record } from 'skygear';

// import { RecordActionDispatcher } from '../actions/record';
import { RootState } from '../states';
import { Remote } from '../types';

export interface NotificationPageProps {
  config: string;
}

type Props = NotificationPageProps & StateProps & DispatchProps;

interface StateProps {
  savingRecord?: Remote<Record>;
}

interface DispatchProps {
  dispatch: Dispatch<RootState>;
}

class NotificationPageImpl extends React.PureComponent<Props> {
  // public recordDispatcher: RecordActionDispatcher;

  constructor(props: Props) {
    super(props);
  }

  public componentDidMount() {
    // this.recordDispatcher.fetch(this.props.recordId);
  }

  public render() {
    return <div>Loading record...</div>;
  }
}

function mapStateToProps(
  state: RootState,
  ownProps: NotificationPageProps
): StateProps {
  return {
    savingRecord: undefined,
  };
}

function mapDispatchToProps(dispatch: Dispatch<RootState>): DispatchProps {
  return { dispatch };
}

const ConnectedNotificationPage = connect(mapStateToProps, mapDispatchToProps)(
  NotificationPageImpl
);

export const NotificationPage: React.ComponentType<
  NotificationPageProps
> = ConnectedNotificationPage;
