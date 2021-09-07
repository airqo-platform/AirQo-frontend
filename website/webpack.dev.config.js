const config = require('./webpack.config.js');

// Override the public path
config.output.publicPath = 'http://localhost:8081/static/frontend/';

module.exports = config;
