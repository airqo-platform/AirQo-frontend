import { NextRequest, NextResponse } from 'next/server';

function buildBaseUrl(): string {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;
  if (!baseUrl) {
    throw new Error('API_BASE_URL is not defined in environment variables');
  }

  // Remove trailing slash
  const cleanBaseUrl = baseUrl.replace(/\/+$/, '');

  if (cleanBaseUrl.endsWith('/api/v2')) {
    return cleanBaseUrl;
  }

  // If it doesn't end with /api/v2, add it
  return `${cleanBaseUrl}/api/v2`;
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

async function proxyRequest(request: NextRequest, path: string[]) {
  try {
    const baseUrl = buildBaseUrl();
    const targetPath = path.join('/');
    // Clean paths to avoid double slashes
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const cleanPath = targetPath.replace(/^\//, '');
    const targetUrl = cleanPath ? `${cleanBaseUrl}/${cleanPath}` : cleanBaseUrl;

    const apiToken = process.env.API_TOKEN;
    if (!apiToken) {
      return NextResponse.json(
        { error: 'API_TOKEN not configured' },
        { status: 500 }
      );
    }

    // Build the URL
    const url = new URL(targetUrl);
    url.searchParams.set('token', apiToken);

    // Add original query params
    const originalUrl = new URL(request.url);
    originalUrl.searchParams.forEach((value, key) => {
      // Don't allow overriding the API token
      if (key === 'token') return;
      url.searchParams.set(key, value);
    });

    // Prepare fetch options
    const incomingContentType = request.headers.get('content-type');
    const headers: Record<string, string> = {};
    if (incomingContentType) {
      headers['Content-Type'] = incomingContentType;
    } else {
      headers['Content-Type'] = 'application/json';
    }

    const options: RequestInit = {
      method: request.method,
      headers,
    };

    // Add body for non-GET requests
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      try {
        const body = await request.text();
        if (body) {
          options.body = body;
        }
      } catch (error) {
        console.error('Failed to read request body:', error);
        // Ignore body parsing errors
      }
    }

    const response = await fetch(url.toString(), options);

    const responseBody = await response.text();

    return new NextResponse(responseBody, {
      status: response.status,
      headers: {
        'Content-Type':
          response.headers.get('Content-Type') || 'application/json',
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
