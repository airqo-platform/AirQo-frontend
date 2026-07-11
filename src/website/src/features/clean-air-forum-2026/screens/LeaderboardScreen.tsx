'use client';

import {
  AnimatePresence,
  motion,
  type PanInfo,
  type Variants,
} from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import AmbientBackground from '@/components/clean-air-forum-2026/AmbientBackground';
import LeaderboardRow from '@/components/clean-air-forum-2026/LeaderboardRow';
import LeaderboardToggles from '@/components/clean-air-forum-2026/LeaderboardToggles';
import { fetchCleanAirForum2026Leaderboard } from '@/features/clean-air-forum-2026/lib/learn-progress';
import type { CleanAirForum2026LeaderboardEntry } from '@/features/clean-air-forum-2026/types/learn';
import { usePollingWithVisibility } from '@/hooks/usePollingWithVisibility';

const AIRQO_LOGO_URL = '/assets/images/white-logo.png';
const EVENT_LABEL = 'Africa Clean Air Forum';
const EVENT_LOCATION_AND_YEAR = 'Pretoria 2026';
const LEADERBOARD_TITLE = 'Air Quality Quiz Leaderboard';
const ROWS_PER_SLIDE = 10;
const API_LIMIT = 100;
const CAROUSEL_INTERVAL_MS = 7600;
const POLL_INTERVAL_MS = 30_000;
const SWIPE_DISTANCE_THRESHOLD = 70;
const SWIPE_VELOCITY_THRESHOLD = 500;

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
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.78, ease: [0.22, 1, 0.36, 1] },
  },
};

const slideVariants: Variants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 120 : -120,
    opacity: 0,
    scale: 0.96,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.74,
      ease: [0.22, 1, 0.36, 1],
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -100 : 100,
    opacity: 0,
    scale: 0.972,
    transition: {
      duration: 0.46,
      ease: [0.4, 0, 1, 1],
      staggerChildren: 0.035,
      staggerDirection: -1,
    },
  }),
};

const rowVariants: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: { duration: 0.28, ease: [0.4, 0, 1, 1] },
  },
};

function formatPoints(points: number | undefined) {
  return `${(points ?? 0).toLocaleString()}pts`;
}

function formatName(entry: CleanAirForum2026LeaderboardEntry, index: number) {
  return (
    entry.display_name ||
    entry.name ||
    `Guest ${String(index + 1).padStart(3, '0')}`
  );
}

function formatAvatar(entry: CleanAirForum2026LeaderboardEntry) {
  return entry.avatar_icon || entry.avatar || entry.emoji || '';
}

