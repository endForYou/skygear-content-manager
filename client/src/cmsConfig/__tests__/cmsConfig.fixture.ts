export const cmsConfigWithSiteItemsOnly = {
  site: [
    {
      type: 'user_management',
      verification: {
        editable: false,
        enabled: false,
        fields: [],
      },
    },
    {
      name: 'RecordA',
      type: 'record',
    },
    {
      name: 'RecordB',
      type: 'record',
    },
  ],
};

export const cmsConfigWithPushNotificationOnly = {
  push_notifications: {
    enabled: true,
    filters: [
      {
        label: 'name',
        name: 'name',
        type: 'string',
      },
    ],
  },
};

export const cmsConfigWithRecordTypeOnly = {
  records: {
    admin: {
      record_type: 'user',
    },
    customer: {
      record_type: 'user',
    },
    product: {},
  },
};

export const cmsConfigWithAssociationRecord = {
  ...cmsConfigWithRecordTypeOnly,
  association_records: {
    admin_has_products: {
      fields: [
        {
          name: 'admin_id',
          reference_target: 'admin',
          type: 'reference',
        },
        {
          name: 'product_id',
          reference_target: 'product',
          type: 'reference',
        },
      ],
    },
  },
};
