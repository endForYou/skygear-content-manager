import { cmsConfigWithSiteItemsOnly } from './cmsConfig.fixture';

import { parseCmsConfig } from '../cmsConfig';

describe('parseCmsConfig', () => {
  it('should parse site items', () => {
    const result = parseCmsConfig(cmsConfigWithSiteItemsOnly);
    expect(result).toEqual({
      associationRecordByName: {},
      pushNotifications: {
        enabled: false,
        filterUserConfigs: [],
      },
      records: {},
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
      timezone: 'Local',
      userManagement: {
        enabled: false,
      },
    });
  });

  it('should throw error for unknown site item', () => {
    cmsConfigWithSiteItemsOnly.site.push({
      type: 'Unknown type',
    });
    expect(() => parseCmsConfig(cmsConfigWithSiteItemsOnly)).toThrow();
  });
});
