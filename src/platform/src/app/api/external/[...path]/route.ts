import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/shared/lib/auth';
import { resolveApiOrigin } from '@/shared/lib/api-routing';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const TOKEN_ENDPOINT_ALLOWLIST: RegExp[] = [
  /^\/api\/v\d+\/devices\/sites\/summary\/?$/i,
  /^\/api\/v\d+\/devices\/grids\/summary\/?$/i,
  /^\/api\/v\d+\/devices\/grids\/countries\/?$/i,
  /^\/api\/v\d+\/devices\/readings\/map\/?$/i,
  /^\/api\/v\d+\/devices\/readings\/recent\/?$/i,
  /^\/api\/v\d+\/analytics\/data-download\/?$/i,
  /^\/api\/v\d+\/users\/preferences\/replace\/?$/i,
];

const isAllowedTokenPath = (path: string): boolean => {
  return TOKEN_ENDPOINT_ALLOWLIST.some(pattern => pattern.test(path));
};

const unauthorizedResponse = () =>
  NextResponse.json(
    { success: false, message: 'Unauthorized' },
    { status: 401 }
  );

const forbiddenResponse = () =>
  NextResponse.json(
    {
      success: false,
      message: 'Token proxy is not allowed for this endpoint',
    },
    { status: 403 }
  );

async function proxyRequest(request: NextRequest, pathSegments: string[]) {
  try {
    const session = (await getServerSession(authOptions)) as {
      user?: unknown;
    } | null;
    if (!session?.user) {
      return unauthorizedResponse();
    }

    const apiToken = (process.env.API_TOKEN || '').trim();
    if (!apiToken) {
      return NextResponse.json(
        {
          success: false,
          message: 'API_TOKEN is not configured',
        },
        { status: 500 }
      );
    }

    const targetPath = `/${pathSegments.join('/')}`.replace(/\/+/g, '/');
    if (!isAllowedTokenPath(targetPath)) {
      return forbiddenResponse();
    }

    const targetUrl = new URL(`${resolveApiOrigin()}${targetPath}`);

    request.nextUrl.searchParams.forEach((value, key) => {
      if (key.toLowerCase() === 'token') {
        return;
      }
      targetUrl.searchParams.set(key, value);
    });

    targetUrl.searchParams.set('token', apiToken);

    const headers = new Headers();
    headers.set('Accept', 'application/json');

    const incomingContentType = request.headers.get('content-type');
    if (incomingContentType) {
      headers.set('Content-Type', incomingContentType);
    }

    const init: RequestInit = {
      method: request.method,
      headers,
      cache: 'no-store',
    };

    if (request.method !== 'GET' && request.method !== 'HEAD') {
      const requestBody = await request.text();
      if (requestBody) {
        init.body = requestBody;
      }
    }

    const response = await fetch(targetUrl.toString(), init);
    const responseBuffer = await response.arrayBuffer();

    const responseHeaders = new Headers();
    const responseContentType = response.headers.get('content-type');
    if (responseContentType) {
      responseHeaders.set('Content-Type', responseContentType);
    }

    responseHeaders.set(
      'Cache-Control',
      'no-store, no-cache, max-age=0, must-revalidate'
    );
    responseHeaders.set('Pragma', 'no-cache');
    responseHeaders.set('Expires', '0');

    return new NextResponse(responseBuffer, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('Token proxy request failed:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
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

export async function PUT(
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  return proxyRequest(request, params.path);
}
