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
      ],
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

      // Ensure compatibility with Node modules by handling environment fallbacks
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };

      return config;
    },
  }),
);
