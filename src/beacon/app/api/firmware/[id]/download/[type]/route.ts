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
  { params }: { params: { id: string; type: string } }
) {
  try {
    const { id, type } = params;
    
    const response = await fetch(`${BEACON_API_URL}/firmware/${id}/download/${type}`, {
      method: 'GET',
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    // Get the blob data
    const blob = await response.blob();
    
    // Set appropriate headers for file download
    const headers = new Headers();
    headers.set('Content-Type', response.headers.get('Content-Type') || 'application/octet-stream');
    headers.set('Content-Disposition', response.headers.get('Content-Disposition') || `attachment; filename="${id}_${type}"`);
    
    return new NextResponse(blob, {
      status: 200,
      headers,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to download firmware file', details: error.message },
      { status: 500 }
    );
  }
}
