const HtmlWebpackPlugin = require('html-webpack-plugin');
const config = require('./webpack.config.js');

config.entry = './frontend/index.js';
config.output.publicPath = '/';
config.plugins.push(new HtmlWebpackPlugin({ template: './frontend/standaloneIndex.html' }));

module.exports = config;
