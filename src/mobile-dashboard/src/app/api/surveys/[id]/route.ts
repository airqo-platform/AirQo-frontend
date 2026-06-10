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

// GET /api/surveys/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authToken = request.headers.get('authorization');
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    console.log('Making request to AirQo API:', `${API_BASE_URL}/api/v2/users/surveys/${id}`);
    const response = await fetch(`${API_BASE_URL}/api/v2/users/surveys/${id}`, {
      headers: getHeaders(authToken),
    });

    console.log('AirQo API response status:', response.status);
    console.log('AirQo API response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.log('AirQo API error response:', errorText);
      return NextResponse.json(
        { error: `Failed to fetch survey: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('AirQo API response data:', data);
    
    // AirQO API returns { success: true, surveys: [survey] } for individual survey
    if (data.success && data.surveys && data.surveys[0]) {
      // Transform survey to use 'id' instead of '_id' for consistency
      const transformedSurvey = {
        ...data.surveys[0],
        id: data.surveys[0]._id,
        questions: (data.surveys[0].questions as Record<string, unknown>[])?.map((question: Record<string, unknown>) => ({
          ...question,
          id: question.id || question._id
        })) || []
      };
      return NextResponse.json(transformedSurvey);
    } else {
      console.log('Unexpected AirQo API response format:', data);
      return NextResponse.json(
        { error: 'Invalid response format from AirQO API' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error fetching survey:', error);
    return NextResponse.json(
      { error: 'Failed to fetch survey' },
      { status: 500 }
    );
  }
}

// PUT /api/surveys/[id]
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authToken = request.headers.get('authorization');
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const survey = await request.json();

    console.log('Making PUT request to AirQo API:', `${API_BASE_URL}/api/v2/users/surveys/${id}`);
    console.log('Survey data:', JSON.stringify(survey, null, 2));

    const response = await fetch(`${API_BASE_URL}/api/v2/users/surveys/${id}`, {
      method: 'PUT',
      headers: getHeaders(authToken),
      body: JSON.stringify(survey),
    });

    console.log('AirQo API PUT response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('AirQo API PUT error response:', errorText);
      return NextResponse.json(
        { error: `Failed to update survey: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('AirQo API PUT response data:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error updating survey:', error);
    return NextResponse.json(
      { error: 'Failed to update survey' },
      { status: 500 }
    );
  }
}

// DELETE /api/surveys/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authToken = request.headers.get('authorization');
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const response = await fetch(`${API_BASE_URL}/api/v2/users/surveys/${id}`, {
      method: 'DELETE',
      headers: getHeaders(authToken),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to delete survey: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting survey:', error);
    return NextResponse.json(
      { error: 'Failed to delete survey' },
      { status: 500 }
    );
  }
}