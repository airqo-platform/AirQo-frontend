import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const normalizeApiBaseUrl = (baseUrl: string): string => {
  const trimmedBaseUrl = baseUrl.trim().replace(/\/+$/, '');

  if (/\/api\/v\d+$/i.test(trimmedBaseUrl)) {
    return trimmedBaseUrl;
  }

  if (/\/api$/i.test(trimmedBaseUrl)) {
    return `${trimmedBaseUrl}/v2`;
  }

  return `${trimmedBaseUrl}/api/v2`;
};

function buildBaseUrl(): string {
  const configuredBaseUrl =
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    '';

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

const buildTargetUrl = (baseUrl: string, pathSegments: string[]): string => {
  const targetPath = pathSegments.join('/').replace(/^\/+/, '');
  const normalizedPath = stripVersionPrefix(targetPath);

  if (!normalizedPath) {
    return baseUrl;
  }

  return `${baseUrl}/${normalizedPath}`;
};

async function proxyRequest(request: NextRequest, pathSegments: string[]) {
  try {
    const baseUrl = buildBaseUrl();
    const targetUrl = new URL(buildTargetUrl(baseUrl, pathSegments));

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
      targetUrl.searchParams.set(key, value);
    });

    targetUrl.searchParams.set('token', apiToken);

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
        console.error('Failed to read request body:', error);
      }
    }

    const response = await fetch(targetUrl.toString(), options);
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
    console.error('Proxy request failed:', error);
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
