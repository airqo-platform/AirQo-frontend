/* eslint-disable */
const withVideos = require('next-videos');
const path = require('path');

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

  // Client-side optimizations and error handling
  reactStrictMode: false, // Disabled to prevent double-mounting issues

  // Improve error handling during development
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },

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

    // Fix webpack module resolution issues
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
    };

    // Enhanced module resolution
    config.resolve.extensions = ['.js', '.jsx', '.ts', '.tsx', '.json'];

    // Fix webpack chunk loading issues and dynamic import problems
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
      chunkIds: 'deterministic',
      splitChunks: {
        chunks: 'all',
        minSize: 20000,
        maxSize: 244000,
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            reuseExistingChunk: true,
            enforce: true,
          },
          common: {
            name: 'common',
            minChunks: 2,
            priority: -15,
            reuseExistingChunk: true,
            enforce: true,
          },
          // Separate airQuality-map feature bundle to prevent circular dependencies
          airQualityMap: {
            test: /[\\/]src[\\/]common[\\/]features[\\/]airQuality-map[\\/]/,
            name: 'airquality-map',
            priority: 20,
            reuseExistingChunk: true,
            enforce: true,
          },
        },
      },
      // Fix runtime chunk issues that cause originalFactory errors
      runtimeChunk: {
        name: (entrypoint) => `runtime-${entrypoint.name}`,
      },
    };

    // Enhanced error handling and webpack internal error suppression
    config.stats = {
      ...config.stats,
      errorDetails: true,
      warnings: false,
      warningsFilter: [
        /Critical dependency: the request of a dependency is an expression/,
        /Can't resolve 'original-factory'/,
        /Module not found/,
      ],
    };

    // Suppress axios warnings in Edge Runtime
    if (!isServer && !dev) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Only exclude axios in production client builds to avoid edge runtime warnings
      };
    }

    // Enhanced warning suppression for production builds
    config.ignoreWarnings = [
      { module: /node_modules\/axios\/lib\/utils\.js/ },
      /A Node\.js API is used \(setImmediate\)/,
      /A Node\.js API is used \(process\.nextTick\)/,
      /Can't resolve 'original-factory'/,
      /Critical dependency: the request of a dependency is an expression/,
      /Module not found: Error: Can't resolve/,
      /originalFactory is undefined/,
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
