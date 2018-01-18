import * as React from 'react';
import { Route } from 'react-router';

import {
  ListPageConfig,
  RecordConfig,
  RecordFormPageConfig,
  ShowPageConfig,
} from '../../cmsConfig';
import { EditPageContainer } from '../../pages/EditPageContainer';
import { ListPageFactory } from '../../pages/ListPage';
import { NewPageContainer } from '../../pages/NewPageContainer';
import { ShowPageContainer } from '../../pages/ShowPageContainer';

import { NewPushNotificationPageContainer } from '../../push_notifications/NewPushNotificationPageContainer';
import { PushNotificationListPageFactory } from '../../push_notifications/PushNotificationListPage';

export function routesFromRecordConfigs(
  configs: RecordConfig[]
): JSX.Element[] {
  return configs.reduce((routes: JSX.Element[], config: RecordConfig) => {
    return [...routes, ...routesFromRecordConfig(config)];
  }, []);
}

export function pushNotificationRoutes(): JSX.Element[] {
  return [makeNewPushNotificationRoute(), makeNotificationListRoute()];
}

function routesFromRecordConfig(config: RecordConfig): JSX.Element[] {
  const routes: JSX.Element[] = [];
  if (config.list) {
    routes.push(makeListRoute(config.list));
  }
  if (config.new) {
    routes.push(makeNewRoute(config.new));
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
      path={`/records/${recordName}`}
      component={ListPageFactory(recordName)}
    />
  );
}

function makeShowRoute(config: ShowPageConfig): JSX.Element {
  const recordName = config.cmsRecord.name;
  return (
    <Route
      key={`${recordName}-show`}
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

function makeEditRoute(config: RecordFormPageConfig): JSX.Element {
  const recordName = config.cmsRecord.name;
  return (
    <Route
      key={`${recordName}-edit`}
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

function makeNewRoute(config: RecordFormPageConfig): JSX.Element {
  const recordName = config.cmsRecord.name;
  return (
    <Route
      key={`${recordName}-new`}
      exact={true}
      path={`/records/${recordName}/new`}
      render={routeProps => <NewPageContainer config={config} />}
    />
  );
}

function makeNotificationListRoute(): JSX.Element {
  return (
    <Route
      key={`notification`}
      exact={true}
      path={`/notification`}
      component={PushNotificationListPageFactory()}
    />
  );
}

function makeNewPushNotificationRoute(): JSX.Element {
  return (
    <Route
      key={`notification-new`}
      exact={true}
      path={`/notification/new`}
      render={routeProps => <NewPushNotificationPageContainer/>}
    />
  );
}
