const { merge } = require('webpack-merge');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const baseConfig = require('./webpack.config.js');

module.exports = merge(baseConfig, {
  mode: 'development',
  entry: './frontend/index.js',
  output: {
    publicPath: '/'
  },
  plugins: [new HtmlWebpackPlugin({ template: './frontend/standaloneIndex.html' })]
});
