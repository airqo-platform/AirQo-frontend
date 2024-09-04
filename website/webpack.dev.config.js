const { merge } = require('webpack-merge');
const baseConfig = require('./webpack.config.js');

module.exports = merge(baseConfig, {
  mode: 'development',
  output: {
    publicPath: 'http://localhost:8081/static/frontend/'
  },
  devServer: {
    static: {
      publicPath: '/static/'
    }
  }
});
