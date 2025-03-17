import { NextRequest, NextResponse } from 'next/server';

import { removeTrailingSlash } from '@/utils';

const API_BASE_URL = `${removeTrailingSlash(process.env.NEXT_PUBLIC_API_URL || '')}/api/v2`;
const API_TOKEN = process.env.NEXT_PUBLIC_API_TOKEN || '';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const endpoint = searchParams.get('endpoint');

  if (!endpoint) {
    return NextResponse.json(
      { error: 'Endpoint is required' },
      { status: 400 },
    );
  }

  try {
    // Create the external API URL with proper URL construction
    const apiUrl = new URL(`${API_BASE_URL}/${endpoint}`);
    apiUrl.searchParams.append('token', API_TOKEN);

    // Make the request to the external API
    const apiResponse = await fetch(apiUrl.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!apiResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch external API' },
        { status: apiResponse.status },
      );
    }

    const data = await apiResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching external API:', error);
    return NextResponse.json(
      { error: 'Error fetching external API' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Extract the endpoint from the request, but don't send it to the external API
    const { endpoint, ...body } = await request.json();

    // Log to check what the remaining body looks like
    console.log('Received body (without endpoint):', body);

    // Check if the endpoint exists
    if (!endpoint) {
      console.error('Endpoint not provided');
      return NextResponse.json(
        { error: 'Endpoint is required' },
        { status: 400 },
      );
    }

    // Construct the API URL with the token as a query parameter
    const apiUrl = `${API_BASE_URL}/${endpoint}?token=${API_TOKEN}`;

    // Log the URL you're about to make the request to
    console.log('API URL:', apiUrl);

    // Make the POST request to the external API, without the endpoint field
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body), // Send only the relevant fields (e.g., email, firstName, lastName)
    });

    // Check if the response is successful
    if (!apiResponse.ok) {
      console.error(
        `Failed to post to external API: ${apiResponse.statusText}`,
      );
      return NextResponse.json(
        { error: 'Failed to post to external API' },
        { status: apiResponse.status },
      );
    }

    // Parse and return the successful response
    const data = await apiResponse.json();
    console.log('Response from external API:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error posting to external API:', error);
    return NextResponse.json(
      { error: 'Error posting to external API' },
      { status: 500 },
    );
  }
}
