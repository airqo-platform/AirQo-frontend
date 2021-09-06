const HtmlWebpackPlugin = require('html-webpack-plugin');

var config = require('./webpack.config.js');

// Update entrypoint
config.entry = './frontend/index.js';

// Override the public path
config.output.publicPath = '/';

// Add HTMLWebpack plugin
config.plugins =  config.plugins.concat([
        new HtmlWebpackPlugin({ template: './frontend/standaloneIndex.html' }),
    ]);

module.exports = config;
