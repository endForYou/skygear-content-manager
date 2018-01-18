import * as React from 'react';
import { connect } from 'react-redux';
import { Route, Switch, withRouter } from 'react-router-dom';

import { RecordConfig } from '../../cmsConfig';
import Layout from '../../components/Layout';
import NotFoundPage from '../../components/NotFoundPage';
import { RootState } from '../../states';
import FrontPage from '../FrontPage';

import { pushNotificationRoutes, routesFromRecordConfigs } from './routes';

export interface MainPageProps {
  recordConfigs: RecordConfig[];
  pushNotificationEnabled: boolean;
}

// tslint:disable-next-line: no-any
const AnyFrontPage = FrontPage as any;

class MainPage extends React.PureComponent<MainPageProps> {
  private recordRoutes: JSX.Element[];
  private pushNotificationRoutes: JSX.Element[];

  constructor(props: MainPageProps) {
    super(props);

    this.recordRoutes = routesFromRecordConfigs(props.recordConfigs);
    this.pushNotificationRoutes = pushNotificationRoutes();
  }

  public render() {
    const { pushNotificationEnabled } = this.props;

    return (
      <Layout>
        <Switch>
          <Route exact={true} path="/" component={AnyFrontPage} />

          {this.recordRoutes}
          {pushNotificationEnabled &&
            this.pushNotificationRoutes
          }

          <Route component={NotFoundPage} />
        </Switch>
      </Layout>
    );
  }
}

function mapStateToProps(state: RootState): MainPageProps {
  return {
    pushNotificationEnabled: state.cmsConfig.pushNotifications.enabled,
    recordConfigs: Object.values(state.cmsConfig.records)
      .filter(recordConfig => recordConfig !== undefined)
      .map(recordConfig => recordConfig!),
  };
}

const ConnectedMainPage = withRouter(connect(mapStateToProps)(MainPage));

export { ConnectedMainPage as MainPage };
