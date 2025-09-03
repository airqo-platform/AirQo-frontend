import { NextRequest, NextResponse } from 'next/server';

import { removeTrailingSlash } from '@/utils';

const RAW_API_URL = removeTrailingSlash(
  process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || '',
);
const API_BASE_URL = RAW_API_URL ? `${RAW_API_URL}/api/v2` : '';
// Use a server-only environment variable for the API token so it is not exposed to the client
const API_TOKEN =
  process.env.API_TOKEN || process.env.NEXT_PUBLIC_API_TOKEN || '';

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
    // Guard against misconfiguration: ensure API_BASE_URL is an absolute URL
    if (!API_BASE_URL || !/^https?:\/\//.test(API_BASE_URL)) {
      return NextResponse.json(
        { error: 'Server misconfiguration: API_URL must be an absolute URL' },
        { status: 500 },
      );
    }
    // Create the external API URL and append the server-side token
    const apiUrl = new URL(`${API_BASE_URL}/${endpoint}`);
    apiUrl.searchParams.append('token', API_TOKEN);

    // Make the request to the external API from the server (token stays server-side)
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
    // Guard against misconfiguration: ensure API_BASE_URL is an absolute URL
    if (!API_BASE_URL || !/^https?:\/\//.test(API_BASE_URL)) {
      return NextResponse.json(
        { error: 'Server misconfiguration: API_URL must be an absolute URL' },
        { status: 500 },
      );
    }
    // Extract the endpoint from the request, but don't send it to the external API
    const { endpoint, ...body } = await request.json();

    // Validate endpoint
    if (!endpoint) {
      return NextResponse.json(
        { error: 'Endpoint is required' },
        { status: 400 },
      );
    }

    // Construct the API URL with the token as a query parameter (server-side only)
    const apiUrl = `${API_BASE_URL}/${endpoint}?token=${API_TOKEN}`;

    // Make the POST request to the external API from the server
    const apiResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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
