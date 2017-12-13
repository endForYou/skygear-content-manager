import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Record } from 'skygear';

import { RecordActionDispatcher } from '../actions/record';
import { NewPage } from '../components/NewPage';
import { EditPageConfig } from '../cmsConfig';
import { RootState } from '../states';
import { Remote } from '../types';
// import { Remote, RemoteType } from '../types';

export interface NewPageContainerProps {
  config: EditPageConfig;
}

type Props = NewPageContainerProps & StateProps & DispatchProps;

interface StateProps {
  remoteRecord: Remote<Record>;
  savingRecord?: Remote<Record>;
}

interface DispatchProps {
  dispatch: Dispatch<RootState>;
}

class NewPageContainerImpl extends React.PureComponent<Props> {
  public recordDispatcher: RecordActionDispatcher;

  constructor(props: Props) {
    super(props);

    this.recordDispatcher = new RecordActionDispatcher(
      props.dispatch,
      props.config.cmsRecord,
      props.config.references
    );
  }

  public render() {
    return (
      <NewPage
        config={this.props.config}
        dispatch={this.props.dispatch}
        recordDispatcher={this.recordDispatcher}
        savingRecord={this.props.savingRecord}
      />
    );
  }
}

function mapStateToProps(
  state: RootState,
  ownProps: NewPageContainerProps
): StateProps {
  const recordName = ownProps.config.cmsRecord.name;
  return {
    remoteRecord: state.recordViewsByName[recordName].new.remoteRecord,
    savingRecord: state.recordViewsByName[recordName].new.savingRecord,
  };
}

function mapDispatchToProps(dispatch: Dispatch<RootState>): DispatchProps {
  return { dispatch };
}

const ConnectedNewPageContainer = connect(mapStateToProps, mapDispatchToProps)(
  NewPageContainerImpl
);

export const NewPageContainer: React.ComponentType<
  NewPageContainerProps
> = ConnectedNewPageContainer;
