import * as React from 'react';
import { Route } from 'react-router';

import {
  EditPageConfig,
  ListPageConfig,
  RecordConfig,
  ShowPageConfig,
} from '../../cmsConfig';
import { EditPageContainer } from '../../pages/EditPageContainer';
import { ListPageFactory } from '../../pages/ListPage';
import { ShowPageContainer } from '../../pages/ShowPageContainer';

export function routesFromRecordConfigs(
  configs: RecordConfig[]
): JSX.Element[] {
  return configs.reduce((routes: JSX.Element[], config: RecordConfig) => {
    return [...routes, ...routesFromRecordConfig(config)];
  }, []);
}

function routesFromRecordConfig(config: RecordConfig): JSX.Element[] {
  const routes: JSX.Element[] = [];
  if (config.list) {
    routes.push(makeListRoute(config.list));
  }
  if (config.show) {
    routes.push(makeShowRoute(config.show));
  }
  if (config.edit) {
    routes.push(makeEditRoute(config.edit));
  }

  return routes;
}

function makeListRoute(config: ListPageConfig): JSX.Element {
  const recordName = config.cmsRecord.name;
  return (
    <Route
      key={`${recordName}-list`}
      exact={true}
      path={`/record/${recordName}`}
      component={ListPageFactory(recordName)}
    />
  );
}

function makeShowRoute(config: ShowPageConfig): JSX.Element {
  const recordName = config.cmsRecord.name;
  return (
    <Route
      key={`${recordName}-list`}
      exact={true}
      path={`/record/${recordName}/:recordId`}
      render={routeProps => (
        <ShowPageContainer
          config={config}
          recordId={routeProps.match.params.recordId}
        />
      )}
    />
  );
}

function makeEditRoute(config: EditPageConfig): JSX.Element {
  const recordName = config.cmsRecord.name;
  return (
    <Route
      key={`${recordName}-list`}
      exact={true}
      path={`/record/${recordName}/:recordId/edit`}
      render={routeProps => (
        <EditPageContainer
          config={config}
          recordId={routeProps.match.params.recordId}
        />
      )}
    />
  );
}
