const withVideos = require('next-videos');
const PnpWebpackPlugin = require('pnp-webpack-plugin');

module.exports = withVideos({
  webpack: (config, options) => {
    // Enables Webpack's support for Yarn PnP
    PnpWebpackPlugin.setup();

    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
});
