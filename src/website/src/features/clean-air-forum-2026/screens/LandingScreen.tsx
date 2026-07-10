'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

import Screen from '@/components/clean-air-forum-2026/Screen';
import { Button } from '@/components/ui/button';
import {
  CLEAN_AIR_FORUM_2026_EVENT_ID,
  CLEAN_AIR_FORUM_2026_QUIZ_ROUTE,
} from '@/features/clean-air-forum-2026/constants/learn';
import {
  initializeCleanAirForum2026GuestSession,
  resetCleanAirForum2026ParticipantSession,
} from '@/features/clean-air-forum-2026/lib/guest-session';

const USERNAME_PATTERN = /^[A-Za-z0-9._ -]{3,30}$/;

export default function LandingScreen() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [submitState, setSubmitState] = useState<'idle' | 'submitting'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setErrorMessage('Enter a username to continue.');
      return;
    }

    if (!USERNAME_PATTERN.test(trimmedUsername)) {
      setErrorMessage(
        'Use 3 to 30 characters: letters, numbers, spaces, underscores, hyphens, or periods.',
      );
      return;
    }

    setSubmitState('submitting');
    setErrorMessage(null);

    try {
      resetCleanAirForum2026ParticipantSession();

      await initializeCleanAirForum2026GuestSession({
        username: trimmedUsername,
        eventId: CLEAN_AIR_FORUM_2026_EVENT_ID,
      });

      router.push(CLEAN_AIR_FORUM_2026_QUIZ_ROUTE);
    } catch (error) {
      setSubmitState('idle');
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Unable to start this participant session.',
      );
    }
  };

  return (
    <Screen>
      <section className="caf-2026-screen mx-auto flex min-h-screen w-full max-w-[1600px] px-5 py-10 sm:px-8 sm:py-12 md:px-12 lg:px-16 lg:py-16">
        <div className="flex w-full flex-col items-center">
          <div className="flex w-full justify-center">
            <div className="flex w-full max-w-[75.125rem] items-center justify-between gap-4 px-1 sm:px-0">
              <div className="flex min-w-0 items-center gap-3 sm:gap-5">
                <div className="relative w-fit shrink-0">
                  <Image
                    src="/clean-air-forum-2026/logos/airqo-clean-air-forum-pretoria-leaderboard-logo.svg?v=20260710"
                    alt="AirQo"
                    width={91}
                    height={62}
                    priority
                    className="h-auto w-auto"
                  />
                </div>

                <h1 className="min-w-0 flex-1 text-balance text-[clamp(1.1rem,4vw,2.95rem)] font-bold leading-[0.96] tracking-[-0.02em] text-white">
                  Air Quality Quiz
                </h1>
              </div>

              <div className="hidden shrink-0 text-left text-white md:block">
                <p className="text-[18.49px] font-bold leading-none tracking-[-0.02em]">
                  Africa clean air forum
                </p>
                <p className="mt-1 text-[18.49px] font-normal italic leading-none tracking-[-0.02em]">
                  Pretoria 2026
                </p>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-1 items-start justify-center pt-14 sm:pt-16 md:pt-20 lg:pt-24">
            <form
              onSubmit={handleSubmit}
              className="flex w-full max-w-[38rem] flex-col items-center gap-5 text-center"
            >
              <label
                htmlFor="caf-2026-username"
                className="text-sm font-semibold uppercase tracking-[0.24em] text-[#0d4f57]/72"
              >
                Enter username
              </label>

              <input
                id="caf-2026-username"
                name="username"
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Type your username"
                autoComplete="off"
                spellCheck={false}
                maxLength={30}
                aria-invalid={errorMessage ? true : undefined}
                aria-describedby={
                  errorMessage ? 'caf-2026-username-error' : undefined
                }
                className="caf-2026-input w-full rounded-[1.6rem] border border-white/35 px-6 py-5 text-center text-[clamp(1.1rem,2vw,1.6rem)] font-semibold tracking-[-0.02em] shadow-[0_18px_42px_rgba(7,43,49,0.12)] outline-none"
              />

              {errorMessage ? (
                <p
                  id="caf-2026-username-error"
                  role="alert"
                  className="text-sm font-medium text-[#8a1f1f]"
                >
                  {errorMessage}
                </p>
              ) : null}

              <Button
                type="submit"
                className="rounded-[1.4rem] px-7 py-3 text-base font-semibold disabled:cursor-not-allowed disabled:opacity-70"
                disabled={submitState === 'submitting'}
              >
                {submitState === 'submitting'
                  ? 'Starting Quiz...'
                  : 'Start Quiz'}
              </Button>
            </form>
          </div>
        </div>
      </section>
    </Screen>
  );
}
