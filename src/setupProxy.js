const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Main server proxy
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5006',
      changeOrigin: true,
      logLevel: 'debug',
      onError: (err, req, res) => {
        // Try secondary server if main one fails
        console.log('Trying fallback server...');
        const fallbackProxy = createProxyMiddleware({
          target: 'http://localhost:4000',
          changeOrigin: true,
        });
        fallbackProxy(req, res);
      }
    })
  );
}; 