import { NextRequest, NextResponse } from 'next/server';

import { CLEAN_AIR_FORUM_CURRENT_EVENT_ID } from '@/configs/cleanAirForumConfig';
import { checkSharedSecret } from '@/services/cleanAirForumAuth';
import {
  createSubmission,
  listSubmissions,
} from '@/services/cleanAirForumSelfiesStore';

// TEMPORARY mock API — see cleanAirForumSelfiesStore.ts for context. Swap
// this route (or its calls into the store) for the real AirQo backend once
// equivalent endpoints exist there.
export const dynamic = 'force-dynamic';

const MAX_DISPLAY_NAME_LENGTH = 40;

// Images are uploaded straight from the mobile app to this Cloudinary
// folder (see clean_air_forum_submission_service.dart) — rejecting
// anything else means a leaked/guessed endpoint can't be used to push
// arbitrary images onto the public wall display.
const ALLOWED_IMAGE_HOST = 'res.cloudinary.com';
const ALLOWED_IMAGE_PATH_SEGMENT = '/clean_air_forum_selfies/';

function isTrustedImageUrl(imageUrl: string): boolean {
  try {
    const url = new URL(imageUrl);
    return (
      url.protocol === 'https:' &&
      url.hostname === ALLOWED_IMAGE_HOST &&
      url.pathname.includes(ALLOWED_IMAGE_PATH_SEGMENT)
    );
  } catch {
    return false;
  }
}

/**
 * Requires a shared secret on submissions so the wall can only be
 * populated by the AirQo mobile app, not by anyone who finds this
 * endpoint. Skipped if the secret isn't configured outside production.
 */
function isAuthorizedSubmission(request: NextRequest): boolean {
  return checkSharedSecret({
    configuredSecret: process.env.CLEAN_AIR_FORUM_SUBMISSION_SECRET,
    providedSecret: request.headers.get('x-clean-air-forum-secret'),
    secretName: 'CLEAN_AIR_FORUM_SUBMISSION_SECRET',
  });
}

// Best-effort per-IP rate limit — in-memory like the submissions store, so
// it only holds within a single warm server instance, not across replicas.
// Good enough to blunt casual spam/abuse before staff can react; a proper
// distributed limiter belongs on the real backend (see docs/clean-air-forum-followups.md).
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_SUBMISSIONS = 5;

const globalForRateLimit = globalThis as unknown as {
  __cleanAirForumSubmissionTimestamps__?: Map<string, number[]>;
};
const submissionTimestampsByIp: Map<string, number[]> =
  globalForRateLimit.__cleanAirForumSubmissionTimestamps__ ?? new Map();
globalForRateLimit.__cleanAirForumSubmissionTimestamps__ =
  submissionTimestampsByIp;

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  return request.headers.get('x-real-ip') || 'unknown';
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (submissionTimestampsByIp.get(ip) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  );
  recent.push(now);
  submissionTimestampsByIp.set(ip, recent);
  return recent.length > RATE_LIMIT_MAX_SUBMISSIONS;
}

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
    if (!isAuthorizedSubmission(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (isRateLimited(getClientIp(request))) {
      return NextResponse.json(
        { error: 'Too many submissions — please slow down.' },
        { status: 429 },
      );
    }

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

    if (!isTrustedImageUrl(imageUrl.trim())) {
      return NextResponse.json(
        { error: 'imageUrl is not from a trusted source' },
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
