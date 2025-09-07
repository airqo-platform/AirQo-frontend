import { NextRequest, NextResponse } from 'next/server';

// Ensure this route is always treated as dynamic at runtime
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    const apiUrl = process.env.API_URL;
    const apiToken = process.env.API_TOKEN;

    if (!apiUrl) {
      console.error('API_URL is not configured');
      return NextResponse.json(
        { error: 'API service not available' },
        { status: 500 },
      );
    }

    // Use server-side token if client doesn't provide one
    const finalToken = token || apiToken || '';

    const url = `${apiUrl}/api/v2/devices/grids/summary${
      finalToken ? `?token=${finalToken}` : ''
    }`;

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, method = 'POST', data } = body;

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

    // Add token to query params if available
    if (apiToken) {
      const separator = endpoint.includes('?') ? '&' : '?';
      url += `${separator}token=${apiToken}`;
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'AirQo-Website/1.0',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.statusText}`);
    }

    const responseData = await response.json();
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('API proxy error:', error);
    return NextResponse.json(
      { error: 'Failed to proxy API request' },
      { status: 500 },
    );
  }
}
