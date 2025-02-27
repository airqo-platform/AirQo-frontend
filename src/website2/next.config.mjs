/** @type {import('next').NextConfig} */
const nextConfig = {
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
  async redirects() {
    return [
      {
        source: '/clean-air/forum',
        destination: '/clean-air-forum/about?slug=clean-air-forum-2024',
        permanent: true,
      },
      {
        source: '/clean-air-forum',
        destination: '/clean-air-forum/about',
        permanent: true,
      },
      {
        source: '/clean-air-network',
        destination: '/clean-air-network/about',
        permanent: true,
      },
      {
        source: '/clean-air/about',
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
