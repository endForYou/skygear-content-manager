import { Route, Switch, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import * as PropTypes from 'prop-types';
import React, { PureComponent } from 'react';

import { ListPageFactory } from '../pages/ListPage';
import FrontPage from './FrontPage';
import Layout from '../components/Layout';
import NotFoundPage from '../components/NotFoundPage';

class _MainPage extends PureComponent {
  static propTypes = {
    recordNames: PropTypes.arrayOf(PropTypes.string).isRequired,
  };

  constructor(props) {
    super(props);

    const { recordNames } = props;
    this.listPageFactoryByRecordName = recordNames.reduce((obj, recordName) => {
      return { ...obj, [recordName]: ListPageFactory(recordName) };
    }, {});
  }

  render() {
    return (
      <Layout>
        <Switch>
          <Route exact path="/" component={FrontPage} />

          {this.props.recordNames.map((recordName, index) => {
            return (
              <Route
                key={index}
                path={`/record/${recordName}`}
                component={this.listPageFactoryByRecordName[recordName]}
              />
            );
          })}

          <Route component={NotFoundPage} />
        </Switch>
      </Layout>
    );
  }
}

const mapStateToProps = state => {
  return {
    recordNames: Object.keys(state.cmsConfig.records),
  };
};

const MainPage = withRouter(connect(mapStateToProps)(_MainPage));

export default MainPage;
