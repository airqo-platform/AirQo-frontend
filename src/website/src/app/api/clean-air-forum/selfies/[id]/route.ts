import { NextRequest, NextResponse } from 'next/server';

import { checkSharedSecret } from '@/services/cleanAirForumAuth';
import { hideSubmission } from '@/services/cleanAirForumSelfiesStore';

// TEMPORARY mock API — see cleanAirForumSelfiesStore.ts for context.
export const dynamic = 'force-dynamic';

/**
 * Hide (soft-remove) a submission from the wall. Used by the `/selfies`
 * wall page's double-tap-to-remove gesture.
 *
 * Body: `{ pin: string }` — compared against `CLEAN_AIR_FORUM_WALL_PIN`.
 * If that env var isn't set, the PIN check is skipped outside production
 * (in production a missing PIN fails the request closed instead of leaving
 * moderation wide open — see cleanAirForumAuth.ts).
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request
      .json()
      .catch(() => ({}) as Record<string, unknown>);

    const isAuthorized = checkSharedSecret({
      configuredSecret: process.env.CLEAN_AIR_FORUM_WALL_PIN,
      providedSecret: typeof body?.pin === 'string' ? body.pin : null,
      secretName: 'CLEAN_AIR_FORUM_WALL_PIN',
    });

    if (!isAuthorized) {
      return NextResponse.json({ error: 'Incorrect PIN' }, { status: 401 });
    }

    const submission = hideSubmission(params.id);
    if (!submission) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 },
      );
    }

    return NextResponse.json({ submission });
  } catch (error) {
    console.error('Clean Air Forum selfie hide error:', error);
    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 },
    );
  }
}
