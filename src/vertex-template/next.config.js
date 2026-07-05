/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    // Optional dev-mode proxy: forward /api/v2 requests to a real backend
    // (e.g. a staging environment) instead of the local API routes.
    const devProxyTarget = process.env.NEXT_PUBLIC_DEV_API_PROXY_TARGET;
    if (process.env.NEXT_PUBLIC_ENV === 'development' && devProxyTarget) {
      return [
        {
          source: '/api/v2/:path*',
          destination: `${devProxyTarget.replace(/\/$/, '')}/api/v2/:path*`,
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
};

module.exports = nextConfig;
