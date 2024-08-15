const withVideos = require('next-videos');

module.exports = withVideos({
  images: {
    remotePatterns: [],
  },
  eslint: {
    dirs: ['pages', 'components', 'lib', 'utils', 'src'],
    ignoreDuringBuilds: true,
  },
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
