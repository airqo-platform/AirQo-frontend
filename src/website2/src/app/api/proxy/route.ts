import { NextRequest, NextResponse } from 'next/server';

// Ensure this route is always treated as dynamic at runtime
export const dynamic = 'force-dynamic';

/**
 * Helper function to merge multiple abort signals, with fallback for older Node.js versions
 */
function mergeAbortSignals(
  ...signals: (AbortSignal | undefined)[]
): AbortSignal {
  const filtered = signals.filter(Boolean) as AbortSignal[];

  // Native fast-path if available (Node.js 20+)
  if (typeof (AbortSignal as any).any === 'function') {
    return (AbortSignal as any).any(filtered);
  }

  // Polyfill: forward the first abort reason
  if (filtered.some((s) => s.aborted)) {
    const s = filtered.find((s) => s.aborted)!;
    return AbortSignal.abort((s as any).reason);
  }

  const ctrl = new AbortController();
  const onAbort = (e: any) => {
    ctrl.abort((e?.target as any)?.reason);
  };

  for (const s of filtered) {
    s.addEventListener('abort', onAbort, { once: true });
  }

  return ctrl.signal;
}

/**
 * GET: Returns grids summary data using server-side authentication.
 * This is a simplified endpoint that always fetches the grids summary.
 */
export async function GET(request: NextRequest) {
  // Check if the client disconnected before processing
  if (request.signal?.aborted) {
    return new NextResponse(null, { status: 499 }); // Client closed request
  }

  let controller: AbortController | undefined;
  let timeout: NodeJS.Timeout | undefined;

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

    // Set up timeout and abort controllers
    controller = new AbortController();
    timeout = setTimeout(() => {
      controller?.abort(new DOMException('TimeoutError', 'TimeoutError'));
    }, 10000);

    // Combine client abort signal with our timeout controller (works on Node 18+)
    const combinedSignal = mergeAbortSignals(request.signal, controller.signal);

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'AirQo-Website/1.0',
      },
      signal: combinedSignal,
      next: { revalidate: 300 }, // Cache for 5 minutes
    });

    // Clear timeout on successful response
    if (timeout) {
      clearTimeout(timeout);
      timeout = undefined;
    }

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    // Clean up timeout if still active
    if (timeout) {
      clearTimeout(timeout);
    }

    // Handle specific error types gracefully
    if (error instanceof Error) {
      // Client disconnected or request was aborted
      if (error.name === 'AbortError' || request.signal?.aborted) {
        // Don't log client disconnections as errors - they're normal
        return new NextResponse(null, { status: 499 }); // Client closed request
      }

      // Handle timeout specifically
      if (error.message?.includes('timeout') || controller?.signal.aborted) {
        console.warn('Grids summary API request timeout');
        return NextResponse.json({ error: 'Request timeout' }, { status: 408 });
      }
    }

    console.error('Grids summary API error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack:
        process.env.NODE_ENV === 'development' && error instanceof Error
          ? error.stack
          : undefined,
    });

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
  // Check if the client disconnected before processing
  if (request.signal?.aborted) {
    return new NextResponse(null, { status: 499 }); // Client closed request
  }

  let controller: AbortController | undefined;
  let timeout: NodeJS.Timeout | undefined;

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

    // Set up timeout and abort controllers
    controller = new AbortController();
    timeout = setTimeout(() => {
      controller?.abort(new DOMException('TimeoutError', 'TimeoutError'));
    }, 10000);

    // Combine client abort signal with our timeout controller (works on Node 18+)
    const combinedSignal = mergeAbortSignals(request.signal, controller.signal);

    try {
      const response = await fetch(url, {
        method: safeMethod,
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'User-Agent': 'AirQo-Website/1.0',
        },
        cache: 'no-store',
        signal: combinedSignal,
        body: data ? JSON.stringify(data) : undefined,
      });

      // Clear timeout on successful response
      if (timeout) {
        clearTimeout(timeout);
        timeout = undefined;
      }

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const responseData = await response.json();
      return NextResponse.json(responseData);
    } catch (fetchError) {
      // Clear timeout on error
      if (timeout) {
        clearTimeout(timeout);
        timeout = undefined;
      }
      throw fetchError;
    }
  } catch (error) {
    // Clean up timeout if still active
    if (timeout) {
      clearTimeout(timeout);
    }

    // Handle specific error types gracefully
    if (error instanceof Error) {
      // Client disconnected or request was aborted
      if (error.name === 'AbortError' || request.signal?.aborted) {
        // Don't log client disconnections as errors - they're normal
        return new NextResponse(null, { status: 499 }); // Client closed request
      }

      // Handle timeout specifically
      if (error.message?.includes('timeout') || controller?.signal.aborted) {
        console.warn('API request timeout for endpoint:', request.url);
        return NextResponse.json({ error: 'Request timeout' }, { status: 408 });
      }

      // Handle JSON parsing errors
      if (error.message?.includes('JSON') || error.name === 'SyntaxError') {
        console.warn('Invalid JSON in request body');
        return NextResponse.json(
          { error: 'Invalid request format' },
          { status: 400 },
        );
      }
    }

    // Log actual errors (not client disconnections)
    console.error('API proxy error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack:
        process.env.NODE_ENV === 'development' && error instanceof Error
          ? error.stack
          : undefined,
      url: request.url,
    });

    return NextResponse.json(
      { error: 'Failed to proxy API request' },
      { status: 500 },
    );
  }
}
