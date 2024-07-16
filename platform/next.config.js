const withVideos = require('next-videos');
const PnpWebpackPlugin = require('pnp-webpack-plugin');

module.exports = withVideos({
  webpack: (config, options) => {
    // Enables Webpack's support for Yarn PnP
    config.resolve = {
      ...config.resolve,
      alias: {
        ...config.resolve.alias,
        'pnpapi': require.resolve('pnpapi'),
      },
    };
    config.resolveLoader = {
      ...config.resolveLoader,
      plugins: [
        PnpWebpackPlugin.moduleLoader(module),
      ],
    };

    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
});
