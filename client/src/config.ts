export interface AppConfig {
  adminRole: string;
  cmsConfigUrl: string;
  publicUrl: string;
  skygearApiKey: string;
  skygearEndpoint: string;
  staticUrl: string;
}

/**
 * Default App Config
 */
export default {
  adminRole: process.env.REACT_APP_ADMIN_ROLE || 'Admin',
  cmsConfigUrl: process.env.REACT_APP_CMS_CONFIG_URL || '/cms-config.yaml',
  publicUrl: process.env.PUBLIC_URL || '.',
  skygearApiKey: process.env.REACT_APP_SKYGEAR_API_KEY || 'FAKE_API_KEY',
  skygearEndpoint:
    process.env.REACT_APP_SKYGEAR_ENDPOINT || 'http://localhost:3000/cms-api/',
  staticUrl: process.env.REACT_APP_PUBLIC_URL || '.',
};
