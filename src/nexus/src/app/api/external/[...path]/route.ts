import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/shared/lib/auth';
import { normalizeApiBaseUrl } from '@/shared/lib/api-routing';
import logger from '@/shared/lib/logger';
import { checkRateLimit, getClientIp } from '@/shared/lib/rateLimit';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_PROXY_TIMEOUT_MS = 30000;

// Allowlist of upstream paths this proxy is permitted to serve.
// Derived from an audit of every createServerClient() call site:
//   analyticsService: /devices/readings/recent, /analytics/data-download
//   deviceService: /devices/sites/summary, /devices/grids/summary,
//                  /devices/grids/countries, /devices/readings/map,
//                  /predict/daily-forecasting, /predict/hourly-forecasting
//   userService: /users/preferences/replace
const ALLOWED_PATH_PREFIXES = [
  'devices/readings/recent',
  'devices/sites/summary',
  'devices/grids/summary',
  'devices/grids/countries',
  'devices/readings/map',
  'analytics/data-download',
  'predict/daily-forecasting',
  'predict/hourly-forecasting',
  'users/preferences/replace',
];

// HTTP methods this proxy supports. POST is needed for /analytics/data-download;
// PATCH is needed for /users/preferences/replace. PUT and DELETE are not used
// by any serverClient call site and are removed to reduce attack surface.
const ALLOWED_METHODS = ['GET', 'HEAD', 'POST', 'PATCH'] as const;

function buildBaseUrl(): string {
  const configuredBaseUrl =
    process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '';

  if (!configuredBaseUrl) {
    throw new Error(
      'API base URL is not defined. Set API_BASE_URL or NEXT_PUBLIC_API_BASE_URL in environment variables.'
    );
  }

  return normalizeApiBaseUrl(configuredBaseUrl);
}

const stripVersionPrefix = (path: string): string => {
  return path.replace(/^api\/v\d+\/?/i, '');
};

const buildTargetUrl = (baseUrl: string, normalizedPath: string): string => {
  if (!normalizedPath) {
    return baseUrl;
  }

  return `${baseUrl}/${normalizedPath}`;
};

function hasPathTraversal(segments: string[]): boolean {
  return segments.some(segment => segment === '..' || segment === '%2e%2e');
}

function isPathAllowed(normalizedPath: string): boolean {
  const lowerPath = normalizedPath.toLowerCase();
  return ALLOWED_PATH_PREFIXES.some(prefix =>
    lowerPath.startsWith(prefix.toLowerCase())
  );
}

async function proxyRequest(request: NextRequest, pathSegments: string[]) {
  try {
    // 1. Require a valid session
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Rate limit
    const rateLimitResult = checkRateLimit(
      `${getClientIp(request)}:${pathSegments.join('/')}`,
      { windowMs: 60_000, maxRequests: 100 }
    );
    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many requests' },
        {
          status: 429,
          headers: {
            'Retry-After': Math.ceil(rateLimitResult.retryAfterMs / 1000).toString(),
          },
        }
      );
    }

    // 3. Block path traversal attempts
    if (hasPathTraversal(pathSegments)) {
      logger.warn('Path traversal attempt blocked in /api/external', {
        pathSegments,
        userId: session.user._id,
      });
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 });
    }

    // 4. Restrict HTTP methods
    if (!ALLOWED_METHODS.includes(request.method as (typeof ALLOWED_METHODS)[number])) {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      );
    }

    const baseUrl = buildBaseUrl();
    const targetPath = pathSegments.join('/').replace(/^\/+/, '');
    const normalizedPath = stripVersionPrefix(targetPath);

    // 5. Enforce path allowlist
    if (!isPathAllowed(normalizedPath)) {
      logger.warn('Blocked request to non-allowlisted path in /api/external', {
        path: normalizedPath,
        userId: session.user._id,
      });
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const targetUrl = new URL(buildTargetUrl(baseUrl, normalizedPath));

    const apiToken = (process.env.API_TOKEN || '').trim();
    if (!apiToken) {
      return NextResponse.json(
        { error: 'API_TOKEN not configured' },
        { status: 500 }
      );
    }

    request.nextUrl.searchParams.forEach((value, key) => {
      if (key.toLowerCase() === 'token') {
        return;
      }
      if (key.toLowerCase() === 'access_token') {
        return;
      }
      targetUrl.searchParams.set(key, value);
    });

    targetUrl.searchParams.set('token', apiToken);
    targetUrl.searchParams.set('access_token', apiToken);

    const headers: Record<string, string> = {};
    const incomingContentType = request.headers.get('content-type');
    if (incomingContentType) {
      headers['Content-Type'] = incomingContentType;
    } else {
      headers['Content-Type'] = 'application/json';
    }

    const options: RequestInit = {
      method: request.method,
      headers,
      cache: 'no-store',
    };

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        const requestBody = await request.text();
        if (requestBody) {
          options.body = requestBody;
        }
      } catch (error) {
        logger.error('Failed to read request body', error as Error);
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, DEFAULT_PROXY_TIMEOUT_MS);

    options.signal = controller.signal;

    let response: Response;

    try {
      response = await fetch(targetUrl.toString(), options);
    } finally {
      clearTimeout(timeoutId);
    }

    const responseBody = await response.text();

    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        'Content-Type':
          response.headers.get('Content-Type') || 'application/json',
        'Cache-Control': 'no-store, no-cache, max-age=0, must-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    });
  } catch (error) {
    if ((error as { name?: string })?.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Upstream request timed out' },
        { status: 504 }
      );
    }

    logger.error('Proxy request failed', error as Error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path);
}
