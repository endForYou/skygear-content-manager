export interface AppConfig {
  cmsConfigUri: string;
  publicUrl: string;
  skygearApiKey: string;
  skygearEndpoint: string;
}

/**
 * Default App Config
 */
export default {
  cmsConfigUri:
    process.env.REACT_APP_CMS_CONFIG_URI ||
    '/cms-config.yaml',
  publicUrl:
    process.env.PUBLIC_URL ||
    '.',
  skygearApiKey:
    process.env.REACT_APP_SKYGEAR_API_KEY ||
    'FAKE_API_KEY',
  skygearEndpoint:
    process.env.REACT_APP_SKYGEAR_ENDPOINT ||
    'http://localhost:3000/cms-api/',
};
