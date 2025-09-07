import { NextRequest, NextResponse } from 'next/server';

// Ensure this route is always treated as dynamic at runtime
export const dynamic = 'force-dynamic';

/**
 * Geocode endpoint that accepts latitude and longitude coordinates
 * and returns location information using OpenCage API.
 *
 * Query Parameters:
 * - lat: Latitude (-90 to 90)
 * - lng: Longitude (-180 to 180)
 */
export async function GET(request: NextRequest) {
  try {
    // Use NextRequest.nextUrl to avoid reading request.url which triggers
    // dynamic server usage during static build.
    const { searchParams } = request.nextUrl || new URL(request.url);
    const lat = Number(searchParams.get('lat'));
    const lng = Number(searchParams.get('lng'));

    // Validate that lat and lng are valid numbers
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      return NextResponse.json(
        { error: 'lat and lng must be valid numbers' },
        { status: 400 },
      );
    }

    // Validate coordinate bounds
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return NextResponse.json(
        { error: 'lat must be between -90..90 and lng between -180..180' },
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
      `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${apiKey}`,
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
