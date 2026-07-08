'use client';

import { useEffect } from 'react';

import Screen from '@/components/clean-air-forum-2026/Screen';
import {
  CLEAN_AIR_FORUM_2026_COURSE_ID,
  CLEAN_AIR_FORUM_2026_LESSON_ID,
  cleanAirForum2026LessonPath,
} from '@/features/clean-air-forum-2026/constants/learn';

declare global {
  interface Window {
    __CAF_2026_LESSON_PAYLOAD__?: unknown;
  }
}

export default function QuizScreen() {
  useEffect(() => {
    const abortController = new AbortController();

    const fetchLesson = async () => {
      try {
        const response = await fetch(cleanAirForum2026LessonPath, {
          method: 'GET',
          signal: abortController.signal,
        });

        if (!response.ok) {
          console.error(
            `[CAF 2026] Lesson request failed with ${response.status}`,
          );
          return;
        }

        const payload = await response.json();

        window.__CAF_2026_LESSON_PAYLOAD__ = payload;

        console.group('[CAF 2026] Quiz lesson payload fetched');
        console.info('course_id', CLEAN_AIR_FORUM_2026_COURSE_ID);
        console.info('lesson_id', CLEAN_AIR_FORUM_2026_LESSON_ID);
        console.info('token_source', 'api_token_proxy');
        console.log(payload);
        console.groupEnd();
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }

        console.error('[CAF 2026] Failed to fetch lesson payload', error);
      }
    };

    void fetchLesson();

    return () => {
      abortController.abort();
    };
  }, []);

  return <Screen className="caf-2026-screen" />;
}
