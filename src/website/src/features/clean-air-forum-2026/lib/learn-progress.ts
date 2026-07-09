import {
  cleanAirForum2026LessonProgressPath,
  cleanAirForum2026ProgressLinkPath,
} from '@/features/clean-air-forum-2026/constants/learn';
import type {
  CleanAirForum2026LessonProgressRequest,
  CleanAirForum2026LessonProgressResponse,
  CleanAirForum2026ProgressLinkResponse,
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

export async function linkCleanAirForum2026ProgressToAccount(
  guestSession: CleanAirForum2026GuestSession,
  authToken: string,
  signal?: AbortSignal,
) {
  const response = await fetch(cleanAirForum2026ProgressLinkPath, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `JWT ${authToken}`,
    },
    body: JSON.stringify({
      device_id: guestSession.deviceId,
      guest_id: guestSession.guestId,
    }),
    signal,
  });

  if (!response.ok) {
    let errorMessage = `Progress link request failed with ${response.status}`;

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

  return (await response.json()) as CleanAirForum2026ProgressLinkResponse;
}