export default function LeaderboardScreen() {
  const shouldReduceMotion = useReducedMotion();

  const [entries, setEntries] = useState<CleanAirForum2026LeaderboardEntry[]>(
    [],
  );
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>(
    'idle',
  );
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const mountedRef = useRef(false);

  const fetchLeaderboard = useCallback(async () => {
    if (!mountedRef.current) setStatus('loading');

    try {
      const leaderboard = await fetchCleanAirForum2026Leaderboard(
        undefined,
        API_LIMIT,
      );
      setEntries(leaderboard.entries);
      setStatus('ready');
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      if (!mountedRef.current) setStatus('error');
    }

    mountedRef.current = true;
  }, []);

  const retryFetchLeaderboard = useCallback(async () => {
    setStatus('loading');

    try {
      const leaderboard = await fetchCleanAirForum2026Leaderboard(
        undefined,
        API_LIMIT,
      );
      setEntries(leaderboard.entries);
      setStatus('ready');
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    void fetchLeaderboard();
  }, [fetchLeaderboard]);

  usePollingWithVisibility(fetchLeaderboard, POLL_INTERVAL_MS);

  const totalSlides = useMemo(
    () => Math.max(1, Math.ceil(entries.length / ROWS_PER_SLIDE)),
    [entries.length],
  );

  const visibleRows = useMemo(() => {
    const startIndex = page * ROWS_PER_SLIDE;
    const slice = entries.slice(startIndex, startIndex + ROWS_PER_SLIDE);

    return Array.from({ length: ROWS_PER_SLIDE }, (_, i) => {
      const absoluteIndex = startIndex + i;
      const entry = slice[i];

      if (entry) {
        const stableId =
          entry.guest_id ||
          entry.device_id ||
          `rank-${entry.rank ?? absoluteIndex + 1}`;
        const tone: 'light' | 'tint' =
          absoluteIndex % 2 === 0 ? 'light' : 'tint';

        return {
          id: stableId,
          isEmpty: false,
          avatar: formatAvatar(entry),
          avatarImageUrl: entry.avatar_image_url || '',
          rank: entry.rank ?? absoluteIndex + 1,
          name: formatName(entry, absoluteIndex),
          points: formatPoints(entry.points),
          tone,
        };
      }

      const tone: 'light' | 'tint' = absoluteIndex % 2 === 0 ? 'light' : 'tint';

      return {
        id: `empty-${absoluteIndex + 1}`,
        isEmpty: true,
        avatar: '',
        avatarImageUrl: '',
        rank: absoluteIndex + 1,
        name: 'Open',
        points: '—',
        tone,
      };
    });
  }, [entries, page]);

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, totalSlides - 1));
  }, [totalSlides]);

  const goToRelativePage = useCallback(
    (offset: number) => {
      if (totalSlides <= 1) return;
      const nextPage = (page + offset + totalSlides) % totalSlides;
      setDirection(offset > 0 ? 1 : -1);
      setPage(nextPage);
    },
    [page, totalSlides],
  );

  useEffect(() => {
    if (status !== 'ready' || isPaused || shouldReduceMotion) return;

    const timer = window.setTimeout(() => {
      goToRelativePage(1);
    }, CAROUSEL_INTERVAL_MS);

    return () => window.clearTimeout(timer);
  }, [
    goToRelativePage,
    isPaused,
    page,
    shouldReduceMotion,
    status,
    totalSlides,
  ]);

  const handleCarouselKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLElement>) => {
      if (totalSlides <= 1) return;
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToRelativePage(1);
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToRelativePage(-1);
      }
    },
    [goToRelativePage, totalSlides],
  );

  const handleDragEnd = useCallback(
    (
      _event: MouseEvent | TouchEvent | globalThis.PointerEvent,
      info: PanInfo,
    ) => {
      if (totalSlides <= 1) return;

      const movedLeft =
        info.offset.x < -SWIPE_DISTANCE_THRESHOLD ||
        info.velocity.x < -SWIPE_VELOCITY_THRESHOLD;
      const movedRight =
        info.offset.x > SWIPE_DISTANCE_THRESHOLD ||
        info.velocity.x > SWIPE_VELOCITY_THRESHOLD;

      if (movedLeft) goToRelativePage(1);
      else if (movedRight) goToRelativePage(-1);
    },
    [goToRelativePage, totalSlides],
  );

  return (
    <div
      className="relative min-h-[100svh] overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, #005257 0%, #39BFC7 50%, #FFFFFF 100%)',
      }}
    >
      <AmbientBackground />

      <div className="relative mx-auto flex min-h-[100svh] w-full max-w-[1400px] flex-col px-4 pb-12 pt-4 sm:px-8 sm:pt-8 lg:px-12">
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
                {LEADERBOARD_TITLE}
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
            <p className="text-[13px] font-bold leading-tight">{EVENT_LABEL}</p>
            <p className="mt-0.5 text-[13px] italic text-white/85">
              {EVENT_LOCATION_AND_YEAR}
            </p>
          </motion.div>
        </motion.header>

        <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col items-center justify-center pt-6 sm:pt-10">
          {status === 'error' && entries.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/20 bg-white/15 px-8 py-10 text-center backdrop-blur-xl"
            >
              <p className="text-lg font-bold text-white">
                Unable to load leaderboard
              </p>
              <p className="mt-2 text-sm text-white/70">
                Please check your connection and try again.
              </p>
              <button
                type="button"
                onClick={() => void retryFetchLeaderboard()}
                className="mt-5 rounded-lg bg-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/30"
              >
                Try again
              </button>
            </motion.div>
          ) : (
            <section
              tabIndex={0}
              aria-label="Air quality quiz leaderboard carousel"
              aria-roledescription="carousel"
              className="flex w-full flex-col items-center"
              onKeyDown={handleCarouselKeyDown}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              onFocusCapture={() => setIsPaused(true)}
              onBlurCapture={() => setIsPaused(false)}
            >
              <div className="w-full">
                <AnimatePresence initial={false} mode="wait" custom={direction}>
                  <motion.div
                    key={`slide-${page}`}
                    custom={direction}
                    variants={shouldReduceMotion ? undefined : slideVariants}
                    initial={shouldReduceMotion ? false : 'enter'}
                    animate="center"
                    exit={shouldReduceMotion ? undefined : 'exit'}
                    aria-live="polite"
                    drag={totalSlides > 1 && !shouldReduceMotion ? 'x' : false}
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.14}
                    dragMomentum={false}
                    onDragEnd={handleDragEnd}
                    className="flex w-full flex-col gap-3 sm:gap-4"
                  >
                    {visibleRows.map((row) => (
                      <motion.div
                        key={row.id}
                        variants={shouldReduceMotion ? undefined : rowVariants}
                      >
                        <LeaderboardRow
                          avatar={row.avatar}
                          avatarImageUrl={row.avatarImageUrl}
                          rank={row.rank}
                          name={row.name}
                          points={row.points}
                          tone={row.tone}
                          isEmpty={row.isEmpty}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              {totalSlides > 1 && (
                <div className="mt-8 w-full sm:mt-10">
                  <LeaderboardToggles
                    activeIndex={page}
                    count={totalSlides}
                    intervalMs={CAROUSEL_INTERVAL_MS}
                    isPaused={isPaused}
                    reduceMotion={shouldReduceMotion}
                  />
                </div>
              )}
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
