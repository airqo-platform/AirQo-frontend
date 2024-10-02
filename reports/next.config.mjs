/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/reports',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/reports',
        permanent: true,
        basePath: false,
      },
      {
        source: '/login',
        destination: '/reports',
        permanent: true,
        basePath: false,
      },
    ];
  },
  reactStrictMode: true,
  eslint: {
    dirs: ['app', 'components', 'lib', 'utils', 'hooks', 'services', 'layout'],
  },
  experimental: {
    forceSwcTransforms: true,
  },
};

export default nextConfig;
