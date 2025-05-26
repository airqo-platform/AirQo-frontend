/* eslint-disable */
const withVideos = require('next-videos');
const withTM = require('next-transpile-modules')(['redux-persist']);

module.exports = withTM(
  withVideos({
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
      ],
    },
    reactStrictMode: true,

    eslint: {
      dirs: ['pages', 'components', 'lib', 'utils', 'hooks'],
    },

    output: 'standalone',

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
    async redirects() {
      return [
        {
          source: '/',
          destination: '/Home',
          permanent: false,
        },
      ];
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
  }),
);
