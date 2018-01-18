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

  // tslint:disable-next-line: no-any
  const filterUserConfigs = filters.map((f: any) =>
    parseFilterConfig(f, context)
  ) as FilterConfig[];

  return {
    enabled,
    filterUserConfigs,
  };
}
