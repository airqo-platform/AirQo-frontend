/* eslint-disable */
const withVideos = require('next-videos');

module.exports = withVideos({
  output: 'standalone',
  transpilePackages: ['redux-persist'],

  // Performance optimizations
  swcMinify: true,
  poweredByHeader: false,
  compress: true,

  // Optimize builds
  experimental: {
    optimizeServerReact: true,
    typedRoutes: false, // Disable if causing issues
  },

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
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Client-side optimizations
  reactStrictMode: false,

  eslint: {
    dirs: ['pages', 'components', 'lib', 'utils', 'hooks'],
  },

  webpack(config, { isServer, dev }) {
    // SVG handling
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Resolve fallbacks for client-side
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Bundle optimization
    if (!isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              priority: 10,
              reuseExistingChunk: true,
            },
            common: {
              name: 'common',
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
            },
          },
        },
      };
    }

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

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/static/(.*)',
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
