const path = require('path');
const webpack = require('webpack');
// const autoprefixer = require('autoprefixer');
// const webpack = require('webpack');
// const TerserPlugin = require('terser-webpack-plugin');

const ROOT = path.resolve(__dirname, 'frontend');

function stripLoaderConfig() {
  return {
    loader: 'strip-loader',
    options: {
      strip: ['assert', 'typeCheck', 'log.log', 'log.debug', 'log.deprecate', 'log.info', 'log.warn'],
    },
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
        plugins: [['postcss-preset-env', {}]],
      },
    },
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
  const NODE_ENV = process.env.NODE_ENV || 'local';

  const STATIC_URL = removeTrailingSlash(process.env.REACT_WEB_STATIC_HOST);

  const PUBLIC_PATH = strToBool(process.env.DEBUG) ? `${STATIC_URL}/static/frontend/` : `${STATIC_URL}/frontend/`;

  const STATIC_DIR = 'frontend/static/frontend';

  const DIST_DIR = path.resolve(__dirname, STATIC_DIR);

  const envKeys = Object.keys(process.env).reduce((prev, next) => {
    if (next.startsWith('REACT_')) {
      prev[`process.env.${next}`] = JSON.stringify(process.env[next]);
    }

    return prev;
  }, {});

  function prodOnly(x) {
    return NODE_ENV === 'production' ? x : undefined;
  }

  return {
    context: path.resolve(__dirname),

    entry: './frontend/index.js',

    output: {
      path: DIST_DIR,
      filename: '[name].bundle.js',
      publicPath: PUBLIC_PATH,
    },

    // webpack 5 comes with devServer which loads in development mode
    devServer: {
      port: 8081,
      headers: { 'Access-Control-Allow-Origin': '*' },
      compress: true,
      hot: true,
      historyApiFallback: true,
      static: {
        directory: './static',
      },
    },

    resolve: {
      modules: [ROOT, 'frontend/src', 'node_modules'],
      extensions: ['.js', '.jsx', '.ts', '.tsx', '...'],
    },

    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          exclude: /node_modules/,
          use: compact([
            {
              loader: 'babel-loader',
            },
            prodOnly(stripLoaderConfig()),
          ]),
        },

        // Inlined CSS definitions for JS components
        {
          test: /\.css$/,
          use: compact([{ loader: 'style-loader' }, { loader: 'css-loader' }, postCSSLoader()]),
        },
        {
          test: /\.s[ac]ss$/i,
          use: compact([
            { loader: 'style-loader' },
            { loader: 'css-loader' },
            postCSSLoader(),
            { loader: 'sass-loader' },
          ]),
        },

        // SVGs
        {
          test: /\.svg$/,
          use: ['@svgr/webpack'],
        },

        // Images
        {
          test: /\.(png|jpe?g|ico)$/i,
          type: 'asset/resource',
        },
      ],
    },

    plugins: [
      new webpack.DefinePlugin(envKeys),
    ],
  };
};

module.exports = config();
