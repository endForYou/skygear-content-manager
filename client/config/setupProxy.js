const proxy = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(proxy('/api', {
    target: 'http://localhost:3001/',
    pathRewrite: {
      "^/api": "",
    },
  }));
  app.use(proxy('/docker-api', {
    target: 'http://app:3000/' ,
    pathRewrite: {
      "^/docker-api": "",
    },
  }));
};
