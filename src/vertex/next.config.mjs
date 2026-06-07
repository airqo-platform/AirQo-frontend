import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    if (process.env.NEXT_PUBLIC_ENV === 'development') {
      return [
        {
          source: '/api/v2/:path*',
          destination: 'https://staging-vertex.airqo.net/api/v2/:path*',
        },
      ];
    }
    return [];
  },

  async redirects() {
    return [
      {
        source: '/user/login',
        destination: '/login',
        permanent: false,
      },
      {
        source: '/user/home',
        destination: '/home',
        permanent: false,
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/api/v2/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,POST,PUT,DELETE,OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
    ];
  },
  webpack: config => {
    // This is the crucial part to resolve the duplicate React issue.
    config.resolve.alias = {
      ...config.resolve.alias,
      // Force all modules to use the project's main React instance
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    };
    return config;
  },
};

export default nextConfig;
