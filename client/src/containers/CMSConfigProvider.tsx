import * as React from 'react';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

import { fetchCmsConfig } from '../actions/cmsConfig';
import { AuthState, CmsConfigState, RootState } from '../states';

interface StateProps {
  auth: AuthState;
  cmsConfig: CmsConfigState;
  cmsConfigUrl: string;
}

interface DispatchProps {
  dispatch: Dispatch<RootState>;
}

type Props = StateProps & DispatchProps;

class CMSConfigProviderImpl extends React.PureComponent<Props> {
  public componentDidMount() {
    if (this.props.auth.user && this.props.cmsConfig === null) {
      this.fetchCmsConfig();
    }
  }

  public componentWillReceiveProps(nextProps: Props) {
    if (!this.props.auth.user && nextProps.auth.user) {
      this.fetchCmsConfig();
    }
  }

  public render() {
    return this.props.children;
  }

  private fetchCmsConfig() {
    const { cmsConfigUrl, dispatch } = this.props;

    dispatch(fetchCmsConfig(cmsConfigUrl));
  }
}

function mapStateToProps(state: RootState): StateProps {
  return {
    auth: state.auth,
    cmsConfig: state.cmsConfig,
    cmsConfigUrl: state.appConfig.cmsConfigUrl,
  };
}

function mapDispatchToProps(dispatch: Dispatch<RootState>): DispatchProps {
  return { dispatch };
}

export const CMSConfigProvider = connect(
  mapStateToProps,
  mapDispatchToProps
)(CMSConfigProviderImpl);
