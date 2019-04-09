import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { ShowPageConfig } from '../cmsConfig';
import { RootState } from '../states';
import { makeShowPage, ShowPageFetcherType } from './ShowPageFetcher';

export interface ShowPageContainerProps {
  config: ShowPageConfig;
  recordId: string;
}

type Props = ShowPageContainerProps & DispatchProps;

interface DispatchProps {
  dispatch: Dispatch<RootState>;
}

class ShowPageContainerImpl extends React.PureComponent<Props> {
  private showPageFetcher: ShowPageFetcherType;

  constructor(props: Props) {
    super(props);

    const { dispatch, config, recordId } = props;

    this.showPageFetcher = makeShowPage(dispatch, config, recordId);
  }

  render() {
    const ShowPageFetcher = this.showPageFetcher;
    return <ShowPageFetcher />;
  }
}

function mapDispatchToProps(dispatch: Dispatch<RootState>): DispatchProps {
  return {
    dispatch,
  };
}

export const ShowPageContainer: React.ComponentType<
  ShowPageContainerProps
> = connect(
  undefined,
  mapDispatchToProps
)(ShowPageContainerImpl);
