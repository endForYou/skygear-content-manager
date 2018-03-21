import * as React from 'react';
import { connect } from 'react-redux';
import { Route, Switch, withRouter } from 'react-router-dom';

import { RecordConfig } from '../../cmsConfig';
import Layout from '../../components/Layout';
import NotFoundPage from '../../components/NotFoundPage';
import { getCmsConfig, RootState } from '../../states';
import FrontPage from '../FrontPage';

import {
  pushNotificationRoutes,
  routesFromRecordConfigs,
  userManagementRoutes,
} from './routes';

export interface MainPageProps {
  recordConfigs: RecordConfig[];
  pushNotificationEnabled: boolean;
  userManagementEnabled: boolean;
}

// tslint:disable-next-line: no-any
const AnyFrontPage = FrontPage as any;

class MainPage extends React.PureComponent<MainPageProps> {
  private recordRoutes: JSX.Element[];
  private pushNotificationRoutes: JSX.Element[];
  private userManagementRoutes: JSX.Element[];

  constructor(props: MainPageProps) {
    super(props);

    this.recordRoutes = routesFromRecordConfigs(props.recordConfigs);
    this.pushNotificationRoutes = pushNotificationRoutes();
    this.userManagementRoutes = userManagementRoutes();
  }

  public render() {
    const { pushNotificationEnabled, userManagementEnabled } = this.props;

    return (
      <Layout>
        <Switch>
          <Route exact={true} path="/" component={AnyFrontPage} />

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
    userManagementEnabled: cmsConfig.userManagement.enabled,
  };
}

const ConnectedMainPage = withRouter(connect(mapStateToProps)(MainPage));

export { ConnectedMainPage as MainPage };
