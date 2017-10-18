let configFromEnv = () => {
  /* eslint-disable no-undef */
  return {
    skygearEndpoint:
      process.env.REACT_APP_SKYGEAR_ENDPOINT || 'http://localhost:3000',
    skygearApiKey: process.env.REACT_APP_SKYGEAR_API_KEY || 'FAKE_API_KEY',
  };
  /* eslint-enable no-undef */
};

export { configFromEnv };
