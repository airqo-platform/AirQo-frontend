const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

dotenv.config();

const ROOT = path.resolve(__dirname, 'frontend');
const DIST_DIR = path.resolve(__dirname, 'frontend/static/frontend');

function removeTrailingSlash(str) {
  if (str === undefined) return '';
  return str.replace(/\/+$/, '');
}

function strToBool(str) {
  const truthy = ['true', '0', 'yes', 'y'];
  return truthy.includes((str || '').toLowerCase());
}

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  const STATIC_URL = removeTrailingSlash(process.env.REACT_WEB_STATIC_HOST);

  const PUBLIC_PATH = strToBool(process.env.DEBUG)
    ? `${STATIC_URL}/static/frontend/`
    : `${STATIC_URL}/frontend/`;

  return {
    entry: './frontend/index.js',

    output: {
      path: DIST_DIR,
      filename: isProduction ? '[name].[contenthash].js' : '[name].bundle.js',
      publicPath: PUBLIC_PATH
    },

    devServer: {
      port: 8081,
      headers: { 'Access-Control-Allow-Origin': '*' },
      compress: true,
      hot: true,
      historyApiFallback: true,
      static: {
        directory: './static'
      }
    },

    resolve: {
      modules: [ROOT, 'frontend/src', 'node_modules'],
      extensions: ['.js', '.jsx', '.ts', '.tsx', '...']
    },

    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          use: ['babel-loader']
        },

        {
          test: /\.css$/,
          use: [isProduction ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader']
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'sass-loader'
          ]
        },
        {
          test: /\.(webp|png|jpe?g|ico|pdf|gif|mov|mp4)$/i,
          type: 'asset/resource',
          generator: {
            filename: '[path][name][ext]'
          }
        },
        {
          test: /\.svg$/,
          use: ['@svgr/webpack']
        }
      ]
    },
    optimization: {
      minimize: isProduction,
      minimizer: [new TerserPlugin()]
    },
    plugins: [
      new webpack.DefinePlugin(
        Object.keys(process.env).reduce((acc, key) => {
          if (key.startsWith('REACT_')) {
            acc[`process.env.${key}`] = JSON.stringify(process.env[key]);
          }
          return acc;
        }, {})
      ),
      isProduction && new CompressionPlugin(),
      isProduction && new MiniCssExtractPlugin({ filename: '[name].[contenthash].css' }),
      isProduction && new BundleAnalyzerPlugin({ analyzerMode: 'static', openAnalyzer: false })
    ].filter(Boolean)
  };
};
