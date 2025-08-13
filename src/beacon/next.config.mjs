/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  

  typescript: {
    ignoreBuildErrors: true,
  },
  
  eslint: {
    ignoreDuringBuilds: process.env.IGNORE_ESLINT === 'true',
  },
  
  images: {
    domains: process.env.IMAGE_DOMAINS?.split(',') || [],
    remotePatterns: process.env.IMAGE_REMOTE_PATTERNS 
      ? JSON.parse(process.env.IMAGE_REMOTE_PATTERNS)
      : [
          {
            protocol: 'https',
            hostname: '**',
          },
        ],
    deviceSizes: process.env.IMAGE_DEVICE_SIZES?.split(',').map(Number) || [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: process.env.IMAGE_SIZES?.split(',').map(Number) || [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: parseInt(process.env.IMAGE_CACHE_TTL || '60', 10),
  },
  
  async rewrites() {
    const rewrites = [];
    
    if (process.env.AIRQO_API_BASE_URL) {
      rewrites.push({
        source: '/api/proxy/:path*',
        destination: `${process.env.AIRQO_API_BASE_URL}/api/:path*`,
      });
    }
    
    if (process.env.BACKEND_API_URL) {
      rewrites.push({
        source: '/api/backend/:path*',
        destination: `${process.env.BACKEND_API_URL}/:path*`,
      });
    }
    
    if (process.env.CUSTOM_REWRITES) {
      rewrites.push(...JSON.parse(process.env.CUSTOM_REWRITES));
    }
    
    return rewrites;
  },
  
  async headers() {
    const headers = [
      {
        source: '/(.*)',
        headers: [
          { 
            key: 'X-Content-Type-Options', 
            value: process.env.HEADER_CONTENT_TYPE_OPTIONS || 'nosniff' 
          },
          { 
            key: 'X-Frame-Options', 
            value: process.env.HEADER_FRAME_OPTIONS || 'DENY' 
          },
          { 
            key: 'X-XSS-Protection', 
            value: process.env.HEADER_XSS_PROTECTION || '1; mode=block' 
          },
          { 
            key: 'Referrer-Policy', 
            value: process.env.HEADER_REFERRER_POLICY || 'strict-origin-when-cross-origin' 
          },
          {
            key: 'Permissions-Policy',
            value: process.env.HEADER_PERMISSIONS_POLICY || 'camera=(), microphone=(), geolocation=()'
          },
        ],
      },
    ];
    
    if (process.env.ENABLE_CSP === 'true') {
      headers[0].headers.push({
        key: 'Content-Security-Policy',
        value: process.env.CSP_HEADER || "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline';"
      });
    }
    
    if (process.env.ENABLE_HSTS === 'true') {
      headers[0].headers.push({
        key: 'Strict-Transport-Security',
        value: process.env.HSTS_HEADER || 'max-age=63072000; includeSubDomains; preload'
      });
    }
    
    return headers;
  },
  
  env: {
    NEXT_PUBLIC_SERVICE_NAME: process.env.SERVICE_NAME,
    NEXT_PUBLIC_SERVICE_VERSION: process.env.SERVICE_VERSION,
    NEXT_PUBLIC_ENVIRONMENT: process.env.NODE_ENV,
    NEXT_PUBLIC_BUILD_ID: process.env.BUILD_ID || process.env.GIT_COMMIT || 'local',
    NEXT_PUBLIC_BUILD_DATE: process.env.BUILD_DATE || new Date().toISOString(),
  },
  
  publicRuntimeConfig: {
    apiUrl: process.env.NEXT_PUBLIC_API_URL,
    environment: process.env.NODE_ENV,
  },
  
  serverRuntimeConfig: {
    apiSecret: process.env.API_SECRET,
    databaseUrl: process.env.DATABASE_URL,
  },
  
  experimental: {
    workerThreads: process.env.ENABLE_WORKER_THREADS === 'true',
    cpus: parseInt(process.env.WORKER_CPUS || '1', 10),
    optimizeCss: process.env.OPTIMIZE_CSS === 'true',
    scrollRestoration: process.env.ENABLE_SCROLL_RESTORATION === 'true',
  },
  
  compiler: {
    removeConsole: process.env.REMOVE_CONSOLE === 'true' 
      ? {
          exclude: ['error', 'warn'],
        }
      : false,
    reactRemoveProperties: process.env.REMOVE_REACT_PROPERTIES === 'true',
    styledComponents: process.env.ENABLE_STYLED_COMPONENTS === 'true',
  },
  
  compress: process.env.ENABLE_COMPRESSION !== 'false',
  
  generateBuildId: async () => {
    return process.env.BUILD_ID || process.env.GIT_COMMIT || 'development';
  },
  
  poweredByHeader: process.env.SHOW_POWERED_BY === 'true',
  
  reactStrictMode: process.env.REACT_STRICT_MODE !== 'false',
  
  productionBrowserSourceMaps: process.env.ENABLE_SOURCE_MAPS === 'true',
  
  trailingSlash: process.env.ENABLE_TRAILING_SLASH === 'true',
  
  basePath: process.env.BASE_PATH || '',
  
  assetPrefix: process.env.ASSET_PREFIX || '',
  
  distDir: process.env.BUILD_DIR || '.next',
};

export default nextConfig;