import { NextRequest, NextResponse } from 'next/server';

const API_URL = process.env.API_URL;
const API_TOKEN = process.env.API_TOKEN;

function isValidUrl(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { endpoint: string[] } },
) {
  try {
    if (!API_URL || !API_TOKEN) {
      return NextResponse.json(
        { error: 'API configuration missing' },
        { status: 500 },
      );
    }

    if (!params || !params.endpoint || params.endpoint.length === 0) {
      return NextResponse.json(
        { error: 'Missing API endpoint' },
        { status: 400 },
      );
    }

    if (!isValidUrl(API_URL)) {
      return NextResponse.json(
        { error: 'Invalid API_URL configuration' },
        { status: 500 },
      );
    }

    const endpoint = params.endpoint.join('/');
    const { searchParams } = new URL(request.url);

    // Ensure path ends with '/' so query params are attached after the trailing slash
    const basePath = `/website/api/v2/${endpoint}`;
    const normalizedPath = basePath.endsWith('/') ? basePath : `${basePath}/`;
    const apiUrl = new URL(normalizedPath, API_URL);

    // Forward other query params except token first
    searchParams.forEach((value, key) => {
      if (key !== 'token') {
        apiUrl.searchParams.append(key, value);
      }
    });

    // Append token last (some backends expect token in query)
    apiUrl.searchParams.append('token', API_TOKEN);

    // Redacted logging for debugging - do not print the token value
    try {
      const redacted = apiUrl
        .toString()
        .replace(/([?&])token=[^&]*/i, '$1token=***');
      // eslint-disable-next-line no-console
      console.debug(
        '[v2-proxy] proxying GET to:',
        redacted,
        ' tokenPresent:',
        apiUrl.searchParams.has('token'),
      );
    } catch {
      // ignore logging errors
    }

    // eslint-disable-next-line no-console
    console.log('API URL:', apiUrl.toString());

    const res = await fetch(apiUrl.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    const text = await res.text();

    // Try to parse JSON, if not return as text
    let body: any = text;
    try {
      body = JSON.parse(text);
    } catch {
      // leave as text
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: body?.error || res.statusText || 'API error' },
        { status: res.status },
      );
    }

    return NextResponse.json(body, {
      status: 200,
      headers: {
        'Cache-Control': 's-maxage=60, stale-while-revalidate',
      },
    });
  } catch (error) {
    // Log server-side only
    // eslint-disable-next-line no-console
    console.error('API Proxy Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { endpoint: string[] } },
) {
  try {
    if (!API_URL || !API_TOKEN) {
      return NextResponse.json(
        { error: 'API configuration missing' },
        { status: 500 },
      );
    }

    if (!params || !params.endpoint || params.endpoint.length === 0) {
      return NextResponse.json(
        { error: 'Missing API endpoint' },
        { status: 400 },
      );
    }

    if (!isValidUrl(API_URL)) {
      return NextResponse.json(
        { error: 'Invalid API_URL configuration' },
        { status: 500 },
      );
    }

    const endpoint = params.endpoint.join('/');
    const { searchParams } = new URL(request.url);

    // Ensure path ends with '/' so query params are attached after the trailing slash
    const basePath = `/website/api/v2/${endpoint}`;
    const normalizedPath = basePath.endsWith('/') ? basePath : `${basePath}/`;
    const apiUrl = new URL(normalizedPath, API_URL);

    // Forward other query params except token first
    searchParams.forEach((value, key) => {
      if (key !== 'token') {
        apiUrl.searchParams.append(key, value);
      }
    });

    // Append token last
    apiUrl.searchParams.append('token', API_TOKEN);

    try {
      const redacted = apiUrl
        .toString()
        .replace(/([?&])token=[^&]*/i, '$1token=***');
      // eslint-disable-next-line no-console
      console.debug(
        '[v2-proxy] proxying POST to:',
        redacted,
        ' tokenPresent:',
        apiUrl.searchParams.has('token'),
      );
    } catch {
      // ignore logging errors
    }

    const body = await request.text();

    const res = await fetch(apiUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body,
      cache: 'no-store',
    });

    const text = await res.text();
    let parsed: any = text;
    try {
      parsed = JSON.parse(text);
    } catch {
      // keep text
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: parsed?.error || res.statusText || 'API error' },
        { status: res.status },
      );
    }

    return NextResponse.json(parsed, {
      status: 200,
      headers: {
        'Cache-Control': 's-maxage=60, stale-while-revalidate',
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('API Proxy Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
