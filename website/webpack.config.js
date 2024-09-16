const path = require('path');
const webpack = require('webpack');
const dotenv = require('dotenv');
const HtmlWebpackPlugin = require('html-webpack-plugin');

dotenv.config();

const ROOT = path.resolve(__dirname, 'frontend');
const NODE_ENV = process.env.NODE_ENV || 'development';
const STATIC_URL = process.env.REACT_WEB_STATIC_HOST
  ? process.env.REACT_WEB_STATIC_HOST.replace(/\/+$/, '')
  : '';
const PUBLIC_PATH =
  NODE_ENV === 'production' ? `${STATIC_URL}/frontend/` : `${STATIC_URL}/static/frontend/`;
const STATIC_DIR = 'frontend/static/frontend';
const DIST_DIR = path.resolve(__dirname, STATIC_DIR);

module.exports = {
  mode: NODE_ENV,
  context: path.resolve(__dirname),
  entry: './frontend/index.js',
  output: {
    path: DIST_DIR,
    filename: '[name].bundle.js',
    publicPath: PUBLIC_PATH,
    clean: true
  },
  devServer: {
    port: 8081,
    headers: { 'Access-Control-Allow-Origin': '*' },
    compress: true,
    hot: true,
    historyApiFallback: true,
    static: {
      directory: './static',
      publicPath: '/static/'
    },
    client: {
      overlay: {
        errors: true,
        warnings: false
      }
    }
  },
  devtool: NODE_ENV === 'development' ? 'eval-source-map' : 'source-map',
  resolve: {
    modules: [ROOT, 'frontend/src', 'node_modules'],
    extensions: ['.js', '.jsx', '.ts', '.tsx', '...']
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: ['@babel/preset-env', '@babel/preset-react'],
            plugins: ['@babel/plugin-transform-runtime']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader', 'postcss-loader']
      },
      {
        test: /\.s[ac]ss$/i,
        use: ['style-loader', 'css-loader', 'postcss-loader', 'sass-loader']
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
    new webpack.DefinePlugin({
      'process.env': JSON.stringify(process.env)
    }),
    NODE_ENV === 'production' &&
      new HtmlWebpackPlugin({
        template: path.resolve(__dirname, 'frontend', 'templates', 'index.html'),
        filename: 'index.html',
        inject: 'body'
      })
  ],
  performance: {
    hints: NODE_ENV === 'production' ? 'warning' : false,
    maxEntrypointSize: 512000,
    maxAssetSize: 512000
  }
};
