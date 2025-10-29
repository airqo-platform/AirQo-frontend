import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL =
  process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || '';
const API_TOKEN = process.env.API_TOKEN;

if (!API_BASE_URL) {
  throw new Error(
    'API_URL or NEXT_PUBLIC_API_URL environment variable is required',
  );
}

if (!API_TOKEN) {
  throw new Error('API_TOKEN environment variable is required');
}

function sanitizeResponseData(data: any): any {
  if (!data || typeof data !== 'object') return data;

  const sanitized = { ...data };

  // Remove token from pagination URLs
  if (sanitized.next && typeof sanitized.next === 'string') {
    sanitized.next = removeTokenFromUrl(sanitized.next);
  }
  if (sanitized.previous && typeof sanitized.previous === 'string') {
    sanitized.previous = removeTokenFromUrl(sanitized.previous);
  }

  return sanitized;
}

function removeTokenFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.delete('token');
    return urlObj.toString();
  } catch {
    // If not a valid URL, return as is
    return url;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string[] } },
) {
  return handleRequest(request, params.slug, 'GET');
}

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string[] } },
) {
  return handleRequest(request, params.slug, 'POST');
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string[] } },
) {
  return handleRequest(request, params.slug, 'PUT');
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string[] } },
) {
  return handleRequest(request, params.slug, 'DELETE');
}

async function handleRequest(
  request: NextRequest,
  slug: string[],
  method: string,
) {
  try {
    // Build the external API URL
    const path = slug.join('/');
    // The client passes the full API path starting with /website/api/v2/
    const externalUrl = `${API_BASE_URL}/${path}`;

    // Get query parameters from the request
    const url = new URL(request.url);
    const searchParams = url.searchParams;

    // Build the final URL with query parameters and token
    const final = new URL(externalUrl);
    // carry over incoming query params, but strip token
    searchParams.forEach((v, k) => {
      if (k !== 'token') final.searchParams.append(k, v);
    });
    // ensure exactly one token param
    final.searchParams.set('token', API_TOKEN!);
    const finalUrl = final.toString();

    // Prepare headers for the external API request
    const headers = new Headers();
    // Forward incoming content-type if present, else default to JSON
    const incomingContentType = request.headers.get('content-type');
    if (incomingContentType) {
      headers.set('Content-Type', incomingContentType);
    } else {
      headers.set('Content-Type', 'application/json');
    }
    headers.set('Accept', 'application/json');

    // Get request body if it exists
    let body: string | undefined;
    if (method === 'POST' || method === 'PUT') {
      try {
        body = await request.text();
      } catch {
        // Body might not be JSON, ignore
      }
    }

    // Make the request to the external API
    const response = await fetch(finalUrl, {
      method,
      headers,
      body,
      // Add timeout
      signal: AbortSignal.timeout(30000), // 30 seconds
    });

    // Get response data
    const responseData = await response.json().catch(() => null);

    // Sanitize response data to remove token from pagination URLs
    const sanitizedData = sanitizeResponseData(responseData);

    // Return the response with the same status and data
    return NextResponse.json(sanitizedData, {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (_error) {
    console.error('API proxy error:', _error);

    if (_error instanceof Error && _error.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timeout' }, { status: 408 });
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
