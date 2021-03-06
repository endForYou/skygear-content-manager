import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { Record } from 'skygear';

import { fetchRecord } from '../actions/record';
import { ShowPageConfig } from '../cmsConfig';
import { RootState } from '../states';
import { Remote } from '../types';
import { ShowPage } from './../components/ShowPage';

export type ShowPageFetcherType = React.ComponentType;

interface RemoteProps {
  remoteRecord: Remote<Record>;
}

export function makeShowPage(
  dispatch: Dispatch<RootState>,
  config: ShowPageConfig,
  recordId: string
): ShowPageFetcherType {
  const { cmsRecord } = config;

  function mapStateToProps(state: RootState): RemoteProps {
    return {
      remoteRecord: state.recordViewsByName[cmsRecord.name].show.remoteRecord,
    };
  }

  const ConnectedShowPage = connect(mapStateToProps)(ShowPage);

  const HOC = class extends React.Component {
    componentDidMount() {
      // TODO: use RecordActionDispatcher instead of direct dispatch
      dispatch(
        fetchRecord(config.cmsRecord, config.references, recordId, 'show')
      );
    }

    render() {
      return (
        <ConnectedShowPage
          cmsRecord={cmsRecord}
          recordId={recordId}
          config={config}
        />
      );
    }
  };

  return HOC;
}
