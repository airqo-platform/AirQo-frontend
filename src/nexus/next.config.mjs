/** @type {import('next').NextConfig} */
const stripApiSuffix = baseUrl => {
  const trimmedBaseUrl = (baseUrl || '').trim().replace(/\/+$/, '');

  if (/\/api\/v\d+\/[^/]+$/i.test(trimmedBaseUrl)) {
    return trimmedBaseUrl.replace(/\/api\/v\d+\/[^/]+$/i, '');
  }

  if (/\/api\/v\d+$/i.test(trimmedBaseUrl)) {
    return trimmedBaseUrl.replace(/\/api\/v\d+$/i, '');
  }

  if (/\/api$/i.test(trimmedBaseUrl)) {
    return trimmedBaseUrl.replace(/\/api$/i, '');
  }

  return trimmedBaseUrl;
};

const resolveApiOrigin = () => {
  const configuredBaseUrl =
    process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '';
  return stripApiSuffix(configuredBaseUrl);
};

const isProduction = process.env.NODE_ENV === 'production';

const buildContentSecurityPolicy = () => {
  const apiOrigin = resolveApiOrigin();

  // Build connect-src: self + analytics + cloudinary + firebase + mapbox + backend API
  const connectSrcDomains = [
    "'self'",
    'https://us.posthog.com',
    'https://www.google-analytics.com',
    'https://api.cloudinary.com',
    'https://firebasestorage.googleapis.com',
    'https://api.mapbox.com',
    'https://events.mapbox.com',
  ];
  if (apiOrigin) {
    connectSrcDomains.push(apiOrigin);
  }

  const directives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://us.posthog.com https://www.googletagmanager.com https://www.google-analytics.com",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://res.cloudinary.com https://asset.cloudinary.com https://flagcdn.com https://firebasestorage.googleapis.com https://purecatamphetamine.github.io",
    "font-src 'self'",
    "media-src 'self' https://res.cloudinary.com",
    `connect-src ${connectSrcDomains.join(' ')}`,
    "worker-src 'self' blob:",
    "frame-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ];

  if (isProduction) {
    directives.push('upgrade-insecure-requests');
  }

  return directives.join('; ');
};

const securityHeaders = [
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
  {
    key: 'Content-Security-Policy',
    value: buildContentSecurityPolicy(),
  },
];

if (isProduction) {
  securityHeaders.push({
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  });
}

const nextConfig = {
  output: 'standalone',
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
  async rewrites() {
    const apiOrigin = resolveApiOrigin();

    if (!apiOrigin) {
      return [];
    }

    return [
      {
        source: '/api/v:version/:path*',
        destination: `${apiOrigin}/api/v:version/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'asset.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      },
    ],
  },
};

export default nextConfig;
