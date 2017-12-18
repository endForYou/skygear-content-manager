import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Record } from 'skygear';

import { RecordActionDispatcher } from '../actions/record';
import { RecordFormPageConfig } from '../cmsConfig';
import { RecordFormPage } from '../components/RecordFormPage';
import { RootState } from '../states';
import { Remote, RemoteType } from '../types';

export interface EditPageContainerProps {
  config: RecordFormPageConfig;
  recordId: string;
}

type Props = EditPageContainerProps & StateProps & DispatchProps;

interface StateProps {
  remoteRecord: Remote<Record>;
  savingRecord?: Remote<Record>;
}

interface DispatchProps {
  dispatch: Dispatch<RootState>;
}

class EditPageContainerImpl extends React.PureComponent<Props> {
  public recordDispatcher: RecordActionDispatcher;

  constructor(props: Props) {
    super(props);

    this.recordDispatcher = new RecordActionDispatcher(
      props.dispatch,
      props.config.cmsRecord,
      props.config.references
    );
  }

  public componentDidMount() {
    this.recordDispatcher.fetch(this.props.recordId);
  }

  public render() {
    const { remoteRecord, savingRecord } = this.props;
    switch (remoteRecord.type) {
      case RemoteType.Loading:
        return <div>Loading record...</div>;
      case RemoteType.Success:
        return (
          <RecordFormPage
            config={this.props.config}
            dispatch={this.props.dispatch}
            record={remoteRecord.value}
            recordDispatcher={this.recordDispatcher}
            savingRecord={savingRecord}
          />
        );
      case RemoteType.Failure:
        return (
          <div>Couldn&apos;t fetch record: {remoteRecord.error.message}</div>
        );
      default:
        throw new Error(
          `Unknown remote record type = ${this.props.remoteRecord.type}`
        );
    }
  }
}

function mapStateToProps(
  state: RootState,
  ownProps: EditPageContainerProps
): StateProps {
  const recordName = ownProps.config.cmsRecord.name;
  return {
    remoteRecord: state.recordViewsByName[recordName].edit.remoteRecord,
    savingRecord: state.recordViewsByName[recordName].edit.savingRecord,
  };
}

function mapDispatchToProps(dispatch: Dispatch<RootState>): DispatchProps {
  return { dispatch };
}

const ConnectedEditPageContainer = connect(mapStateToProps, mapDispatchToProps)(
  EditPageContainerImpl
);

export const EditPageContainer: React.ComponentType<
  EditPageContainerProps
> = ConnectedEditPageContainer;
