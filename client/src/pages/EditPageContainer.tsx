import './EditPageContainer.scss';

import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Record } from 'skygear';

import { RecordActionDispatcher } from '../actions/record';
import { RecordFormPageConfig } from '../cmsConfig';
import { RecordFormPage } from '../components/RecordFormPage';
import { RecordFormTopbar } from '../components/RecordFormTopbar';
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
      props.config.references,
      'edit'
    );
  }

  public componentDidMount() {
    this.recordDispatcher.fetch(this.props.recordId);
  }

  public render() {
    const { config, dispatch, remoteRecord, savingRecord } = this.props;
    let content;
    switch (remoteRecord.type) {
      case RemoteType.Loading:
        content = <div className="record-form loading">Loading record...</div>;
        break;
      case RemoteType.Success:
        content = (
          <RecordFormPage
            className="record-form"
            config={config}
            dispatch={dispatch}
            record={remoteRecord.value}
            recordDispatcher={this.recordDispatcher}
            savingRecord={savingRecord}
          />
        );
        break;
      case RemoteType.Failure:
        content = (
          <div className="record-form error">
            Couldn&apos;t fetch record: {remoteRecord.error.message}
          </div>
        );
        break;
      default:
        throw new Error(
          `Unknown remote record type = ${this.props.remoteRecord.type}`
        );
    }

    return (
      <div className="edit-page">
        <RecordFormTopbar
          title={config.label}
          actions={
            remoteRecord.type === RemoteType.Success ? config.actions : []
          }
          actionContext={
            remoteRecord.type === RemoteType.Success
              ? { record: remoteRecord.value, cmsRecord: config.cmsRecord }
              : { cmsRecord: config.cmsRecord }
          }
        />
        {content}
      </div>
    );
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

const ConnectedEditPageContainer = connect(
  mapStateToProps,
  mapDispatchToProps
)(EditPageContainerImpl);

export const EditPageContainer: React.ComponentType<
  EditPageContainerProps
> = ConnectedEditPageContainer;
