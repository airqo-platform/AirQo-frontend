const config = require('./webpack.config');

config.output.publicPath = 'http://localhost:8081/static/frontend/';
config.mode = 'development';
config.devtool = 'eval-source-map';

module.exports = config;
