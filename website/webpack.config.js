const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');
const TerserPlugin = require('terser-webpack-plugin');

dotenv.config();

const ROOT = path.resolve(__dirname, 'frontend');

function strToBool(str) {
  const truthy = ['true', '0', 'yes', 'y'];
  return truthy.includes((str || '').toLowerCase());
}

function removeTrailingSlash(str) {
  if (str === undefined) return '';
  return str.replace(/\/+$/, '');
}

const config = () => {
  const NODE_ENV = process.env.NODE_ENV || 'local';

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
    context: path.resolve(__dirname),

    entry: './frontend/index.js',

    output: {
      path: DIST_DIR,
      filename: '[name].bundle.js',
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
          use: [
            {
              loader: 'babel-loader'
            }
          ]
        },

        {
          test: /\.css$/,
          use: [{ loader: 'style-loader' }, { loader: 'css-loader' }]
        },
        {
          test: /\.s[ac]ss$/i,
          use: [{ loader: 'style-loader' }, { loader: 'css-loader' }, { loader: 'sass-loader' }]
        },
        {
          test: /\.webp$/,
          type: 'asset/resource'
        },
        {
          test: /\.svg$/,
          use: ['@svgr/webpack']
        },
        {
          test: /\.(png|jpe?g|ico)$/i,
          type: 'asset/resource'
        },
        {
          test: /\.(pdf|gif)$/,
          use: 'file-loader?name=[path][name].[ext]'
        },
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
      minimize: true,
      minimizer: [new TerserPlugin()]
    },

    plugins: [new webpack.DefinePlugin(envKeys)]
  };
};

module.exports = config();
