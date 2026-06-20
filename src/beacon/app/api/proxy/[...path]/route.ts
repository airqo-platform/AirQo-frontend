import { NextRequest, NextResponse } from 'next/server';

const getApiBaseUrl = () => {
  return process.env.AIRQO_STAGING_API_BASE_URL ||
    process.env.NEXT_PUBLIC_AIRQO_STAGING_API_BASE_URL ||
    process.env.AIRQO_API_BASE_URL ||
    process.env.NEXT_PUBLIC_AIRQO_API_BASE_URL ||
    'https://staging-platform.airqo.net';
};

const AIRQO_API_BASE_URL = getApiBaseUrl();

async function handleProxy(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const pathSegments = params.path || [];
    const path = pathSegments.join('/');
    const searchParams = request.nextUrl.searchParams.toString();
    const query = searchParams ? `?${searchParams}` : '';
    
    // Construct the destination URL correctly.
    // Ensure we don't duplicate 'api/' if it's already in the path or base URL incorrectly
    // The request to /api/proxy/v2/users/... will have pathSegments = ['v2', 'users', ...]
    const targetUrl = `${AIRQO_API_BASE_URL}/api/${path}${query}`;

    // Forward relevant headers
    const headers = new Headers();
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers.set('Authorization', authHeader);
    }
    const contentType = request.headers.get('content-type');
    if (contentType) {
      headers.set('Content-Type', contentType);
    }

    const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
    const body = hasBody ? await request.arrayBuffer() : null;

    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body: hasBody ? body : undefined,
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Access-Control-Allow-Origin', '*');

    // Remove headers that might cause issues when proxying
    responseHeaders.delete('content-encoding');
    responseHeaders.delete('content-length');
    // Important: we don't want to mess up chunked transfer encoding

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error: any) {
    console.error(`Proxy error for ${request.method} ${request.url}:`, error);
    return NextResponse.json(
      { success: false, message: 'Proxy request failed', error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest, context: { params: { path: string[] } }) {
  return handleProxy(request, context);
}

export async function POST(request: NextRequest, context: { params: { path: string[] } }) {
  return handleProxy(request, context);
}

export async function PUT(request: NextRequest, context: { params: { path: string[] } }) {
  return handleProxy(request, context);
}

export async function DELETE(request: NextRequest, context: { params: { path: string[] } }) {
  return handleProxy(request, context);
}

export async function PATCH(request: NextRequest, context: { params: { path: string[] } }) {
  return handleProxy(request, context);
}
