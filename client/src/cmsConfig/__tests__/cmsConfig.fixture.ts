export const cmsConfigWithSiteItemsOnly = {
  site: [
    {
      type: 'UserManagement',
    },
    {
      name: 'RecordA',
      type: 'Record',
    },
    {
      name: 'RecordB',
      type: 'Record',
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
        type: 'String',
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
          type: 'Reference',
        },
        {
          name: 'product_id',
          reference_target: 'product',
          type: 'Reference',
        },
      ],
    },
  },
};
