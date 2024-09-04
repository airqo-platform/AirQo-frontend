const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

dotenv.config();

const ROOT = path.resolve(__dirname, 'frontend');

function postCSSLoader() {
  return {
    loader: 'postcss-loader',
    options: {
      postcssOptions: {
        plugins: [['postcss-preset-env', {}]]
      }
    }
  };
}

function strToBool(str) {
  const truthy = ['true', '0', 'yes', 'y'];
  return truthy.includes((str || '').toLowerCase());
}

function removeTrailingSlash(str) {
  if (str === undefined) return '';
  return str.replace(/\/+$/, '');
}

const config = (env, argv) => {
  const NODE_ENV = argv?.mode || process.env.NODE_ENV || 'production';
  const isDevelopment = NODE_ENV !== 'production';

  const STATIC_URL = removeTrailingSlash(process.env.REACT_WEB_STATIC_HOST);

  const PUBLIC_PATH = strToBool(process.env.DEBUG)
    ? `${STATIC_URL}/static/frontend/`
    : `${STATIC_URL}/frontend/`;

  const STATIC_DIR = 'frontend/static/frontend';

  const DIST_DIR = path.resolve(__dirname, STATIC_DIR);

  const envKeys = Object.keys(process.env).reduce((prev, next) => {
    if (next.startsWith('REACT_')) {
      prev[`process.env.${next}`] = JSON.stringify(process.env[next]);
    }

    return prev;
  }, {});

  return {
    mode: NODE_ENV,

    context: path.resolve(__dirname),

    entry: './frontend/index.js',

    output: {
      path: DIST_DIR,
      filename: '[name].bundle.js',
      publicPath: PUBLIC_PATH,
      clean: true // Clean the output directory before emit
    },

    // webpack 5 comes with devServer which loads in development mode
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
          use: [
            {
              loader: 'babel-loader',
              options: {
                cacheDirectory: true,
                cacheCompression: false
              }
            }
          ]
        },

        // Inlined CSS definitions for JS components
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader', postCSSLoader()]
        },
        {
          test: /\.s[ac]ss$/i,
          use: ['style-loader', 'css-loader', postCSSLoader(), 'sass-loader']
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

        // pdfs, gifs
        {
          test: /\.(pdf|gif)$/,
          use: 'file-loader?name=[path][name].[ext]'
        },

        // video
        {
          test: /\.(mov|mp4)$/,
          use: [
            {
              loader: 'file-loader',
              options: {
                name: '[path][name].[ext]'
              }
            }
          ]
        }
      ]
    },

    optimization: {
      minimize: !isDevelopment,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: true
            }
          }
        }),
        new CssMinimizerPlugin()
      ]
    },

    plugins: [
      new webpack.DefinePlugin(envKeys),
      new webpack.ids.HashedModuleIdsPlugin() // so that file hashes don't change unexpectedly
    ],

    cache: {
      type: 'filesystem'
    }
  };
};

module.exports = config();
