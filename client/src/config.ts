export interface AppConfig {
  cmsConfigUri: string;
  publicUrl: string;
  skygearApiKey: string;
  skygearEndpoint: string;
}

export function configFromEnv(): AppConfig {
  return {
    cmsConfigUri:
      process.env.REACT_APP_CMS_CONFIG_URI ||
      // tslint:disable-next-line: no-any
      (window as any).cmsConfigUri ||
      '/cms-config.yaml',
    publicUrl:
      process.env.PUBLIC_URL ||
      // tslint:disable-next-line: no-any
      (window as any).publicUrl ||
      '.',
    skygearApiKey:
      process.env.REACT_APP_SKYGEAR_API_KEY ||
      // tslint:disable-next-line: no-any
      (window as any).skygearApiKey ||
      'FAKE_API_KEY',
    skygearEndpoint:
      process.env.REACT_APP_SKYGEAR_ENDPOINT ||
      // tslint:disable-next-line: no-any
      (window as any).skygearEndpoint ||
      'http://localhost:3000/cms-api/',
  };
}
