'use client';

import { motion, type Variants } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

import AmbientBackground from '@/components/clean-air-forum-2026/AmbientBackground';
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

const AIRQO_LOGO_URL = '/assets/images/white-logo.png';
const EVENT_LABEL = 'Africa Clean Air Forum';
const EVENT_LOCATION_AND_YEAR = 'Pretoria 2026';
const USERNAME_PATTERN = /^[A-Za-z0-9._ -]{3,30}$/;

const headerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      delayChildren: 0.1,
      staggerChildren: 0.16,
    },
  },
};

const headerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.78,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

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
    <Screen className="relative overflow-hidden">
      <div
        className="relative h-[100svh] overflow-hidden sm:h-auto sm:min-h-[100svh]"
        style={{
          background:
            'linear-gradient(180deg, #005257 0%, #39BFC7 50%, #FFFFFF 100%)',
        }}
      >
        <AmbientBackground />

        <div className="relative mx-auto flex h-full w-full max-w-[1400px] flex-col px-4 pb-3 pt-4 sm:min-h-[100svh] sm:px-8 sm:pb-12 sm:pt-8 lg:px-12">
          <motion.header
            variants={headerContainerVariants}
            initial="hidden"
            animate="visible"
            className="mx-auto grid w-full max-w-[1200px] flex-none grid-cols-[52px_minmax(0,1fr)] items-center gap-3 sm:grid-cols-[76px_minmax(0,1fr)_190px] sm:gap-6"
          >
            <motion.div
              variants={headerItemVariants}
              className="flex justify-start"
            >
              <Link href="/home" aria-label="Go to the AirQo homepage">
                <Image
                  src={AIRQO_LOGO_URL}
                  alt="AirQo"
                  width={78}
                  height={51}
                  priority
                  unoptimized
                  className="h-auto w-[50px] drop-shadow-[0_10px_24px_rgba(0,0,0,0.18)] sm:w-[72px]"
                />
              </Link>
            </motion.div>

            <div className="min-w-0">
              <motion.h1
                variants={headerItemVariants}
                className="whitespace-nowrap text-left leading-none text-white"
              >
                <span className="text-[23px] font-extrabold tracking-[-0.045em] sm:text-[40px]">
                  Air Quality Quiz
                </span>
              </motion.h1>

              <motion.div
                variants={headerItemVariants}
                className="mt-1 text-[9px] leading-tight text-white/85 sm:hidden"
              >
                <span className="font-bold">{EVENT_LABEL}</span>
                <span aria-hidden="true">•</span>
                <span className="italic">{EVENT_LOCATION_AND_YEAR}</span>
              </motion.div>
            </div>

            <motion.div
              variants={headerItemVariants}
              className="hidden text-left text-white sm:block"
            >
              <p className="text-[13px] font-bold leading-tight">
                {EVENT_LABEL}
              </p>
              <p className="mt-0.5 text-[13px] italic text-white/85">
                {EVENT_LOCATION_AND_YEAR}
              </p>
            </motion.div>
          </motion.header>

          <main className="mx-auto flex min-h-0 w-full max-w-[1200px] flex-1 items-center justify-center pt-2 sm:min-h-[60svh] sm:flex-none sm:pt-10">
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.68,
                ease: [0.22, 1, 0.36, 1],
                delay: 0.3,
              }}
              className="flex w-full max-w-[38rem] flex-col items-center gap-5 text-center"
            >
              <label
                htmlFor="caf-2026-username"
                className="text-sm font-semibold uppercase tracking-[0.24em] text-white/80"
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
                className="w-full rounded-[1.6rem] border border-white/35 bg-white/90 px-6 py-5 text-center text-[clamp(1.1rem,2vw,1.6rem)] font-semibold tracking-[-0.02em] text-[#072b31] shadow-[0_18px_42px_rgba(7,43,49,0.12)] outline-none backdrop-blur-sm placeholder:text-[#0d4f57]/40"
              />

              {errorMessage ? (
                <p
                  id="caf-2026-username-error"
                  role="alert"
                  className="text-sm font-medium text-white/90"
                >
                  {errorMessage}
                </p>
              ) : null}

              <Button
                type="submit"
                className="rounded-[1.4rem] bg-[#072b31] px-7 py-3 text-base font-semibold text-white hover:bg-[#0a3d44] disabled:cursor-not-allowed disabled:opacity-70"
                disabled={submitState === 'submitting'}
              >
                {submitState === 'submitting'
                  ? 'Starting Quiz...'
                  : 'Start Quiz'}
              </Button>
            </motion.form>
          </main>
        </div>
      </div>
    </Screen>
  );
}
