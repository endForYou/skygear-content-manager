import * as React from 'react';
import { Redirect, Route } from 'react-router';
import {
  ListPageConfig,
  RecordConfig,
  RecordFormPageConfig,
  ShowPageConfig,
  SiteConfig,
  SiteItemConfigTypes,
} from '../../cmsConfig';

import FrontPage from '../FrontPage';

import { EditPageContainer } from '../../pages/EditPageContainer';
import { ListPageFactory } from '../../pages/ListPage';
import { NewPageContainer } from '../../pages/NewPageContainer';
import { ShowPageContainer } from '../../pages/ShowPageContainer';

import { NewPushNotificationPageContainer } from '../../push_notifications/NewPushNotificationPageContainer';
import { PushNotificationListPageFactory } from '../../push_notifications/PushNotificationListPage';

import { FileImportPageFactory } from '../../pages/FileImport/FileImportPage';
import { ChangePasswordPageContainer } from '../../pages/UserManagement/ChangePasswordPage';
import { UserListPageFactory } from '../../pages/UserManagement/UserListPage';

// tslint:disable-next-line: no-any
const AnyFrontPage = FrontPage as any;

const frontPageRoute = <Route exact={true} path="/" component={AnyFrontPage} />;

export function frontPageRedirect(siteItems: SiteConfig): JSX.Element {
  const items = siteItems.filter(s => s.type !== SiteItemConfigTypes.Space);
  if (items.length === 0) {
    return frontPageRoute;
  }

  const firstSiteItem = items[0];
  let redirectPath;
  switch (firstSiteItem.type) {
    case SiteItemConfigTypes.PushNotifications:
      redirectPath = '/notification';
      break;
    case SiteItemConfigTypes.Record:
      redirectPath = `/records/${firstSiteItem.name}`;
      break;
    case SiteItemConfigTypes.UserManagement:
      redirectPath = '/user-management';
      break;
    case SiteItemConfigTypes.FileImport:
      redirectPath = '/file-import';
      break;
    default:
      throw new Error(`Unexpected site item type: ${firstSiteItem.type}`);
  }

  if (redirectPath == null) {
    return frontPageRoute;
  }

  return <Redirect exact={true} from="/" to={redirectPath} />;
}

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

export function userManagementRoutes(): JSX.Element[] {
  return [makeUserManagementRoute(), makeChangePasswordRoute()];
}

export function fileImportRoutes(): JSX.Element[] {
  return [makeFileImportRoute()];
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
      render={routeProps => <NewPushNotificationPageContainer />}
    />
  );
}

function makeUserManagementRoute(): JSX.Element {
  return (
    <Route
      key="user-management"
      exact={true}
      path="/user-management"
      component={UserListPageFactory()}
    />
  );
}

function makeChangePasswordRoute(): JSX.Element {
  return (
    <Route
      key="change-password"
      exact={true}
      path="/user-management/:userId/change-password"
      render={routeProps => (
        <ChangePasswordPageContainer userId={routeProps.match.params.userId} />
      )}
    />
  );
}

function makeFileImportRoute(): JSX.Element {
  return (
    <Route
      key="file-import"
      exact={true}
      path="/file-import"
      component={FileImportPageFactory()}
    />
  );
}
