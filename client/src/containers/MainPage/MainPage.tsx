import * as React from 'react';
import { connect } from 'react-redux';
import { Route, Switch, withRouter } from 'react-router-dom';

import { RecordConfig } from '../../cmsConfig';
import Layout from '../../components/Layout';
import NotFoundPage from '../../components/NotFoundPage';
import { RootState } from '../../states';
import FrontPage from '../FrontPage';

import { routesFromRecordConfigs } from './routes';

export interface MainPageProps {
  recordConfigs: RecordConfig[];
}

class MainPage extends React.PureComponent<MainPageProps> {
  private recordRoutes: JSX.Element[];

  constructor(props: MainPageProps) {
    super(props);

    this.recordRoutes = routesFromRecordConfigs(props.recordConfigs);
  }

  public render() {
    return (
      <Layout>
        <Switch>
          <Route exact={true} path="/" component={FrontPage} />

          {this.recordRoutes}

          <Route component={NotFoundPage} />
        </Switch>
      </Layout>
    );
  }
}

function mapStateToProps(state: RootState): MainPageProps {
  return {
    recordConfigs: Object.values(state.cmsConfig.records)
      .filter(recordConfig => recordConfig !== undefined)
      .map(recordConfig => recordConfig!),
  };
}

const ConnectedMainPage = withRouter(connect(mapStateToProps)(MainPage));

export { ConnectedMainPage as MainPage };
