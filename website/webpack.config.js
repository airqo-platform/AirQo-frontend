const path = require('path');
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

const config = () => {
  const NODE_ENV = process.env.NODE_ENV || 'local';

  const STATIC_DIR = 'frontend/static/frontend';

  const DIST_DIR = path.resolve(__dirname, STATIC_DIR);

  function prodOnly(x) {
    return NODE_ENV === 'production' ? x : undefined;
  }

  return {
    context: path.resolve(__dirname),

    entry: './frontend/index.js',

    output: {
      path: DIST_DIR,
      filename: '[name].bundle.js',
      publicPath: `/${STATIC_DIR}/`,
    },

    // webpack 5 comes with devServer which loads in development mode
    devServer: {
      port: 8081,
      headers: { 'Access-Control-Allow-Origin': '*' },
      compress: true,
      hot: true,
      static: {
        directory: './static',
      },
    },

    resolve: {
      modules: [ROOT, 'frontend/src', 'node_modules'],
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
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
          test: /\.(png|jpg|ico)$/,
          use: compact([
            {
              loader: 'file-loader',
              options: { name: '[path][name].[ext]' },
            },
          ]),
        },
      ],
    },

    plugins: [],
  };
};

module.exports = config();
