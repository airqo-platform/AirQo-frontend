const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpackConfig = require('./webpack.config.js');

module.exports = (env, argv) => {
  const config = webpackConfig(env, argv);

  // Update entrypoint
  config.entry = './frontend/index.js';

  // Override the public path
  config.output.publicPath = '/';

  // Add HTMLWebpack plugin
  config.plugins.push(
    new HtmlWebpackPlugin({
      template: './frontend/standaloneIndex.html',
      inject: 'body',
    })
  );

  return config;
};
