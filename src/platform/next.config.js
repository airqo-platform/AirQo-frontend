/* eslint-disable */
const withVideos = require('next-videos');
const path = require('path');

module.exports = withVideos({
  output: 'standalone',
  transpilePackages: ['redux-persist'],

  // Next.js already applies good defaults for chunking / minification.
  swcMinify: true,
  poweredByHeader: false,

  // Experimental features disabled to prevent webpack factory call errors
  // experimental: {
  //   esmExternals: true,
  // },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'flagsapi.com' },
      { protocol: 'https', hostname: 'asset.cloudinary.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'www.vhv.rs' },
      { protocol: 'https', hostname: 'img.freepik.com' },
    ],
    formats: ['image/webp', 'image/avif'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Enable strict mode for better development experience
  reactStrictMode: true,

  webpack(config, { isServer }) {
    // Path alias
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
    };

    // Improve webpack module resolution
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
        { source: '/robots.txt', destination: '/api/robots' },
        { source: '/sitemap.xml', destination: '/api/sitemap' },
      ],
    };
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
});
