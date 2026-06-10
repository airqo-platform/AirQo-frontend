import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.NEXT_PUBLIC_AIRQO_API_BASE_URL || 'https://api.airqo.net';

function getHeaders(authToken?: string): HeadersInit {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (authToken) {
    headers['Authorization'] = authToken;
  }
  
  return headers;
}

// GET /api/responses
export async function GET(request: NextRequest) {
  try {
    const authToken = request.headers.get('authorization');
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    console.log('Making request to AirQo API:', `${API_BASE_URL}/api/v2/users/surveys/responses`);
    const response = await fetch(`${API_BASE_URL}/api/v2/users/surveys/responses`, {
      headers: getHeaders(authToken),
    });

    console.log('AirQo API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('AirQo API error response:', errorText);
      
      // If 404, the user might not have any responses yet, return empty array
      if (response.status === 404) {
        console.log('No responses found for user, returning empty array');
        return NextResponse.json([]);
      }
      
      return NextResponse.json(
        { 
          error: `AirQO API Error: ${response.status} ${response.statusText}`,
          details: errorText
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('AirQo API response data:', data);
    
    // AirQO API returns { success: true, responses: [...] }
    // Pass through ALL fields including answers, isGuest, timeToComplete, status
    if (data.success && Array.isArray(data.responses)) {
      return NextResponse.json(data.responses);
    } else if (data.success && !data.responses) {
      // User has no responses yet
      return NextResponse.json([]);
    } else {
      console.log('Unexpected AirQo API response format:', data);
      return NextResponse.json(
        { error: 'Invalid response format from AirQO API' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error fetching responses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch responses' },
      { status: 500 }
    );
  }
}
