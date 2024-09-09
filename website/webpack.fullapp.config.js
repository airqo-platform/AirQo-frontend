const HtmlWebpackPlugin = require('html-webpack-plugin');
const config = require('./webpack.config.js');

// Update entrypoint
config.entry = './frontend/index.js';

// Override the public path
config.output.publicPath = '/';

// Add HTMLWebpack plugin
config.plugins.push(
  new HtmlWebpackPlugin({
    template: './frontend/standaloneIndex.html',
    inject: 'body',
    minify: {
      removeComments: true,
      collapseWhitespace: true
    }
  })
);

// Optimize for production
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

config.optimization = {
  ...config.optimization,
  minimize: true,
  minimizer: [
    new TerserPlugin({
      terserOptions: {
        compress: {
          drop_console: true
        }
      }
    }),
    new CssMinimizerPlugin()
  ]
};

module.exports = config;
