import { NextRequest, NextResponse } from 'next/server';

const WAQI_BASE_URL = 'https://api.waqi.info';
const WAQI_TOKEN = process.env.WAQI_TOKEN;

if (!WAQI_TOKEN) {
  throw new Error('WAQI_TOKEN environment variable is not set');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');

  if (!endpoint) {
    return NextResponse.json(
      { error: 'Endpoint parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Build the WAQI API URL
    const sanitizedEndpoint = endpoint.startsWith('/')
      ? endpoint
      : `/${endpoint}`;
    const waqiUrl = new URL(sanitizedEndpoint, WAQI_BASE_URL);
    for (const [key, value] of Array.from(searchParams.entries())) {
      if (key !== 'endpoint') {
        waqiUrl.searchParams.set(key, value);
      }
    }
    waqiUrl.searchParams.set('token', WAQI_TOKEN!);

    const response = await fetch(waqiUrl.toString(), {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'AirQo/1.0',
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch from WAQI API' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('WAQI API proxy error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
