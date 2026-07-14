import {
  CLEAN_AIR_FORUM_2026_EVENT_ID,
  cleanAirForum2026LeaderboardPath,
  cleanAirForum2026LessonProgressPath,
} from '@/features/clean-air-forum-2026/constants/learn';
import type {
  CleanAirForum2026LeaderboardEntry,
  CleanAirForum2026LeaderboardResponse,
  CleanAirForum2026LessonProgressRequest,
  CleanAirForum2026LessonProgressResponse,
} from '@/features/clean-air-forum-2026/types/learn';
import type { CleanAirForum2026GuestSession } from '@/features/clean-air-forum-2026/types/quiz';

export async function submitCleanAirForum2026LessonCompletion(
  guestSession: CleanAirForum2026GuestSession,
  payload: CleanAirForum2026LessonProgressRequest,
  signal?: AbortSignal,
) {
  const response = await fetch(cleanAirForum2026LessonProgressPath, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Device-Id': guestSession.deviceId,
      ...(guestSession.guestId ? { 'X-Guest-Id': guestSession.guestId } : {}),
    },
    body: JSON.stringify(payload),
    signal,
  });

  if (!response.ok) {
    let errorMessage = `Lesson completion request failed with ${response.status}`;

    try {
      const errorPayload = (await response.json()) as {
        message?: string;
        errors?: string[];
      };

      if (errorPayload.message) {
        errorMessage = errorPayload.message;
      } else if (errorPayload.errors?.length) {
        errorMessage = errorPayload.errors.join(', ');
      }
    } catch {
      // Keep the fallback error message when the body is not JSON.
    }

    throw new Error(errorMessage);
  }

  return (await response.json()) as CleanAirForum2026LessonProgressResponse;
}

function extractLeaderboardEntries(
  payload: CleanAirForum2026LeaderboardResponse,
) {
  return (
    payload.leaderboard ||
    payload.entries ||
    payload.results ||
    payload.data ||
    []
  );
}

function normalizeLeaderboardRank(entry: CleanAirForum2026LeaderboardEntry) {
  return entry.rank ?? entry.position ?? null;
}

function normalizeLeaderboardPoints(entry: CleanAirForum2026LeaderboardEntry) {
  return entry.points ?? entry.total_points ?? 0;
}

export async function fetchCleanAirForum2026Leaderboard(
  signal?: AbortSignal,
  limit?: number,
) {
  const leaderboardUrl = new URL(
    cleanAirForum2026LeaderboardPath,
    window.location.origin,
  );
  if (limit != null) {
    leaderboardUrl.searchParams.set('limit', String(limit));
  }
  leaderboardUrl.searchParams.set('event_id', CLEAN_AIR_FORUM_2026_EVENT_ID);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30_000);

  if (signal) {
    signal.addEventListener('abort', () => controller.abort(signal.reason), {
      once: true,
    });
  }

  try {
    const response = await fetch(leaderboardUrl.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `Leaderboard request failed with ${response.status}`;

      try {
        const errorPayload = (await response.json()) as {
          message?: string;
          errors?: string[];
        };

        if (errorPayload.message) {
          errorMessage = errorPayload.message;
        } else if (errorPayload.errors?.length) {
          errorMessage = errorPayload.errors.join(', ');
        }
      } catch {
        // Keep the fallback error message when the body is not JSON.
      }

      throw new Error(errorMessage);
    }

    const payload =
      (await response.json()) as CleanAirForum2026LeaderboardResponse;
    const entries = extractLeaderboardEntries(payload)
      .map((entry, index) => ({
        ...entry,
        rank: normalizeLeaderboardRank(entry) ?? index + 1,
        points: normalizeLeaderboardPoints(entry),
      }))
      .sort((left, right) => {
        const leftRank =
          normalizeLeaderboardRank(left) ?? Number.MAX_SAFE_INTEGER;
        const rightRank =
          normalizeLeaderboardRank(right) ?? Number.MAX_SAFE_INTEGER;

        return leftRank - rightRank;
      });

    return {
      payload,
      entries,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

export async function fetchCleanAirForum2026LeaderboardPosition(
  guestSession: CleanAirForum2026GuestSession,
  signal?: AbortSignal,
) {
  const leaderboardUrl = new URL(
    cleanAirForum2026LeaderboardPath,
    window.location.origin,
  );
  leaderboardUrl.searchParams.set('limit', '20');
  leaderboardUrl.searchParams.set('event_id', CLEAN_AIR_FORUM_2026_EVENT_ID);

  const response = await fetch(leaderboardUrl.toString(), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'X-Device-Id': guestSession.deviceId,
      ...(guestSession.guestId ? { 'X-Guest-Id': guestSession.guestId } : {}),
    },
    signal,
  });

  if (!response.ok) {
    let errorMessage = `Leaderboard request failed with ${response.status}`;

    try {
      const errorPayload = (await response.json()) as {
        message?: string;
        errors?: string[];
      };

      if (errorPayload.message) {
        errorMessage = errorPayload.message;
      } else if (errorPayload.errors?.length) {
        errorMessage = errorPayload.errors.join(', ');
      }
    } catch {
      // Keep the fallback error message when the body is not JSON.
    }

    throw new Error(errorMessage);
  }

  const payload =
    (await response.json()) as CleanAirForum2026LeaderboardResponse;
  const entries = extractLeaderboardEntries(payload);

  const matchedEntry =
    entries.find((entry) => entry.is_current_user || entry.is_me) ||
    entries.find(
      (entry) =>
        guestSession.guestId && entry.guest_id === guestSession.guestId,
    ) ||
    entries.find(
      (entry) =>
        guestSession.displayName &&
        (entry.display_name === guestSession.displayName ||
          entry.name === guestSession.displayName),
    ) ||
    null;

  const position =
    payload.current_user_rank ??
    payload.my_rank ??
    payload.your_rank ??
    payload.rank ??
    (matchedEntry ? normalizeLeaderboardRank(matchedEntry) : null);

  return {
    payload,
    entries,
    matchedEntry,
    position,
  };
}
