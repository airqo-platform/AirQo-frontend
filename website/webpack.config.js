const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');
const TerserPlugin = require('terser-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

dotenv.config();

const ROOT = path.resolve(__dirname, 'frontend');

const strToBool = (str) => ['true', '0', 'yes', 'y'].includes((str || '').toLowerCase());
const removeTrailingSlash = (str) => (str ? str.replace(/\/+$/, '') : '');

module.exports = (env, argv) => {
  const isProd = argv.mode === 'production';
  const STATIC_URL = removeTrailingSlash(process.env.REACT_WEB_STATIC_HOST);
  const PUBLIC_PATH = strToBool(process.env.DEBUG)
    ? `${STATIC_URL}/static/frontend/`
    : `${STATIC_URL}/frontend/`;
  const DIST_DIR = path.resolve(__dirname, 'frontend/static/frontend');

  const envKeys = Object.keys(process.env).reduce((prev, next) => {
    if (next.startsWith('REACT_')) {
      prev[`process.env.${next}`] = JSON.stringify(process.env[next]);
    }
    return prev;
  }, {});

  return {
    context: path.resolve(__dirname),
    entry: './frontend/index.js',
    output: {
      path: DIST_DIR,
      filename: isProd ? '[name].[contenthash].js' : '[name].bundle.js',
      publicPath: PUBLIC_PATH,
      clean: true
    },
    devServer: {
      port: 8081,
      headers: { 'Access-Control-Allow-Origin': '*' },
      compress: true,
      hot: true,
      historyApiFallback: true,
      static: { directory: './static' }
    },
    resolve: {
      modules: [ROOT, 'frontend/src', 'node_modules'],
      extensions: ['.js', '.jsx', '.ts', '.tsx', '...'],
      alias: {
        '@': path.resolve(__dirname, 'frontend/src')
      }
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
          use: [isProd ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader']
        },
        {
          test: /\.s[ac]ss$/i,
          use: [isProd ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader', 'sass-loader']
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
      minimize: isProd,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            format: {
              comments: false
            }
          },
          extractComments: false
        }),
        new CssMinimizerPlugin()
      ]
    },
    plugins: [
      new webpack.DefinePlugin(envKeys),
      new MiniCssExtractPlugin({
        filename: isProd ? '[name].[contenthash].css' : '[name].css'
      }),
      new CompressionPlugin({
        test: /\.(js|css|html|svg)$/,
        filename: '[path][base].gz',
        algorithm: 'gzip',
        threshold: 10240,
        minRatio: 0.8
      }),
      isProd &&
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false
        })
    ].filter(Boolean),
    cache: {
      type: 'filesystem'
    }
  };
};
