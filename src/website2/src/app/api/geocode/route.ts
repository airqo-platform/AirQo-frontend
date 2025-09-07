import { NextRequest, NextResponse } from 'next/server';

// Ensure this route is always treated as dynamic at runtime
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Use NextRequest.nextUrl to avoid reading request.url which triggers
    // dynamic server usage during static build.
    const { searchParams } = request.nextUrl || new URL(request.url);
    const latitude = searchParams.get('lat');
    const longitude = searchParams.get('lng');

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 },
      );
    }

    const apiKey = process.env.OPENCAGE_API_KEY;
    if (!apiKey) {
      console.error('OPENCAGE_API_KEY is not configured');
      return NextResponse.json(
        { error: 'Geocoding service not available' },
        { status: 500 },
      );
    }

    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${apiKey}`,
      {
        headers: {
          'User-Agent': 'AirQo-Website/1.0',
        },
      },
    );

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Geocoding API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch location data' },
      { status: 500 },
    );
  }
}
