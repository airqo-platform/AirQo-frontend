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
      {
        // Keep the install script short-lived in caches so bug fixes reach
        // `curl | bash` users quickly instead of being served stale.
        source: '/install.sh',
        headers: [
          { key: 'Content-Type', value: 'text/x-shellscript; charset=utf-8' },
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, must-revalidate',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
