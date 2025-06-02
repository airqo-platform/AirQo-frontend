import axios from 'axios';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Use server-side environment variable (no NEXT_PUBLIC_ prefix needed)
    const SLACK_WEBHOOK_URL = process.env.NEXT_PUBLIC_SLACK_WEBHOOK_URL;

    if (!SLACK_WEBHOOK_URL) {
      return NextResponse.json(
        {
          success: false,
          error: 'Slack webhook URL not configured',
        },
        { status: 500 },
      );
    }

    const body = await request.json();

    // Simply forward the payload from the logger to Slack
    // All formatting is now handled by the logger
    await axios.post(SLACK_WEBHOOK_URL, body);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending to Slack:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Unknown error occurred',
      },
      { status: 500 },
    );
  }
}
