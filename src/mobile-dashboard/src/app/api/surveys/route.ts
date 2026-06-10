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

// GET /api/surveys
export async function GET(request: NextRequest) {
  try {
    const authToken = request.headers.get('authorization');
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const response = await fetch(`${API_BASE_URL}/api/v2/users/surveys`, {
      headers: getHeaders(authToken),
    });

    if (process.env.NODE_ENV !== 'production') {
      console.debug('AirQo GET /surveys status:', response.status);
    }

    if (!response.ok) {
      const errorText = await response.text();

      // If 404, the user might not have any surveys yet, return empty array
      if (response.status === 404) {
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

    // AirQO API returns { success: true, surveys: [...] }
    if (data.success && data.surveys) {
      // Transform surveys to use 'id' instead of '_id' for consistency
      const transformedSurveys = data.surveys.map((survey: Record<string, unknown>) => ({
        ...survey,
        id: survey._id,
        questions: (survey.questions as Record<string, unknown>[])?.map((question: Record<string, unknown>) => ({
          ...question,
          id: question.id || question._id
        })) || []
      }));
      return NextResponse.json(transformedSurveys);
    } else if (data.success && Array.isArray(data.surveys) && data.surveys.length === 0) {
      // User has no surveys yet
      return NextResponse.json([]);
    } else {
      return NextResponse.json(
        { error: 'Invalid response format from AirQO API' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error fetching surveys:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to fetch surveys' },
      { status: 500 }
    );
  }
}

// POST /api/surveys
export async function POST(request: NextRequest) {
  try {
    const authToken = request.headers.get('authorization');
    
    if (!authToken) {
      return NextResponse.json(
        { error: 'Authorization token required' },
        { status: 401 }
      );
    }

    const survey = await request.json() as Record<string, unknown>;

    const mapQuestionType = (type: unknown): string => {
      if (typeof type !== 'string') return 'text';
      const normalized = type.toLowerCase();
      if (normalized === 'rating') return 'rating';
      if (normalized === 'boolean') return 'multipleChoice';
      if (normalized === 'multiple-choice' || normalized === 'single-choice') return 'multipleChoice';
      return 'text';
    };

    const coerceQuestionText = (question: Record<string, unknown>): string => {
      const raw = typeof question.question === 'string' && question.question.trim().length > 0
        ? question.question
        : typeof question.text === 'string'
        ? question.text
        : '';
      return raw.trim();
    };

    const coerceRequired = (question: Record<string, unknown>): boolean => {
      if (typeof question.isRequired === 'boolean') return question.isRequired;
      if (typeof question.required === 'boolean') return question.required;
      return false;
    };

    const coerceOptions = (question: Record<string, unknown>): string[] => {
      if (!Array.isArray(question.options)) return [];
      return question.options
        .map((option) => (typeof option === 'string' ? option.trim() : ''))
        .filter((option) => option.length > 0);
    };

    const transformedSurvey = {
      title: survey.title,
      description: survey.description,
      questions: Array.isArray(survey.questions)
        ? (survey.questions as Record<string, unknown>[]).map((q: Record<string, unknown>) => {
            const airQoQuestion: Record<string, unknown> = {
              id: q.id,
              question: coerceQuestionText(q),
              type: mapQuestionType(q.type),
              options: coerceOptions(q),
              isRequired: coerceRequired(q),
            };

            if (airQoQuestion.type === 'rating') {
              airQoQuestion.minValue = 1;
              airQoQuestion.maxValue = 5;
            }

            // Yes/No questions: ensure "Yes" and "No" options are present
            if (typeof q.type === 'string' && q.type.toLowerCase() === 'boolean') {
              airQoQuestion.options = ['Yes', 'No'];
            }

            return airQoQuestion;
          })
        : [],
      trigger: {
        type: 'manual',
        conditions: {}
      },
      timeToComplete: 300, // Required field - 5 minutes default
      isActive: survey.isActive,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now
    };

    const response = await fetch(`${API_BASE_URL}/api/v2/users/surveys`, {
      method: 'POST',
      headers: getHeaders(authToken),
      body: JSON.stringify(transformedSurvey),
    });

    if (process.env.NODE_ENV !== 'production') {
      console.debug('AirQo POST /surveys status:', response.status);
    }

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Failed to create survey: ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();

    // AirQO API returns { success: true, created_survey: {...} }
    if (data.success && data.created_survey) {
      const createdSurvey = {
        ...data.created_survey,
        id: data.created_survey._id || data.created_survey.id,
        questions: (data.created_survey.questions as Record<string, unknown>[])?.map((question: Record<string, unknown>) => ({
          ...question,
          id: question.id || question._id
        })) || []
      };
      return NextResponse.json(createdSurvey);
    } else {
      return NextResponse.json(
        { error: 'Invalid response format from AirQO API' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error creating survey:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to create survey' },
      { status: 500 }
    );
  }
}