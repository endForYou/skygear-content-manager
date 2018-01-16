import { FieldConfig, ConfigContext, parseFieldConfig } from './cmsConfig';

export interface PushNotificationsConfig {
  enabled: boolean;
  filterUserConfigs: FieldConfig[];
}

// tslint:disable-next-line: no-any
export function parsePushNotificationConfig(context: ConfigContext, input: any): PushNotificationsConfig {
  if (input == null) {
    return {
      enabled: false,
      filterUserConfigs: [],
    };
  }

  const { enabled, filters } = input;

  // tslint:disable-next-line: no-any
  const filterUserConfigs = filters.map((f: any) =>
    parseFieldConfig(context, f)
  ) as FieldConfig[];

  console.log('filterUserConfigs:');
  console.log(filterUserConfigs);

  return {
    enabled,
    filterUserConfigs,
  };
}
