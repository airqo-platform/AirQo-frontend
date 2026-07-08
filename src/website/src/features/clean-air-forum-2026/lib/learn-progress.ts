import { cleanAirForum2026LessonProgressPath } from '@/features/clean-air-forum-2026/constants/learn';
import type {
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
