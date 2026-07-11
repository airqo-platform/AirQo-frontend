'use client';

import { motion, type Variants } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

import AmbientBackground from '@/components/clean-air-forum-2026/AmbientBackground';
import LeaderboardRow from '@/components/clean-air-forum-2026/LeaderboardRow';
import { fetchCleanAirForum2026Leaderboard } from '@/features/clean-air-forum-2026/lib/learn-progress';
import type { CleanAirForum2026LeaderboardEntry } from '@/features/clean-air-forum-2026/types/learn';
import { usePollingWithVisibility } from '@/hooks/usePollingWithVisibility';

const AIRQO_LOGO_URL = '/assets/images/white-logo.png';
const EVENT_LABEL = 'Africa Clean Air Forum';
const EVENT_LOCATION_AND_YEAR = 'Pretoria 2026';
const LEADERBOARD_TITLE = 'Air Quality Quiz Leaderboard';
const ROWS_PER_PAGE = 10;
const POLL_INTERVAL_MS = 30_000;

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

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const rowVariants: Variants = {
  hidden: { opacity: 0, y: 14, scale: 0.97 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.42, ease: [0.22, 1, 0.36, 1] },
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
  const [entries, setEntries] = useState<CleanAirForum2026LeaderboardEntry[]>(
    [],
  );
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>(
    'idle',
  );

  const mountedRef = useRef(false);

  const fetchLeaderboard = useCallback(async () => {
    if (!mountedRef.current) setStatus('loading');

    try {
      const leaderboard = await fetchCleanAirForum2026Leaderboard();
      setEntries(leaderboard.entries);
      setStatus('ready');
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
      if (!mountedRef.current) setStatus('error');
    }

    mountedRef.current = true;
  }, []);

  useEffect(() => {
    void fetchLeaderboard();
  }, [fetchLeaderboard]);

  usePollingWithVisibility(fetchLeaderboard, POLL_INTERVAL_MS);

  const rows = Array.from({ length: ROWS_PER_PAGE }, (_, index) => {
    const entry = entries[index];

    if (entry) {
      const stableId =
        entry.guest_id || entry.device_id || `rank-${entry.rank ?? index + 1}`;
      const tone: 'light' | 'tint' = index % 2 === 0 ? 'light' : 'tint';

      return {
        id: stableId,
        isEmpty: false,
        avatar: formatAvatar(entry),
        avatarImageUrl: entry.avatar_image_url || '',
        rank: entry.rank ?? index + 1,
        name: formatName(entry, index),
        points: formatPoints(entry.points),
        tone,
      };
    }

    const tone: 'light' | 'tint' = index % 2 === 0 ? 'light' : 'tint';

    return {
      id: `empty-${index + 1}`,
      isEmpty: true,
      avatar: '',
      avatarImageUrl: '',
      rank: index + 1,
      name: 'Open',
      points: '—',
      tone,
    };
  });

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
                onClick={() => void fetchLeaderboard()}
                className="mt-5 rounded-lg bg-white/20 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/30"
              >
                Try again
              </button>
            </motion.div>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex w-full flex-col gap-3 sm:gap-4"
            >
              {rows.map((row) => (
                <motion.div key={row.id} variants={rowVariants}>
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
          )}
        </main>
      </div>
    </div>
  );
}
