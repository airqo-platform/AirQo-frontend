const path = require('path');
const webpackConfig = require('./webpack.config');

module.exports = (env, argv) => {
  const config = webpackConfig(env, argv);

  // Override the public path
  config.output.publicPath = 'http://localhost:8081/static/frontend/';

  // Set the static public path to match what Django expects
  if (config.devServer && config.devServer.static) {
    config.devServer.static.publicPath = '/static/';
  } else {
    config.devServer = {
      ...config.devServer,
      static: {
        publicPath: '/static/'
      }
    };
  }

  return config;
};
