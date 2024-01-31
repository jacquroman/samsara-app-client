const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/api', // Your API prefix
    createProxyMiddleware({
      target: 'https://api.samsara.com',
      changeOrigin: true,
    })
  );
};
