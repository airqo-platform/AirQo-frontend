const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// Load environment variables
dotenv.config();

// Constants
const ROOT = path.resolve(__dirname, 'frontend');
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PROD = NODE_ENV === 'production';
const IS_DEV = NODE_ENV === 'development';

// Utility functions
const strToBool = (str) => ['true', '1', 'yes', 'y'].includes((str || '').toLowerCase());
const removeTrailingSlash = (str) => (str || '').replace(/\/+$/, '');

// Environment-specific configurations
const STATIC_URL = removeTrailingSlash(process.env.REACT_WEB_STATIC_HOST);
const DEBUG = strToBool(process.env.DEBUG);
const PUBLIC_PATH = DEBUG ? `${STATIC_URL}/static/frontend/` : `${STATIC_URL}/frontend/`;
const STATIC_DIR = 'frontend/static/frontend';
const DIST_DIR = path.resolve(__dirname, STATIC_DIR);

// Loader configurations
const stripLoaderConfig = {
  loader: 'strip-loader',
  options: {
    strip: ['assert', 'typeCheck', 'log.log', 'log.debug', 'log.deprecate', 'log.info', 'log.warn']
  }
};

const postCSSLoader = {
  loader: 'postcss-loader',
  options: {
    postcssOptions: {
      plugins: [['postcss-preset-env', {}]]
    }
  }
};

// configuration
module.exports = (env, argv) => {
  const isStandalone = env && env.STANDALONE;

  const config = {
    mode: NODE_ENV,
    context: path.resolve(__dirname),
    entry: './frontend/index.js',
    output: {
      path: DIST_DIR,
      filename: '[name].bundle.js',
      publicPath: isStandalone ? '/' : PUBLIC_PATH
    },
    resolve: {
      modules: [ROOT, 'frontend/src', 'node_modules'],
      extensions: ['.js', '.jsx', '.ts', '.tsx', '...']
    },
    module: {
      rules: [
        // JavaScript and TypeScript
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          use: ['babel-loader', ...(IS_PROD ? [stripLoaderConfig] : [])]
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
      new HtmlWebpackPlugin({ template: './frontend/standaloneIndex.html' })
    ]
  };

  // Development server configuration (used for both dev and standalone)
  const devServerConfig = {
    port: 8081,
    headers: { 'Access-Control-Allow-Origin': '*' },
    compress: true,
    hot: true,
    historyApiFallback: true,
    static: {
      directory: './static',
      publicPath: '/static/'
    }
  };

  // Development-specific configuration
  if (IS_DEV && !isStandalone) {
    config.devServer = {
      ...devServerConfig,
      devMiddleware: {
        publicPath: 'http://localhost:8081/static/frontend/'
      }
    };
  }

  // Standalone configuration
  if (isStandalone) {
    config.devServer = devServerConfig;
  }

  return config;
};
