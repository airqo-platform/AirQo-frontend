'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

import Button from '@/components/clean-air-forum-2026/Button';
import Screen from '@/components/clean-air-forum-2026/Screen';
import { CLEAN_AIR_FORUM_2026_QUIZ_ROUTE } from '@/features/clean-air-forum-2026/constants/learn';
import {
  CLEAN_AIR_FORUM_2026_AUTH_TOKEN_STORAGE_KEY,
  CLEAN_AIR_FORUM_2026_SUBMISSION_RESULT_STORAGE_KEY,
} from '@/features/clean-air-forum-2026/constants/storage';
import { getStoredCleanAirForum2026GuestSession } from '@/features/clean-air-forum-2026/lib/guest-session';
import { linkCleanAirForum2026ProgressToAccount } from '@/features/clean-air-forum-2026/lib/learn-progress';
import {
  consumeOAuthTokenHandoffFromUrl,
  normalizeOAuthAccessToken,
} from '@/features/clean-air-forum-2026/lib/oauth';
import type {
  CleanAirForum2026LessonProgressResponse,
  CleanAirForum2026ProgressLinkResponse,
} from '@/features/clean-air-forum-2026/types/learn';

type ResultsState =
  | { status: 'loading'; message: string }
  | { status: 'error'; message: string }
  | {
      status: 'ready';
      submissionResult: CleanAirForum2026LessonProgressResponse | null;
      linkResult: CleanAirForum2026ProgressLinkResponse;
    };

function readStoredSubmissionResult() {
  const storedValue = window.sessionStorage.getItem(
    CLEAN_AIR_FORUM_2026_SUBMISSION_RESULT_STORAGE_KEY,
  );

  if (!storedValue) {
    return null;
  }

  try {
    return JSON.parse(storedValue) as CleanAirForum2026LessonProgressResponse;
  } catch {
    window.sessionStorage.removeItem(
      CLEAN_AIR_FORUM_2026_SUBMISSION_RESULT_STORAGE_KEY,
    );
    return null;
  }
}

function readStoredAuthToken() {
  const storedToken = window.sessionStorage.getItem(
    CLEAN_AIR_FORUM_2026_AUTH_TOKEN_STORAGE_KEY,
  );

  return storedToken ? normalizeOAuthAccessToken(storedToken) : '';
}

export default function ResultsScreen() {
  const [resultsState, setResultsState] = useState<ResultsState>({
    status: 'loading',
    message: 'Connecting your quiz to your Google account...',
  });

  useEffect(() => {
    const controller = new AbortController();

    async function revealResults() {
      const oauthTokenHandoff = consumeOAuthTokenHandoffFromUrl();
      const normalizedToken = oauthTokenHandoff?.token || readStoredAuthToken();

      if (!normalizedToken) {
        setResultsState({
          status: 'error',
          message:
            'No Google sign-in session was returned. Please sign in again from the quiz screen.',
        });
        return;
      }

      window.sessionStorage.setItem(
        CLEAN_AIR_FORUM_2026_AUTH_TOKEN_STORAGE_KEY,
        normalizedToken,
      );

      const guestSession = getStoredCleanAirForum2026GuestSession();
      if (!guestSession?.deviceId || !guestSession.guestId) {
        setResultsState({
          status: 'error',
          message:
            'Guest quiz session was not found on this browser. Please retake the quiz on this device.',
        });
        return;
      }

      const submissionResult = readStoredSubmissionResult();

      try {
        const linkResult = await linkCleanAirForum2026ProgressToAccount(
          guestSession,
          normalizedToken,
          controller.signal,
        );

        console.group('[CAF 2026] Quiz results revealed');
        console.info('guest_session', guestSession);
        console.info('submission_result', submissionResult);
        console.info('progress_link_response', linkResult);
        console.groupEnd();

        setResultsState({
          status: 'ready',
          submissionResult,
          linkResult,
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Unable to link your guest progress.';

        console.error('[CAF 2026] Progress link failed', message);
        setResultsState({
          status: 'error',
          message,
        });
      }
    }

    void revealResults();

    return () => {
      controller.abort();
    };
  }, []);

  return (
    <Screen className="caf-2026-screen">
      <section className="mx-auto flex min-h-screen w-full max-w-[1600px] px-5 py-10 sm:px-8 sm:py-12 md:px-12 lg:px-16 lg:py-16">
        <div className="flex w-full flex-col items-center">
          <div className="relative w-[min(84vw,34rem)] sm:w-[min(62vw,34rem)] md:w-[min(46vw,34rem)] lg:w-[30rem] xl:w-[34.125rem]">
            <Image
              src="/clean-air-forum-2026/logos/airqo-clean-air-forum-pretoria-2026-logo.svg"
              alt="Africa CLEAN Air Forum Pretoria 2026"
              width={546}
              height={94}
              priority
              className="h-auto w-full"
            />
          </div>

          <div className="mt-16 flex w-full max-w-4xl flex-col items-center gap-8 text-center sm:mt-20 sm:gap-10">
            {resultsState.status === 'loading' ? (
              <>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#0d4f57]/72">
                  Linking progress
                </p>
                <h1 className="text-balance text-[clamp(1.9rem,4vw,4rem)] font-bold leading-[0.98] tracking-[-0.04em] text-[#072b31]">
                  {resultsState.message}
                </h1>
              </>
            ) : null}

            {resultsState.status === 'error' ? (
              <>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#8a1f1f]">
                  Sign-in incomplete
                </p>
                <h1 className="text-balance text-[clamp(1.7rem,3.6vw,3.2rem)] font-bold leading-[1.02] tracking-[-0.04em] text-[#072b31]">
                  {resultsState.message}
                </h1>
                <Button
                  className="rounded-[1.4rem] px-7 py-3 text-base font-semibold"
                  onClick={() => {
                    window.location.href = CLEAN_AIR_FORUM_2026_QUIZ_ROUTE;
                  }}
                >
                  Back to quiz
                </Button>
              </>
            ) : null}

            {resultsState.status === 'ready' ? (
              <>
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#0d4f57]/72">
                  Results revealed
                </p>
                <div className="space-y-4">
                  <h1 className="text-balance text-[clamp(2.1rem,4.5vw,4.4rem)] font-bold leading-[0.98] tracking-[-0.04em] text-[#072b31]">
                    {resultsState.submissionResult?.points_earned ?? 0} points
                  </h1>
                  <p className="text-[clamp(1.05rem,2vw,1.45rem)] font-medium leading-[1.3] text-[#0d4f57]">
                    Stage:{' '}
                    {resultsState.submissionResult?.current_stage.name ??
                      'Unlocked'}
                  </p>
                  <p className="text-[clamp(1rem,1.8vw,1.25rem)] leading-[1.35] text-[#0d4f57]">
                    Your guest quiz progress has been linked successfully.{' '}
                    {resultsState.linkResult.merged.points_transferred} total
                    points were transferred into your signed-in profile.
                  </p>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </section>
    </Screen>
  );
}
