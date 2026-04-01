/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    externalDir: true,
  },
};

export default nextConfig;