import * as React from 'react';
import { connect } from 'react-redux';
import { Route, Switch, withRouter } from 'react-router-dom';

import { RecordConfig, SiteConfig } from '../../cmsConfig';
import Layout from '../../components/Layout';
import NotFoundPage from '../../components/NotFoundPage';
import { getCmsConfig, RootState } from '../../states';

import { SettingsPageFactory } from '../../pages/SettingsPage';
import {
  fileImportRoutes,
  frontPageRedirect,
  pushNotificationRoutes,
  routesFromRecordConfigs,
  userManagementRoutes,
} from './routes';

export interface MainPageProps {
  siteItems: SiteConfig;
  recordConfigs: RecordConfig[];
  fileImportEnabled: boolean;
  pushNotificationEnabled: boolean;
  userManagementEnabled: boolean;
}

class MainPage extends React.PureComponent<MainPageProps> {
  private frontPageRedirect: JSX.Element;
  private recordRoutes: JSX.Element[];
  private pushNotificationRoutes: JSX.Element[];
  private userManagementRoutes: JSX.Element[];
  private fileImportRoutes: JSX.Element[];

  constructor(props: MainPageProps) {
    super(props);

    this.frontPageRedirect = frontPageRedirect(props.siteItems);
    this.recordRoutes = routesFromRecordConfigs(props.recordConfigs);
    this.pushNotificationRoutes = pushNotificationRoutes();
    this.userManagementRoutes = userManagementRoutes();
    this.fileImportRoutes = fileImportRoutes();
  }

  render() {
    const {
      fileImportEnabled,
      pushNotificationEnabled,
      userManagementEnabled,
    } = this.props;

    return (
      <Layout>
        <Switch>
          {this.frontPageRedirect}
          {this.recordRoutes}
          {pushNotificationEnabled && this.pushNotificationRoutes}
          {userManagementEnabled && this.userManagementRoutes}
          {fileImportEnabled && this.fileImportRoutes}

          <Route
            exact={true}
            path="/settings"
            component={SettingsPageFactory()}
          />

          <Route component={NotFoundPage} />
        </Switch>
      </Layout>
    );
  }
}

function mapStateToProps(state: RootState): MainPageProps {
  const cmsConfig = getCmsConfig(state);
  return {
    fileImportEnabled: cmsConfig.fileImport.enabled,
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
