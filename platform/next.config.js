/* eslint-disable */
const withVideos = require('next-videos');

module.exports = withVideos({
  // Image configuration: Add patterns here as necessary
  images: {
    remotePatterns: [],
  },
  reactStrictMode: true,

  // Specify directories for ESLint linting
  eslint: {
    dirs: ['pages', 'components', 'lib', 'utils', 'hooks'],
  },

  // Docker support (Standalone output for optimized Docker builds)
  output: 'standalone',

  // Webpack custom configuration
  webpack(config) {
    // Add rule for handling SVGs using @svgr/webpack
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
});
