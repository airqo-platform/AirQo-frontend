'use client';

import { useEffect } from 'react';

import Screen from '@/components/clean-air-forum-2026/Screen';
import {
  CLEAN_AIR_FORUM_2026_COURSE_ID,
  CLEAN_AIR_FORUM_2026_LESSON_ID,
} from '@/features/clean-air-forum-2026/constants/learn';
import { useCleanAirForumQuizSetup } from '@/features/clean-air-forum-2026/hooks/useCleanAirForumQuizSetup';

export default function QuizScreen() {
  const quizSetup = useCleanAirForumQuizSetup();

  useEffect(() => {
    if (quizSetup.status !== 'ready' || !quizSetup.lessonPayload) {
      return;
    }

    console.group('[CAF 2026] Quiz setup ready');
    console.info('course_id', CLEAN_AIR_FORUM_2026_COURSE_ID);
    console.info('lesson_id', CLEAN_AIR_FORUM_2026_LESSON_ID);
    console.info('guest_session', quizSetup.guestSession);
    console.info('hydrated_from_cache', quizSetup.hydratedFromCache);
    console.log(quizSetup.lessonPayload);
    console.groupEnd();
  }, [
    quizSetup.guestSession,
    quizSetup.hydratedFromCache,
    quizSetup.lessonPayload,
    quizSetup.status,
  ]);

  useEffect(() => {
    if (quizSetup.status !== 'error' || !quizSetup.errorMessage) {
      return;
    }

    console.error('[CAF 2026] Quiz setup failed', quizSetup.errorMessage);
  }, [quizSetup.errorMessage, quizSetup.status]);

  return <Screen className="caf-2026-screen" />;
}
