/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for Docker
  output: 'standalone',

  // Images: keep only the hostnames you load from
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'http',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'diginsights.com',
      },
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '8000',
        pathname: '/media/**',
      },
    ],
  },

  // Essential redirects only
  async redirects() {
    return [
      { source: '/', destination: '/home', permanent: false },
      {
        source: '/clean-air-network',
        destination: '/clean-air-network/about',
        permanent: true,
      },
      {
        source: '/clean-air',
        destination: '/clean-air-network/about',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
