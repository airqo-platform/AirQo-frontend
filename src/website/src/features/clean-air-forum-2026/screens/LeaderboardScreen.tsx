'use client';

import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

import LeaderboardRowsBlock from '@/components/clean-air-forum-2026/LeaderboardRowsBlock';
import LeaderboardToggles from '@/components/clean-air-forum-2026/LeaderboardToggles';
import Screen from '@/components/clean-air-forum-2026/Screen';
import { fetchCleanAirForum2026Leaderboard } from '@/features/clean-air-forum-2026/lib/learn-progress';
import type { CleanAirForum2026LeaderboardEntry } from '@/features/clean-air-forum-2026/types/learn';

const SLIDE_COUNT = 4;
const ROWS_PER_SLIDE = 5;
const SLIDE_INTERVAL_MS = 6000;

function formatPoints(points: number | undefined) {
  const safePoints = points ?? 0;
  return `${safePoints.toLocaleString()}pts`;
}

function formatName(entry: CleanAirForum2026LeaderboardEntry, index: number) {
  return (
    entry.display_name ||
    entry.name ||
    `Guest ${String(index + 1).padStart(3, '0')}`
  );
}

function formatAvatar(entry: CleanAirForum2026LeaderboardEntry) {
  return entry.avatar || entry.emoji || '';
}

export default function LeaderboardScreen() {
  const [entries, setEntries] = useState<CleanAirForum2026LeaderboardEntry[]>(
    [],
  );
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadLeaderboard() {
      try {
        const leaderboard = await fetchCleanAirForum2026Leaderboard(
          controller.signal,
        );

        setEntries(leaderboard.entries);

        console.group('[CAF 2026] Live leaderboard fetched');
        console.info('entries_count', leaderboard.entries.length);
        console.info('leaderboard_payload', leaderboard.payload);
        console.groupEnd();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Unable to fetch leaderboard.';

        console.error('[CAF 2026] Live leaderboard fetch failed', message);
      }
    }

    void loadLeaderboard();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setActiveSlideIndex((currentIndex) => {
        if (currentIndex >= SLIDE_COUNT - 1) {
          void (async () => {
            try {
              const leaderboard = await fetchCleanAirForum2026Leaderboard();
              setEntries(leaderboard.entries);

              console.group('[CAF 2026] Live leaderboard refreshed');
              console.info('entries_count', leaderboard.entries.length);
              console.info('leaderboard_payload', leaderboard.payload);
              console.groupEnd();
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : 'Unable to refresh leaderboard.';

              console.error(
                '[CAF 2026] Live leaderboard refresh failed',
                message,
              );
            }
          })();

          return 0;
        }

        return currentIndex + 1;
      });
    }, SLIDE_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, []);

  const slideRows = useMemo(() => {
    const requiredRows = SLIDE_COUNT * ROWS_PER_SLIDE;
    const normalizedEntries = Array.from(
      { length: requiredRows },
      (_, index) => {
        const entry = entries[index];

        if (entry) {
          return {
            avatar: formatAvatar(entry),
            rank: entry.rank ?? index + 1,
            name: formatName(entry, index),
            points: formatPoints(entry.points),
            tone: index % 2 === 0 ? 'light' : 'tint',
          } as const;
        }

        return {
          avatar: '',
          rank: index + 1,
          name: ' ',
          points: ' ',
          tone: index % 2 === 0 ? 'light' : 'tint',
        } as const;
      },
    );

    const startIndex = activeSlideIndex * ROWS_PER_SLIDE;

    return normalizedEntries.slice(startIndex, startIndex + ROWS_PER_SLIDE);
  }, [activeSlideIndex, entries]);

  return (
    <Screen>
      <section className="caf-2026-screen mx-auto flex w-full max-w-[1600px] items-start px-5 pb-10 pt-16 sm:px-8 sm:pt-20 md:px-12 md:pt-24 lg:px-16 lg:pt-16 xl:px-20">
        <div className="flex w-full flex-col items-center">
          <div className="flex w-full justify-center lg:justify-start lg:pl-[12%] xl:pl-[9%]">
            <div className="relative w-[min(86vw,34rem)] sm:w-[min(72vw,34rem)] md:w-[min(58vw,34rem)] lg:w-[34rem] xl:w-[34.125rem]">
              <Image
                src="/clean-air-forum-2026/logos/airqo-clean-air-forum-pretoria-2026-leaderboard-logo.svg"
                alt="Africa CLEAN Air Forum Pretoria 2026"
                width={546}
                height={94}
                priority
                className="h-auto w-full"
              />
            </div>
          </div>

          <div className="mt-16 w-full sm:mt-20 lg:mt-[4.7rem]">
            <LeaderboardRowsBlock rows={slideRows} />
          </div>

          <div className="mt-16 w-full sm:mt-20 lg:mt-14">
            <LeaderboardToggles activeIndex={activeSlideIndex} />
          </div>
        </div>
      </section>
    </Screen>
  );
}
