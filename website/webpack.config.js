const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

// Load environment variables
dotenv.config();

// Constants
const ROOT = path.resolve(__dirname, 'frontend');
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PROD = NODE_ENV === 'production';
const IS_DEV = NODE_ENV === 'development';

// Utility functions
const strToBool = (value) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    return ['true', '1', 'yes', 'y'].includes(value.toLowerCase());
  }
  return false;
};
const removeTrailingSlash = (str) => (str || '').replace(/\/+$/, '');

// Environment-specific configurations
const STATIC_URL = removeTrailingSlash(process.env.REACT_WEB_STATIC_HOST);
const PUBLIC_PATH = IS_DEV ? `${STATIC_URL}/static/frontend/` : `${STATIC_URL}/frontend/`;
const STATIC_DIR = 'frontend/static/frontend';
const DIST_DIR = path.resolve(__dirname, STATIC_DIR);

// Loader configurations
const postCSSLoader = {
  loader: 'postcss-loader',
  options: {
    postcssOptions: {
      plugins: [['postcss-preset-env', {}]]
    }
  }
};

// Configuration
module.exports = (env = {}, argv) => {
  const isStandalone = strToBool(env.STANDALONE);

  const config = {
    mode: NODE_ENV,
    context: path.resolve(__dirname),
    entry: './frontend/index.js',
    output: {
      path: DIST_DIR,
      filename: '[name].bundle.js',
      publicPath: isStandalone ? '/' : PUBLIC_PATH,
      clean: true
    },
    resolve: {
      modules: [ROOT, 'frontend/src', 'node_modules'],
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
    },
    module: {
      rules: [
        // JavaScript and TypeScript
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          use: ['babel-loader']
        },
        // CSS
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader', postCSSLoader]
        },
        // SASS
        {
          test: /\.s[ac]ss$/i,
          use: ['style-loader', 'css-loader', postCSSLoader, 'sass-loader']
        },
        // Assets (images, fonts, etc.)
        // Webp
        {
          test: /\.webp$/,
          type: 'asset/resource'
        },
        // SVGs
        {
          test: /\.svg$/,
          use: ['@svgr/webpack']
        },
        // Images
        {
          test: /\.(png|jpe?g|ico)$/i,
          type: 'asset/resource'
        },
        // PDFs and GIFs
        {
          test: /\.(pdf|gif)$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/[name][ext]'
          }
        },
        // Video
        {
          test: /\.(mov|mp4)$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/[name][ext]'
          }
        }
      ]
    },
    plugins: [
      new webpack.DefinePlugin(
        Object.keys(process.env)
          .filter((key) => key.startsWith('REACT_'))
          .reduce((env, key) => {
            env[`process.env.${key}`] = JSON.stringify(process.env[key]);
            return env;
          }, {})
      ),
      new HtmlWebpackPlugin({
        template: './frontend/standaloneIndex.html',
        favicon: './frontend/assets/favicon.ico'
      })
    ],
    optimization: {
      minimize: IS_PROD,
      minimizer: IS_PROD
        ? [
            new TerserPlugin({
              terserOptions: {
                compress: {
                  drop_console: true
                }
              }
            })
          ]
        : []
    }
  };

  // Development server configuration
  const devServerConfig = {
    port: 8081,
    headers: { 'Access-Control-Allow-Origin': '*' },
    compress: true,
    hot: true,
    historyApiFallback: true,
    static: {
      directory: './static',
      publicPath: '/static/'
    },
    devMiddleware: {
      publicPath: isStandalone ? '/' : 'http://localhost:8081/static/frontend/'
    }
  };

  // Apply devServer configuration for development and standalone modes
  if (IS_DEV || isStandalone) {
    config.devServer = devServerConfig;
  }

  return config;
};
