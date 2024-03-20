const withVideos = require('next-videos');

module.exports = withVideos({
  // Adding support for Docker
  output: 'standalone',
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },
});
