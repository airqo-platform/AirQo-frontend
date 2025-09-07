import { NextRequest, NextResponse } from 'next/server';

// Ensure this route is always treated as dynamic at runtime
export const dynamic = 'force-dynamic';

/**
 * GET: Returns grids summary data using server-side authentication.
 * This is a simplified endpoint that always fetches the grids summary.
 */
export async function GET() {
  try {
    const apiUrl = process.env.API_URL;
    const apiToken = process.env.API_TOKEN;

    if (!apiUrl) {
      console.error('API_URL is not configured');
      return NextResponse.json(
        { error: 'API service not available' },
        { status: 500 },
      );
    }

    // Always prefer server-side token; ignore client token to avoid credential confusion
    const finalToken = apiToken || '';

    const url = `${apiUrl}/api/v2/devices/grids/summary${finalToken ? `?token=${finalToken}` : ''}`;

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'AirQo-Website/1.0',
      },
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Grids summary API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch grids summary' },
      { status: 500 },
    );
  }
}

/**
 * POST: Generic proxy endpoint for making authenticated requests to the AirQo API.
 *
 * Request Body:
 * - endpoint: API endpoint path (must start with '/')
 * - method: HTTP method (GET, POST, PUT, PATCH, DELETE) - defaults to POST
 * - data: Optional request body data
 *
 * Security: Always uses server-side API token for authentication.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, method = 'POST', data } = body;

    // Validate endpoint input
    if (typeof endpoint !== 'string' || !endpoint.startsWith('/')) {
      return NextResponse.json(
        { error: 'Invalid endpoint - must be a string starting with /' },
        { status: 400 },
      );
    }

    // Validate and sanitize HTTP method
    const allowedMethods = new Set(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']);
    const safeMethod = allowedMethods.has(String(method).toUpperCase())
      ? String(method).toUpperCase()
      : 'POST';

    const apiUrl = process.env.API_URL;
    const apiToken = process.env.API_TOKEN;

    if (!apiUrl) {
      console.error('API_URL is not configured');
      return NextResponse.json(
        { error: 'API service not available' },
        { status: 500 },
      );
    }

    let url = `${apiUrl}${endpoint}`;

    // Add token to query params if available (always use server-side token)
    if (apiToken) {
      const separator = endpoint.includes('?') ? '&' : '?';
      url += `${separator}token=${apiToken}`;
    }

    // Set up timeout to prevent hanging requests
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const response = await fetch(url, {
        method: safeMethod,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'AirQo-Website/1.0',
        },
        cache: 'no-store',
        signal: controller.signal,
        body: data ? JSON.stringify(data) : undefined,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const responseData = await response.json();
      return NextResponse.json(responseData);
    } catch (fetchError) {
      clearTimeout(timeout);
      throw fetchError;
    }
  } catch (error) {
    console.error('API proxy error:', error);

    // Handle specific error types
    if (error instanceof Error && error.name === 'AbortError') {
      return NextResponse.json({ error: 'Request timeout' }, { status: 408 });
    }

    return NextResponse.json(
      { error: 'Failed to proxy API request' },
      { status: 500 },
    );
  }
}
