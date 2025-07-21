/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for containerization
  output: 'standalone',
  
  // Configure images for external sources
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
      },
      {
        protocol: 'https',
        hostname: '*.public.blob.vercel-storage.com',
      },
    ],
  },
  
  // Configure API proxying to backend
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.BACKEND_API_URL || 'http://srv828289.hstgr.cloud:8000'}/:path*`
      }
    ];
  },

  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ];
  },

  // Environment variables for client
  env: {
    NEXT_PUBLIC_SERVICE_NAME: 'airqo-frontend',
    NEXT_PUBLIC_SERVICE_VERSION: '1.0.0',
  },
};

export default nextConfig;