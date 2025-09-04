/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations
  experimental: {
    optimizePackageImports: [
      '@radix-ui/react-accordion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-navigation-menu',
      '@radix-ui/react-slot',
      'lucide-react',
      'react-icons',
      'framer-motion',
    ],
    webpackBuildWorker: true,
  },

  // Image optimization settings
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 31536000, // 1 year
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
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

  // Compression and caching
  compress: true,
  poweredByHeader: false,
  generateEtags: true,

  // Headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            // Allow geolocation for the current origin (used by map/location features)
            value: 'camera=(), microphone=(), geolocation=(self)',
          },
          {
            // Enforce HSTS for one year, include subdomains and preload where supported
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
      // Ensure HTML pages are not aggressively cached by proxies/CDNs so users
      // always receive a fresh HTML that references current JS chunks. Static
      // assets under /_next/static remain long-lived and immutable.
      {
        // match everything except _next/static, _next/image, api, and static assets
        // use a negative lookahead to avoid interfering with hashed static files
        source: '/((?!_next/static|_next/image|api|fonts).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, must-revalidate',
          },
        ],
      },
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  async redirects() {
    return [
      {
        source: '/',
        destination: '/home',
        permanent: false,
      },
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
