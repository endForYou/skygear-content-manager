export interface AppTheme {
  primaryColor: string;
  sidebarColor: string;
}

export interface AppConfig {
  adminRole: string;
  cmsConfigUrl: string;
  publicUrl: string;
  skygearApiKey: string;
  skygearEndpoint: string;
  staticUrl: string;
  style: AppTheme;
}

/**
 * Default App Config
 *
 * Do NOT import this file to get app config, because the value of this config is set in build time
 * You should instead get the app config from redux store
 */
export default {
  adminRole: process.env.REACT_APP_ADMIN_ROLE || 'Admin',
  cmsConfigUrl: process.env.REACT_APP_CMS_CONFIG_URL || '/cms-config.yaml',
  publicUrl: process.env.PUBLIC_URL || '.',
  skygearApiKey: process.env.REACT_APP_SKYGEAR_API_KEY || 'FAKE_API_KEY',
  skygearEndpoint:
    process.env.REACT_APP_SKYGEAR_ENDPOINT || 'http://localhost:3000/cms-api/',
  staticUrl: process.env.REACT_APP_PUBLIC_URL || '.',
  style: {
    primaryColor: process.env.REACT_APP_PRIMARY_COLOR || '#0275D8',
    sidebarColor: process.env.REACT_APP_SIDEBAR_COLOR || '#19c2bf',
  },
};
