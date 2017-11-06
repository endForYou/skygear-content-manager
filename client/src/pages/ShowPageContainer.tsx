import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { ShowPageConfig } from '../cmsConfig';
import { RootState } from '../states';
import { makeShowPage, ShowPageFetcherType } from './ShowPageFetcher';

type PureShowPageContainerProps = Props & DispatchProps;

interface Props {
  config: ShowPageConfig;
  recordId: string;
}

interface DispatchProps {
  dispatch: Dispatch<RootState>;
}

class PureShowPageContainer extends React.PureComponent<
  PureShowPageContainerProps
> {
  private showPageFetcher: ShowPageFetcherType;

  constructor(props: PureShowPageContainerProps) {
    super(props);

    const { dispatch, config, recordId } = props;

    this.showPageFetcher = makeShowPage(dispatch, config, recordId);
  }

  public render() {
    const ShowPageFetcher = this.showPageFetcher;
    return <ShowPageFetcher />;
  }
}

function mapDispatchToProps(dispatch: Dispatch<RootState>): DispatchProps {
  return {
    dispatch,
  };
}

const ShowPageContainer = connect(undefined, mapDispatchToProps)(
  PureShowPageContainer
);

export { ShowPageContainer };
