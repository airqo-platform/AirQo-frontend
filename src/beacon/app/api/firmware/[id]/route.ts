import { NextRequest, NextResponse } from 'next/server';

// Use centralized environment variable with fallbacks
const getBeaconApiUrl = () => {
  return process.env.NEXT_PUBLIC_LOCAL_API_URL || 
         process.env.BEACON_API_URL ||
         'http://localhost:8000';
};

const BEACON_API_URL = getBeaconApiUrl();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
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
