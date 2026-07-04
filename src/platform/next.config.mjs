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

const nextConfig = {
  output: 'standalone',
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
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
