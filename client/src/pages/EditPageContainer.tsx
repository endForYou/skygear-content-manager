import * as React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators, Dispatch } from 'redux';
import { Record } from 'skygear';

import { fetchRecord, saveRecord } from '../actions/record';
import { EditPageConfig } from '../cmsConfig';
import { EditPage } from '../components/EditPage';
import { RootState } from '../states';
import { Remote, RemoteType } from '../types';

type EditPageContainerProps = OwnProps & StateProps & DispatchProps;

interface OwnProps {
  config: EditPageConfig;
  recordId: string;
}

interface StateProps {
  remoteRecord: Remote<Record>;
}

interface DispatchProps {
  fetchRecord: typeof fetchRecord;
  saveRecord: typeof saveRecord;
}

class EditPageContainer extends React.PureComponent<EditPageContainerProps> {
  public componentDidMount() {
    this.props.fetchRecord(this.props.config.cmsRecord, this.props.recordId);
  }

  public render() {
    const { remoteRecord } = this.props;
    switch (remoteRecord.type) {
      case RemoteType.Loading:
        return <div>Loading record...</div>;
      case RemoteType.Success:
        return (
          <EditPage
            config={this.props.config}
            record={remoteRecord.value}
            saveRecord={this.props.saveRecord}
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

function mapStateToProps(state: RootState, ownProps: OwnProps): StateProps {
  return {
    remoteRecord:
      state.recordViewsByName[ownProps.config.cmsRecord.name].edit.remoteRecord,
  };
}

function mapDispatchToProps(dispatch: Dispatch<RootState>): DispatchProps {
  return bindActionCreators(
    {
      fetchRecord,
      saveRecord,
    },
    dispatch
  );
}

const ConnectedEditPageContainer = connect(mapStateToProps, mapDispatchToProps)(
  EditPageContainer
);

export { ConnectedEditPageContainer as EditPageContainer };
