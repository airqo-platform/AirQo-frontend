/* eslint-disable */
const withVideos = require('next-videos');

module.exports = withVideos({
  output: 'standalone',
  transpilePackages: ['redux-persist'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flagsapi.com',
      },
      {
        protocol: 'https',
        hostname: 'asset.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'www.vhv.rs',
      },
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
      },
    ],
  },
  reactStrictMode: false, // Temporarily disabled to fix "Should have a queue" error
  eslint: {
    dirs: ['pages', 'components', 'lib', 'utils', 'hooks'],
  },

  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    return config;
  },

  async rewrites() {
    return {
      beforeFiles: [
        // Use API routes for dynamic generation
        {
          source: '/robots.txt',
          destination: '/api/robots',
        },
        {
          source: '/sitemap.xml',
          destination: '/api/sitemap',
        },
      ],
    };
  },
});
