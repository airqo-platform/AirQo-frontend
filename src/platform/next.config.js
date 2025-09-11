/** @type {import('next').NextConfig} */
const path = require('path');

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
      test: /\.svg$/,
      use: ['@svgr/webpack'],
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
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://api.mapbox.com; img-src 'self' data: https: blob:; connect-src 'self' https:; object-src 'none'; font-src 'self' data:;",
          },
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
