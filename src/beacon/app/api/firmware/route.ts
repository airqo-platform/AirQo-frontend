import { NextRequest, NextResponse } from 'next/server';
import { enforceHttpsForRemote } from '@/lib/config';

const getBeaconApiUrl = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (isDevelopment && process.env.NEXT_PUBLIC_LOCAL_API_URL) {
    return enforceHttpsForRemote(process.env.NEXT_PUBLIC_LOCAL_API_URL);
  }

  const candidates = [
    process.env.BEACON_API_URL,
    process.env.AIRQO_API_BASE_URL,
    process.env.AIRQO_STAGING_API_BASE_URL,
    process.env.NEXT_PUBLIC_BEACON_API_URL,
    process.env.NEXT_PUBLIC_AIRQO_API_BASE_URL,
    process.env.NEXT_PUBLIC_AIRQO_STAGING_API_BASE_URL,
  ];

  for (const candidate of candidates) {
    if (candidate) return enforceHttpsForRemote(candidate);
  }

  return 'http://localhost:8000';
};

const BEACON_API_URL = getBeaconApiUrl();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const queryPart = queryString ? `?${queryString}` : '';
    const url = `${BEACON_API_URL}/firmware${queryPart}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Firmware fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch firmware versions', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const uploadUrl = `${BEACON_API_URL}/firmware/upload`;
    
    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Firmware upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload firmware', details: error.message },
      { status: 500 }
    );
  }
}
