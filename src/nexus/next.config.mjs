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

  // Build connect-src: self + analytics + cloudinary + firebase + mapbox + payment + OAuth + backend API
  const connectSrcDomains = [
    "'self'",
    // PostHog ingest (production uses us.i subdomain)
    'https://us.posthog.com',
    'https://us.i.posthog.com',
    'https://us-assets.i.posthog.com',
    'https://www.google-analytics.com',
    'https://api.cloudinary.com',
    'https://firebasestorage.googleapis.com',
    'https://api.mapbox.com',
    'https://events.mapbox.com',
    // Paddle payment provider API endpoints
    'https://sandbox-api.paddle.com',
    'https://api.paddle.com',
    'https://sandbox-buy.paddle.com',
    'https://buy.paddle.com',
    // ProfitWell analytics (loaded by Paddle.js)
    'https://public.profitwell.com',
    // Map geocoding service
    'https://photon.komoot.io',
    // Google Tag Manager runtime beacons
    'https://www.googletagmanager.com',
  ];
  if (apiOrigin) {
    connectSrcDomains.push(apiOrigin);
  }

  // Build script-src: standard + analytics + payment SDKs
  const scriptSrcDomains = [
    "'self'",
    "'unsafe-eval'",
    "'unsafe-inline'",
    'blob:',
    // PostHog
    'https://us.posthog.com',
    'https://us.i.posthog.com',
    'https://us-assets.i.posthog.com',
    // Google Tag Manager / Analytics
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    // Paddle + ProfitWell (loaded internally by Paddle.js)
    'https://cdn.paddle.com',
    'https://sandbox-cdn.paddle.com',
    'https://public.profitwell.com',
  ];

  // Build frame-src: Paddle checkout iframes
  const frameSrcDomains = [
    "'self'",
    'https://sandbox-buy.paddle.com',
    'https://buy.paddle.com',
  ];

  // Build img-src: standard + third-party assets
  const imgSrcDomains = [
    "'self'",
    'data:',
    'blob:',
    'https://res.cloudinary.com',
    'https://asset.cloudinary.com',
    'https://flagcdn.com',
    'https://firebasestorage.googleapis.com',
    'https://purecatamphetamine.github.io',
    // Google OAuth provider icons
    'https://lh3.googleusercontent.com',
    'https://avatars.githubusercontent.com',
    // YouTube video thumbnails
    'https://img.youtube.com',
    // AirQo CDN (Learn module content)
    'https://cdn.airqo.net',
  ];

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrcDomains.join(' ')}`,
    "style-src 'self' 'unsafe-inline' https://cdn.paddle.com https://sandbox-cdn.paddle.com",
    `img-src ${imgSrcDomains.join(' ')}`,
    "font-src 'self'",
    "media-src 'self' https://res.cloudinary.com https://cdn.airqo.net",
    `connect-src ${connectSrcDomains.join(' ')}`,
    "worker-src 'self' blob:",
    `frame-src ${frameSrcDomains.join(' ')}`,
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
