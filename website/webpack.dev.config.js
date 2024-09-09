const config = require('./webpack.config');

// Override the public path
config.output.publicPath = 'http://localhost:8081/static/frontend/';

// Set the static public path to match what Django expects
config.devServer.static.publicPath = '/static/';

// Add HMR plugin
const webpack = require('webpack');
config.plugins.push(new webpack.HotModuleReplacementPlugin());

// Optimize for development
config.optimization = {
  ...config.optimization,
  minimize: false,
  removeAvailableModules: false,
  removeEmptyChunks: false,
  splitChunks: false
};

module.exports = config;
