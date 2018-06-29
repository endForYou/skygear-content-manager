import {
  cmsConfigWithAssociationRecord,
  cmsConfigWithPushNotificationOnly,
  cmsConfigWithRecordTypeOnly,
  cmsConfigWithSiteItemsOnly,
} from './cmsConfig.fixture';

import { parseCmsConfig } from '../cmsConfig';
import { FieldConfigTypes, ReferenceTypes } from '../fieldConfig';

const deepCloneJSON = (o: object) => JSON.parse(JSON.stringify(o));

const emptyCmsConfig = {
  associationRecordByName: {},
  fileImport: {
    enabled: false,
  },
  pushNotifications: {
    enabled: false,
    filterUserConfigs: [],
  },
  records: {},
  site: [],
  userManagement: {
    enabled: false,
  },
};

const emptyRecordConfig = {
  edit: undefined,
  list: undefined,
  new: undefined,
  show: undefined,
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
      userManagement: {
        enabled: true,
      },
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

describe('parseCmsConfig records and association records', () => {
  const expectedRecordsConfig = {
    admin: {
      ...emptyRecordConfig,
      cmsRecord: {
        name: 'admin',
        recordType: 'user',
      },
    },
    customer: {
      ...emptyRecordConfig,
      cmsRecord: {
        name: 'customer',
        recordType: 'user',
      },
    },
    product: {
      ...emptyRecordConfig,
      cmsRecord: {
        name: 'product',
        recordType: 'product',
      },
    },
  };

  it('should parse record config with record_type only', () => {
    const config = deepCloneJSON(cmsConfigWithRecordTypeOnly);
    const result = parseCmsConfig(config);
    expect(result).toEqual({
      ...emptyCmsConfig,
      records: expectedRecordsConfig,
    });
  });

  it('should parse association reocords', () => {
    const config = deepCloneJSON(cmsConfigWithAssociationRecord);
    const result = parseCmsConfig(config);
    expect(result).toEqual({
      ...emptyCmsConfig,
      associationRecordByName: {
        admin_has_products: {
          cmsRecord: {
            name: 'admin_has_products',
            recordType: 'admin_has_products',
          },
          referenceConfigPair: [
            {
              compact: false,
              displayFieldName: '_id',
              label: 'Admin id',
              name: 'admin_id',
              reference: {
                targetCmsRecord: {
                  name: 'admin',
                  recordType: 'user',
                },
                type: ReferenceTypes.DirectReference,
              },
              type: FieldConfigTypes.Reference,
            },
            {
              compact: false,
              displayFieldName: '_id',
              label: 'Product id',
              name: 'product_id',
              reference: {
                targetCmsRecord: {
                  name: 'product',
                  recordType: 'product',
                },
                type: ReferenceTypes.DirectReference,
              },
              type: FieldConfigTypes.Reference,
            },
          ],
        },
      },
      records: expectedRecordsConfig,
    });
  });

  it('should throw error for association records with unknown ref', () => {
    const config = deepCloneJSON(cmsConfigWithAssociationRecord);
    config.association_records.admin_has_products.fields[0].reference_target =
      'unknown';
    expect(() => parseCmsConfig(config)).toThrow();
  });
});
