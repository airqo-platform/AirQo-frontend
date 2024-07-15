const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack'); // Add this line to import webpack
const SettingsGeneratorPlugin = require('./settings_generator.js');
const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  devtool: 'source-map',
  entry: path.resolve(__dirname, 'src', 'index.js'),
  output: {
    publicPath: '/',
    path: path.resolve(__dirname, 'build'),
    filename: '[name].bundle.js',
  },
  resolve: {
    modules: [path.resolve(__dirname, 'src'), 'node_modules'],
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
    fallback: {
      os: require.resolve('os-browserify/browser'),
      stream: require.resolve('stream-browserify'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: { url: false },
          },
        ],
      },
      {
        test: /\.(scss|sass)$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: { url: false },
          },
          'sass-loader',
        ],
      },
      {
        test: /\.(png|jpe?g|gif|ttf|woff(2)?|eot|otf)(\?v=\d+\.\d+\.\d+)?$/,
        type: 'asset/resource',
      },
      {
        test: /\.svg$/,
        type: 'asset/inline',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'src', 'index.html'),
      favicon: path.resolve(__dirname, 'public', 'favicon.ico'),
    }),
    new SettingsGeneratorPlugin({
      API_BASE_URL: process.env.API_BASE_URL || 'https://default-api-url.com',
    }),

    new webpack.IgnorePlugin({
      resourceRegExp: /^redux$/,
      contextRegExp: /@reduxjs\/toolkit/,
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
      },
    }),
  ],
};
