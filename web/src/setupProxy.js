const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    createProxyMiddleware(
      '/data',
      {
        target: 'http://127.0.0.1:8800',
        changeOrigin: true,
        ws: true,
      }),
  );
};
