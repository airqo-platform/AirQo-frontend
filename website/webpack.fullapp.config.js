const HtmlWebpackPlugin = require('html-webpack-plugin');
const config = require('./webpack.config.js');

// Update entrypoint
config.entry = './frontend/index.js';

// Override the public path
config.output.publicPath = '/';

// Add HTMLWebpack plugin
config.plugins.push(
  new HtmlWebpackPlugin({ template: './frontend/standaloneIndex.html', inject: 'body' })
);

module.exports = config;
