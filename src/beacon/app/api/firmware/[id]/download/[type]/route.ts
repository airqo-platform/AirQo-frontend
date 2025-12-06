import { NextRequest, NextResponse } from 'next/server';

const BEACON_API_URL = process.env.NEXT_PUBLIC_LOCAL_API_URL || 'http://localhost:8000';

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
