import { isArray } from 'util';
import { ConfigContext } from './cmsConfig';
import { FilterConfig, parseFilterConfig } from './filterConfig';

export interface PushNotificationsConfig {
  enabled: boolean;
  filterUserConfigs: FilterConfig[];
}

export function parsePushNotificationConfig(
  context: ConfigContext,
  // tslint:disable-next-line: no-any
  input: any
): PushNotificationsConfig {
  if (input == null) {
    return {
      enabled: false,
      filterUserConfigs: [],
    };
  }

  const { enabled, filters } = input;

  return {
    enabled,
    filterUserConfigs: parsePushNotificationFilter(context, filters),
  };
}

function parsePushNotificationFilter(
  context: ConfigContext,
  // tslint:disable-next-line:no-any
  input: any
): FilterConfig[] {
  if (input == null) {
    return [];
  }

  if (!isArray(input)) {
    throw new Error('Expect push notification user filter to be Array');
  }

  return input.map(f => parseFilterConfig(f, context));
}
