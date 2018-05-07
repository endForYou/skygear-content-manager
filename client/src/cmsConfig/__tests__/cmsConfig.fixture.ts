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
