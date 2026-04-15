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
    process.env.API_BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || '';
  return stripApiSuffix(configuredBaseUrl);
};

const nextConfig = {
  output: 'standalone',
  httpAgentOptions: {
    keepAlive: true,
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
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'asset.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
