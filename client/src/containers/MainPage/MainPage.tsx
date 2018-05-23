import * as React from 'react';
import { connect } from 'react-redux';
import { Route, Switch, withRouter } from 'react-router-dom';

import { RecordConfig, SiteConfig } from '../../cmsConfig';
import Layout from '../../components/Layout';
import NotFoundPage from '../../components/NotFoundPage';
import { getCmsConfig, RootState } from '../../states';

import {
  frontPageRedirect,
  pushNotificationRoutes,
  routesFromRecordConfigs,
  userManagementRoutes,
} from './routes';

export interface MainPageProps {
  siteItems: SiteConfig;
  recordConfigs: RecordConfig[];
  pushNotificationEnabled: boolean;
  userManagementEnabled: boolean;
}

class MainPage extends React.PureComponent<MainPageProps> {
  private frontPageRedirect: JSX.Element;
  private recordRoutes: JSX.Element[];
  private pushNotificationRoutes: JSX.Element[];
  private userManagementRoutes: JSX.Element[];

  constructor(props: MainPageProps) {
    super(props);

    this.frontPageRedirect = frontPageRedirect(props.siteItems);
    this.recordRoutes = routesFromRecordConfigs(props.recordConfigs);
    this.pushNotificationRoutes = pushNotificationRoutes();
    this.userManagementRoutes = userManagementRoutes();
  }

  public render() {
    const { pushNotificationEnabled, userManagementEnabled } = this.props;

    return (
      <Layout>
        <Switch>
          {this.frontPageRedirect}
          {this.recordRoutes}
          {pushNotificationEnabled && this.pushNotificationRoutes}
          {userManagementEnabled && this.userManagementRoutes}

          <Route component={NotFoundPage} />
        </Switch>
      </Layout>
    );
  }
}

function mapStateToProps(state: RootState): MainPageProps {
  const cmsConfig = getCmsConfig(state);
  return {
    pushNotificationEnabled: cmsConfig.pushNotifications.enabled,
    recordConfigs: Object.values(cmsConfig.records)
      .filter(recordConfig => recordConfig !== undefined)
      .map(recordConfig => recordConfig!),
    siteItems: cmsConfig.site,
    userManagementEnabled: cmsConfig.userManagement.enabled,
  };
}

const ConnectedMainPage = withRouter(connect(mapStateToProps)(MainPage));

export { ConnectedMainPage as MainPage };
