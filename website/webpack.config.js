const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

dotenv.config();

const ROOT = path.resolve(__dirname, 'frontend');

function stripLoaderConfig() {
  return {
    loader: 'strip-loader',
    options: {
      strip: [
        'assert',
        'typeCheck',
        'log.log',
        'log.debug',
        'log.deprecate',
        'log.info',
        'log.warn'
      ]
    }
  };
}

function compact(items) {
  return items.filter((item) => item);
}

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

const config = () => {
  const NODE_ENV = process.env.NODE_ENV || 'development';
  const isProduction = NODE_ENV === 'production';

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
    mode: isProduction ? 'production' : 'development',
    context: path.resolve(__dirname),
    entry: './frontend/index.js',
    output: {
      path: DIST_DIR,
      filename: '[name].bundle.js',
      publicPath: PUBLIC_PATH,
      clean: true
    },
    devtool: isProduction ? 'source-map' : 'eval-cheap-module-source-map',
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
          use: compact([
            {
              loader: 'babel-loader',
              options: {
                cacheDirectory: true
              }
            },
            isProduction && stripLoaderConfig()
          ])
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            postCSSLoader()
          ]
        },
        {
          test: /\.s[ac]ss$/i,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            postCSSLoader(),
            'sass-loader'
          ]
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
    plugins: [
      new webpack.DefinePlugin(envKeys),
      isProduction &&
        new MiniCssExtractPlugin({
          filename: '[name].[contenthash].css'
        })
    ].filter(Boolean),
    optimization: {
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: isProduction
            }
          }
        }),
        new CssMinimizerPlugin()
      ],
      splitChunks: {
        chunks: 'all'
      }
    }
  };
};

module.exports = config();
