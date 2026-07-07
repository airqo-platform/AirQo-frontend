import { NextRequest, NextResponse } from 'next/server';

import { CLEAN_AIR_FORUM_CURRENT_EVENT_ID } from '@/configs/cleanAirForumConfig';
import {
  createSubmission,
  listSubmissions,
} from '@/services/cleanAirForumSelfiesStore';

// TEMPORARY mock API — see cleanAirForumSelfiesStore.ts for context. Swap
// this route (or its calls into the store) for the real AirQo backend once
// equivalent endpoints exist there.
export const dynamic = 'force-dynamic';

const MAX_DISPLAY_NAME_LENGTH = 40;

/**
 * List active (non-hidden) submissions for an event, newest first.
 *
 * Query params: `eventId` (defaults to the configured current event).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const eventId =
    searchParams.get('eventId')?.trim() || CLEAN_AIR_FORUM_CURRENT_EVENT_ID;

  const submissions = listSubmissions(eventId);
  return NextResponse.json({ submissions });
}

/**
 * Create a new selfie submission for the conference wall.
 *
 * Body: `{ imageUrl, eventId?, locationName?, pm25Value?, aqiCategory?, displayName? }`
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 },
      );
    }

    const {
      imageUrl,
      eventId,
      locationName,
      pm25Value,
      aqiCategory,
      displayName,
    } = body as Record<string, unknown>;

    if (typeof imageUrl !== 'string' || !imageUrl.trim()) {
      return NextResponse.json(
        { error: 'imageUrl is required' },
        { status: 400 },
      );
    }

    const submission = createSubmission({
      eventId:
        typeof eventId === 'string' && eventId.trim()
          ? eventId.trim()
          : CLEAN_AIR_FORUM_CURRENT_EVENT_ID,
      imageUrl: imageUrl.trim(),
      locationName:
        typeof locationName === 'string' ? locationName.trim() : null,
      pm25Value:
        typeof pm25Value === 'number' && Number.isFinite(pm25Value)
          ? pm25Value
          : null,
      aqiCategory: typeof aqiCategory === 'string' ? aqiCategory.trim() : null,
      displayName:
        typeof displayName === 'string' && displayName.trim()
          ? displayName.trim().slice(0, MAX_DISPLAY_NAME_LENGTH)
          : null,
    });

    return NextResponse.json({ submission }, { status: 201 });
  } catch (error) {
    console.error('Clean Air Forum selfie submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit selfie' },
      { status: 500 },
    );
  }
}
