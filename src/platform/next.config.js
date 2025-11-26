/** @type {import('next').NextConfig} */
const path = require('path'); // eslint-disable-line @typescript-eslint/no-require-imports

const nextConfig = {
  // Core settings
  reactStrictMode: false,
  swcMinify: true,
  output: 'standalone',

  // Essential transpilePackages only
  transpilePackages: [
    'redux-persist',
    'react-redux',
    '@reduxjs/toolkit',
    'react-hook-form',
    '@hookform/resolvers',
  ],

  // Simplified image config with SVG support
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'flagsapi.com' },
      { protocol: 'https', hostname: 'asset.cloudinary.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
    formats: ['image/webp'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Clean webpack config
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, './src'),
    };

    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }

    config.module.rules.push({
      test: /\.svg$/i,
      oneOf: [
        {
          resourceQuery: /url/, // e.g., import logoUrl from './logo.svg?url'
          type: 'asset',
        },
        {
          issuer: /\.[jt]sx?$/,
          use: ['@svgr/webpack'], // e.g., import Logo from './logo.svg'
        },
      ],
    });

    return config;
  },

  // Essential headers only
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
            value: 'SAMEORIGIN',
          },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; " +
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://api.mapbox.com https://maps.googleapis.com https://maps.gstatic.com; " +
              "worker-src 'self' blob: https://api.mapbox.com https://maps.googleapis.com https://maps.gstatic.com; " +
              "style-src 'self' 'unsafe-inline' https://api.mapbox.com https://fonts.googleapis.com https://maps.gstatic.com; " +
              "img-src 'self' data: https: blob: https://maps.gstatic.com https://*.googleapis.com https://*.gstatic.com https://res.cloudinary.com https://asset.cloudinary.com; " +
              "connect-src 'self' https: https://api.mapbox.com https://maps.googleapis.com https://maps.gstatic.com; " +
              "media-src 'self' https: https://res.cloudinary.com https://asset.cloudinary.com blob: data:; " +
              "object-src 'none'; font-src 'self' data:; frame-ancestors 'self';",
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=15552000; includeSubDomains; preload',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          // Allow cross-origin resource loads (e.g., Cloudinary videos)
          { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
        ],
      },
    ];
  },

  // Performance settings
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  experimental: {
    optimizeCss: true,
  },
};

module.exports = nextConfig;
