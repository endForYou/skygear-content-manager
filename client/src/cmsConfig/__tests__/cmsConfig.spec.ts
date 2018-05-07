import {
  cmsConfigWithPushNotificationOnly,
  cmsConfigWithSiteItemsOnly,
} from './cmsConfig.fixture';

import { parseCmsConfig } from '../cmsConfig';

const deepCloneJSON = (o: object) => JSON.parse(JSON.stringify(o));

const emptyCmsConfig = {
  associationRecordByName: {},
  pushNotifications: {
    enabled: false,
    filterUserConfigs: [],
  },
  records: {},
  site: [],
  timezone: 'Local',
  userManagement: {
    enabled: false,
  },
};

describe('parseCmsConfig site', () => {
  it('should parse site items', () => {
    const result = parseCmsConfig(cmsConfigWithSiteItemsOnly);
    expect(result).toEqual({
      ...emptyCmsConfig,
      site: [
        {
          label: 'User Management',
          type: 'UserManagement',
        },
        {
          label: 'RecordA',
          name: 'RecordA',
          type: 'Record',
        },
        {
          label: 'RecordB',
          name: 'RecordB',
          type: 'Record',
        },
      ],
    });
  });

  it('should throw error for unknown site item', () => {
    const config = deepCloneJSON(cmsConfigWithSiteItemsOnly);
    config.site.push({
      type: 'Unknown type',
    });
    expect(() => parseCmsConfig(config)).toThrow();
  });

  it('should throw error for non-array site config', () => {
    const config = { site: 'site' };
    expect(() => parseCmsConfig(config)).toThrow();
  });
});

describe('parseCmsConfig push notifications', () => {
  it('should parse push notifications config without filters', () => {
    const config = deepCloneJSON(cmsConfigWithPushNotificationOnly);
    delete config.push_notifications.filters;
    const result = parseCmsConfig(config);
    expect(result).toEqual({
      ...emptyCmsConfig,
      pushNotifications: {
        enabled: true,
        filterUserConfigs: [],
      },
    });
  });

  it('should parse push notifications config with filters', () => {
    const config = deepCloneJSON(cmsConfigWithPushNotificationOnly);
    const result = parseCmsConfig(config);
    expect(result).toEqual({
      ...emptyCmsConfig,
      pushNotifications: {
        enabled: true,
        filterUserConfigs: [
          {
            label: 'name',
            name: 'name',
            nullable: false,
            type: 'String',
          },
        ],
      },
    });
  });

  it('should throw error for non-array push notification filter', () => {
    const config = deepCloneJSON(cmsConfigWithPushNotificationOnly);
    config.push_notifications.filters = 'filters';
    expect(() => parseCmsConfig(config)).toThrow();
  });
});
