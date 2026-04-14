import { NextRequest, NextResponse } from 'next/server';
import { buildServerApiUrl } from '@/shared/lib/api-routing';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

async function proxyRequest(request: NextRequest, path: string[]) {
  try {
    const targetPath = `/${path.join('/')}`;
    const targetUrl = new URL(buildServerApiUrl(targetPath));

    const apiToken = process.env.API_TOKEN;
    if (!apiToken) {
      return NextResponse.json(
        { error: 'API_TOKEN not configured' },
        { status: 500 }
      );
    }

    targetUrl.searchParams.set('token', apiToken);

    // Add original query params
    const originalUrl = new URL(request.url);
    originalUrl.searchParams.forEach((value, key) => {
      // Don't allow overriding the API token
      if (key === 'token') return;
      targetUrl.searchParams.set(key, value);
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
      cache: 'no-store',
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
