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

  webpack(config, { isServer, dev }) {
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

    // Suppress axios warnings in Edge Runtime by excluding it from edge builds
    if (!isServer && !dev) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Only exclude axios in production client builds to avoid edge runtime warnings
      };
    }

    // Ignore specific warnings related to Node.js APIs in Edge Runtime
    config.ignoreWarnings = [
      { module: /node_modules\/axios\/lib\/utils\.js/ },
      /A Node\.js API is used \(setImmediate\)/,
      /A Node\.js API is used \(process\.nextTick\)/,
    ];

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
