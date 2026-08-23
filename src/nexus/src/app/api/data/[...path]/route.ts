import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/shared/lib/auth';
import { buildServerApiUrl } from '@/shared/lib/api-routing';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * Server-side BFF for API_TOKEN-mode requests.
 *
 * The client never sees the shared API_TOKEN.  It sends requests to
 * /api/data/<path> and this route verifies the user has an active session,
 * validates the target path against an allowlist (prevents SSRF), then
 * forwards the request to the real backend with `token` and `access_token`
 * query params set server-side from process.env.API_TOKEN.
 */

// ── Path allowlist ────────────────────────────────────────────────────────
// Only paths matching one of these prefixes may be forwarded.
// This prevents SSRF against arbitrary backend endpoints.
const ALLOWED_PATH_PREFIXES = [
  'devices/readings/recent',
  'devices/readings/rankings',
  'devices/readings/map',
  'devices/sites/summary',
  'devices/grids/summary',
  'devices/grids/countries',
  'devices/measurements',
  'analytics/data-download',
  'analytics/dashboard/chart/d3/data',
  'predict/daily-forecasting',
  'predict/hourly-forecasting',
];

function isPathAllowed(pathSegments: string[]): boolean {
  const joined = pathSegments.join('/');
  return ALLOWED_PATH_PREFIXES.some(prefix => joined === prefix || joined.startsWith(prefix + '/'));
}

// ── Shared handler ────────────────────────────────────────────────────────
const REQUEST_TIMEOUT_MS = 30_000;

async function forwardRequest(
  request: NextRequest,
  pathSegments: string[]
): Promise<NextResponse> {
  // 1. Session guard
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2. Allowlist check
  if (!isPathAllowed(pathSegments)) {
    return NextResponse.json(
      { error: 'Path not allowed' },
      { status: 403 }
    );
  }

  // 3. API_TOKEN must be configured
  const apiToken = process.env.API_TOKEN;
  if (!apiToken) {
    return NextResponse.json(
      { error: 'Server misconfiguration' },
      { status: 500 }
    );
  }

  // 4. Build backend URL
  const backendPath = pathSegments.join('/');
  const backendUrl = new URL(buildServerApiUrl(backendPath));

  // 5. Forward all incoming query params, then attach the token server-side
  const incomingParams = request.nextUrl.searchParams;
  incomingParams.forEach((value, key) => {
    backendUrl.searchParams.set(key, value);
  });
  backendUrl.searchParams.set('token', apiToken);
  backendUrl.searchParams.set('access_token', apiToken);

  // 6. Build forwarding headers (strip host/cookie, forward content-type)
  const forwardedHeaders = new Headers();
  const contentType = request.headers.get('content-type');
  if (contentType) {
    forwardedHeaders.set('content-type', contentType);
  }
  const accept = request.headers.get('accept');
  if (accept) {
    forwardedHeaders.set('accept', accept);
  }

  // 7. Forward the request with a timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const init: RequestInit = {
      method: request.method,
      headers: forwardedHeaders,
      signal: controller.signal,
    };

    // Forward body for non-GET/HEAD methods
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const body = await request.text();
      if (body) {
        init.body = body;
      }
    }

    const response = await fetch(backendUrl.toString(), init);

    // 8. Proxy the backend response back to the client
    // For 5xx errors, return clean JSON instead of forwarding raw backend HTML
    if (response.status >= 500) {
      return NextResponse.json(
        {
          error: 'Upstream service unavailable',
          message:
            'The data service is temporarily unavailable. Please try again later.',
        },
        { status: response.status }
      );
    }

    const responseBody = await response.text();
    const responseHeaders = new Headers();
    const backendContentType = response.headers.get('content-type');
    if (backendContentType) {
      responseHeaders.set('content-type', backendContentType);
    }
    responseHeaders.set(
      'Cache-Control',
      'no-store, no-cache, max-age=0, must-revalidate'
    );

    return new NextResponse(responseBody, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Upstream request timed out' },
        { status: 504 }
      );
    }
    // Network failure or other fetch error – never leak URLs or tokens
    return NextResponse.json(
      { error: 'Bad gateway' },
      { status: 502 }
    );
  } finally {
    clearTimeout(timeoutId);
  }
}

// ── Route handlers ────────────────────────────────────────────────────────

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return forwardRequest(request, params.path);
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return forwardRequest(request, params.path);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return forwardRequest(request, params.path);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return forwardRequest(request, params.path);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return forwardRequest(request, params.path);
}
