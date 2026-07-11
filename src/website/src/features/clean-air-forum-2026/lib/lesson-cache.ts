import { cleanAirForum2026LessonPath } from '@/features/clean-air-forum-2026/constants/learn';
import { CLEAN_AIR_FORUM_2026_LESSON_CACHE_STORAGE_KEY } from '@/features/clean-air-forum-2026/constants/storage';
import type { CleanAirForum2026LessonResponse } from '@/features/clean-air-forum-2026/types/learn';

export function readCachedCleanAirForum2026LessonPayload() {
  const cachedPayload = window.sessionStorage.getItem(
    CLEAN_AIR_FORUM_2026_LESSON_CACHE_STORAGE_KEY,
  );

  if (!cachedPayload) {
    return null;
  }

  try {
    return JSON.parse(cachedPayload) as CleanAirForum2026LessonResponse;
  } catch {
    window.sessionStorage.removeItem(
      CLEAN_AIR_FORUM_2026_LESSON_CACHE_STORAGE_KEY,
    );
    return null;
  }
}

export function cacheCleanAirForum2026LessonPayload(
  payload: CleanAirForum2026LessonResponse,
) {
  window.sessionStorage.setItem(
    CLEAN_AIR_FORUM_2026_LESSON_CACHE_STORAGE_KEY,
    JSON.stringify(payload),
  );
}

export async function fetchCleanAirForum2026LessonPayload(
  signal?: AbortSignal,
) {
  const response = await fetch(cleanAirForum2026LessonPath, {
    method: 'GET',
    signal,
  });

  if (!response.ok) {
    throw new Error(`Lesson request failed with ${response.status}`);
  }

  const payload = (await response.json()) as CleanAirForum2026LessonResponse;
  cacheCleanAirForum2026LessonPayload(payload);
  return payload;
}
