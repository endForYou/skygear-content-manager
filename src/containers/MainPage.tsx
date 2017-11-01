import * as React from 'react';
import { connect } from 'react-redux';
import { Route, Switch, withRouter } from 'react-router-dom';

import Layout from '../components/Layout';
import NotFoundPage from '../components/NotFoundPage';
import { ListPage, ListPageFactory } from '../pages/ListPage';
import { ShowPageContainer } from '../pages/ShowPageContainer';
import { RootState } from '../states';
import FrontPage from './FrontPage';

export interface MainPageProps {
  recordNames: string[];
}

class MainPage extends React.PureComponent<MainPageProps> {
  private listPageFactoryByRecordName: { [recordName: string]: ListPage };

  constructor(props: MainPageProps) {
    super(props);

    const { recordNames } = props;
    this.listPageFactoryByRecordName = recordNames.reduce((obj, recordName) => {
      return { ...obj, [recordName]: ListPageFactory(recordName) };
    }, {});
  }

  public render() {
    return (
      <Layout>
        <Switch>
          <Route exact={true} path="/" component={FrontPage} />

          {this.props.recordNames.map((recordName, index) => {
            return (
              <Route
                key={index}
                exact={true}
                path={`/record/${recordName}`}
                // tslint:disable-next-line: no-any
                component={this.listPageFactoryByRecordName[recordName] as any}
              />
            );
          })}

          <Route
            exact={true}
            path={'/record/:recordName/:recordId'}
            component={ShowPageContainer}
          />

          <Route component={NotFoundPage} />
        </Switch>
      </Layout>
    );
  }
}

const mapStateToProps = (state: RootState) => {
  return {
    recordNames: Object.keys(state.cmsConfig.records),
  };
};

const MainPageConnected = withRouter(connect(mapStateToProps)(MainPage));

export { MainPageConnected };
