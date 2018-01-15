import { FieldConfig as FilterUserConfig } from './cmsConfig';

export interface PushNotificationsConfig {
  enabled: boolean;
  filterUserConfigs: FilterUserConfig[];
}

// tslint:disable-next-line: no-any
export function parsePushNotificationConfig(input: any): PushNotificationsConfig {
  if (input == null) {
    return {
      enabled: false,
      filterUserConfigs: [],
    };
  }

  const { enabled, filters: filterUserConfigs } = input;

  return {
    enabled,
    filterUserConfigs,
  };
}
