import * as React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Dispatch } from 'redux';

import { RecordConfig, ShowPageConfig } from '../cmsConfig';
import { RootState } from '../states';
import { makeShowPage, ShowPageFetcherType } from './ShowPageFetcher';

type ShowPageContainerProps = StateProps & DispatchProps;

interface StateProps {
  configResult: ConfigResult;
  params: Params;
}

interface DispatchProps {
  dispatch: Dispatch<RootState>;
}

interface Params {
  recordName: string;
  recordId: string;
}

type ConfigResult = ConfigFound | CmsRecordNotFound | ConfigNotFound;

interface ConfigFound {
  type: 'CONFIG_FOUND';
  config: ShowPageConfig;
}

interface CmsRecordNotFound {
  type: 'CMS_RECORD_NOT_FOUND';
  recordName: string;
}

interface ConfigNotFound {
  type: 'CONFIG_NOT_FOUND';
  recordConfig: RecordConfig;
}

export class ShowPageConfigFetcher extends React.PureComponent<
  ShowPageContainerProps
> {
  private showPageFetcher?: ShowPageFetcherType;

  constructor(props: ShowPageContainerProps) {
    super(props);

    const { dispatch, configResult, params } = props;

    this.showPageFetcher =
      configResult.type === 'CONFIG_FOUND'
        ? makeShowPage(dispatch, configResult.config, params.recordId)
        : undefined;
  }

  public render() {
    const { configResult } = this.props;

    switch (configResult.type) {
      case 'CONFIG_FOUND':
        const ShowPageFetcher = this.showPageFetcher!;
        return <ShowPageFetcher />;
      case 'CMS_RECORD_NOT_FOUND':
        return (
          <div>
            Couldn&apos;t find CMS record with name = {configResult.recordName}
          </div>
        );
      case 'CONFIG_NOT_FOUND':
        return (
          <div>
            Couldn&apos;t find view for CMS record name ={' '}
            {configResult.recordConfig.recordName}
          </div>
        );
      default:
        // unreachable
        throw new Error(`unknown configResult.type`);
    }
  }
}

function mapStateToProps(
  state: RootState,
  ownProps: RouteComponentProps<Params>
): StateProps {
  const { match: { params } } = ownProps;
  const { recordName } = params;
  const recordConfig = state.cmsConfig.records[recordName];

  const constProps = {
    params,
  };

  if (!recordConfig) {
    return {
      ...constProps,
      configResult: {
        recordName,
        type: 'CMS_RECORD_NOT_FOUND',
      },
    };
  }

  if (!recordConfig.show) {
    return {
      ...constProps,
      configResult: {
        recordConfig,
        type: 'CONFIG_NOT_FOUND',
      },
    };
  }

  return {
    ...constProps,
    configResult: {
      config: recordConfig.show,
      type: 'CONFIG_FOUND',
    },
  };
}

function mapDispatchToProps(dispatch: Dispatch<RootState>): DispatchProps {
  return {
    dispatch,
  };
}

const ShowPageContainer = connect(mapStateToProps, mapDispatchToProps)(
  ShowPageConfigFetcher
);

export { ShowPageContainer };
