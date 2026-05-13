import { NextRequest, NextResponse } from 'next/server';

const enforceHttpsForRemote = (url: string): string => {
  const normalizedUrl = url.replace(/\/$/, '');

  try {
    const parsed = new URL(normalizedUrl);
    const host = parsed.hostname;
    const isPrivateNetworkHost =
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host);

    if (parsed.protocol === 'http:' && !isPrivateNetworkHost) {
      parsed.protocol = 'https:';
      return parsed.toString().replace(/\/$/, '');
    }

    return normalizedUrl;
  } catch {
    if (
      normalizedUrl.startsWith('http://') &&
      !normalizedUrl.includes('localhost') &&
      !normalizedUrl.includes('127.0.0.1') &&
      !normalizedUrl.includes('192.168.') &&
      !normalizedUrl.includes('10.')
    ) {
      return normalizedUrl.replace('http://', 'https://');
    }

    return normalizedUrl;
  }
};

const getBeaconApiUrl = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  if (isDevelopment && process.env.NEXT_PUBLIC_LOCAL_API_URL) {
    return enforceHttpsForRemote(process.env.NEXT_PUBLIC_LOCAL_API_URL);
  }

  const candidates = [
    process.env.BEACON_API_URL,
    process.env.AIRQO_STAGING_API_BASE_URL,
    process.env.AIRQO_API_BASE_URL,
    process.env.NEXT_PUBLIC_BEACON_API_URL,
    process.env.NEXT_PUBLIC_AIRQO_STAGING_API_BASE_URL,
    process.env.NEXT_PUBLIC_AIRQO_API_BASE_URL,
  ];

  for (const candidate of candidates) {
    if (candidate) return enforceHttpsForRemote(candidate);
  }

  return 'http://localhost:8000';
};

const BEACON_API_URL = getBeaconApiUrl();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const url = `${BEACON_API_URL}/firmware/${id}`;
    
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
      { error: 'Failed to fetch firmware details', details: error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const url = `${BEACON_API_URL}/firmware/${id}`;
    
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: any) {
    console.error('Firmware update error:', error);
    return NextResponse.json(
      { error: 'Failed to update firmware', details: error.message },
      { status: 500 }
    );
  }
}
