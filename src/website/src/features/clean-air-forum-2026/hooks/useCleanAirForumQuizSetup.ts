'use client';

import { useEffect, useState } from 'react';

import { initializeCleanAirForum2026GuestSession } from '@/features/clean-air-forum-2026/lib/guest-session';
import {
  fetchCleanAirForum2026LessonPayload,
  readCachedCleanAirForum2026LessonPayload,
} from '@/features/clean-air-forum-2026/lib/lesson-cache';
import type { CleanAirForum2026QuizSetupState } from '@/features/clean-air-forum-2026/types/quiz';

const initialState: CleanAirForum2026QuizSetupState = {
  status: 'idle',
  guestSession: null,
  lessonPayload: null,
  hydratedFromCache: false,
  errorMessage: null,
};

export function useCleanAirForumQuizSetup() {
  const [state, setState] =
    useState<CleanAirForum2026QuizSetupState>(initialState);

  useEffect(() => {
    const abortController = new AbortController();

    const initialize = async () => {
      setState((currentState) => ({
        ...currentState,
        status: 'loading',
        errorMessage: null,
      }));

      const cachedLessonPayload = readCachedCleanAirForum2026LessonPayload();

      if (cachedLessonPayload) {
        setState((currentState) => ({
          ...currentState,
          lessonPayload: cachedLessonPayload,
          hydratedFromCache: true,
        }));
      }

      try {
        const guestSession = await initializeCleanAirForum2026GuestSession(
          abortController.signal,
        );
        const lessonPayload =
          cachedLessonPayload ||
          (await fetchCleanAirForum2026LessonPayload(abortController.signal));

        setState({
          status: 'ready',
          guestSession,
          lessonPayload,
          hydratedFromCache: Boolean(cachedLessonPayload),
          errorMessage: null,
        });

        if (cachedLessonPayload) {
          void fetchCleanAirForum2026LessonPayload(abortController.signal)
            .then((freshLessonPayload) => {
              if (abortController.signal.aborted) {
                return;
              }

              setState((currentState) => ({
                ...currentState,
                lessonPayload: freshLessonPayload,
              }));
            })
            .catch(() => {
              // Keep cached lesson payload if background refresh fails.
            });
        }
      } catch (error) {
        if (abortController.signal.aborted) {
          return;
        }

        setState((currentState) => ({
          ...currentState,
          status: 'error',
          errorMessage:
            error instanceof Error
              ? error.message
              : 'Unable to initialize quiz setup',
        }));
      }
    };

    void initialize();

    return () => {
      abortController.abort();
    };
  }, []);

  return state;
}
