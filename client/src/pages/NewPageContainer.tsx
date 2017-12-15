import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Record } from 'skygear';

import { RecordActionDispatcher } from '../actions/record';
import { RecordFormPage } from '../components/RecordFormPage';
import { EditPageConfig } from '../cmsConfig';
import { RootState } from '../states';
import { Remote } from '../types';

export interface NewPageContainerProps {
  config: EditPageConfig;
}

type Props = NewPageContainerProps & StateProps & DispatchProps;

interface StateProps {
  savingRecord?: Remote<Record>;
}

interface DispatchProps {
  dispatch: Dispatch<RootState>;
}

class NewPageContainerImpl extends React.PureComponent<Props> {
  public recordDispatcher: RecordActionDispatcher;
  public newRecord: Record;

  constructor(props: Props) {
    super(props);

    this.recordDispatcher = new RecordActionDispatcher(
      props.dispatch,
      props.config.cmsRecord,
      props.config.references
    );

    this.newRecord = new (Record.extend(props.config.cmsRecord.name))();
    console.log(this.newRecord);

    console.log('constructing...');
    console.log(props.config);
  }

  public render() {
    return (
      <RecordFormPage
        config={this.props.config}
        dispatch={this.props.dispatch}
        recordDispatcher={this.recordDispatcher}
        record={this.newRecord}
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
