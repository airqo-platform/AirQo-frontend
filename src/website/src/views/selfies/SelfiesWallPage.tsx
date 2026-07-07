'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  CLEAN_AIR_FORUM_CURRENT_EVENT_ID,
  CLEAN_AIR_FORUM_WALL_PAGE_SIZE,
  CLEAN_AIR_FORUM_WALL_POLL_INTERVAL_MS,
  CLEAN_AIR_FORUM_WALL_SLIDE_INTERVAL_MS,
} from '@/configs/cleanAirForumConfig';

// Same mark used in the site nav (src/components/layouts/Navbar.tsx) so the
// wall reads as unmistakably AirQo rather than a generic dark dashboard.
const AIRQO_LOGO_URL =
  'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728138368/website/Logos/logo_rus4my.png';

// The site's primary brand blue (see theme-color in src/app/layout.tsx and
// the stats/map accents in src/views/home/data.ts) — reused here instead of
// a generic dark-UI blue so the wall still feels like part of airqo.net.
const BRAND_BLUE = '#145DFF';

interface WallSubmission {
  id: string;
  imageUrl: string;
  locationName: string | null;
  pm25Value: number | null;
  aqiCategory: string | null;
  displayName: string | null;
  createdAt: string;
}

const DOUBLE_TAP_WINDOW_MS = 350;
const LONG_PRESS_DURATION_MS = 600;

/**
 * Full-screen "wall" display meant to run in a browser on the conference
 * venue's monitor/projector: an auto-advancing slideshow of selfies
 * submitted from the AirQo mobile app's Clean Air Forum filter.
 *
 * Moderation is inline, no admin dashboard: double-tapping or long-pressing
 * a tile prompts for the shared staff PIN, then removes (soft-hides) the
 * photo from the wall.
 */
export default function SelfiesWallPage() {
  const [submissions, setSubmissions] = useState<WallSubmission[]>([]);
  const [page, setPage] = useState(0);
  const [pendingRemovalId, setPendingRemovalId] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const lastTapRef = useRef<{ id: string; time: number } | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggeredRef = useRef(false);

  const fetchSubmissions = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/clean-air-forum/selfies?eventId=${encodeURIComponent(
          CLEAN_AIR_FORUM_CURRENT_EVENT_ID,
        )}`,
        { cache: 'no-store' },
      );
      if (!response.ok) return;

      const data = await response.json();
      setSubmissions(Array.isArray(data?.submissions) ? data.submissions : []);
      // Jump back to the newest page whenever the wall refreshes.
      setPage(0);
    } catch (error) {
      console.error('Failed to load Clean Air Forum wall submissions:', error);
    }
  }, []);

  useEffect(() => {
    fetchSubmissions();
    const interval = setInterval(
      fetchSubmissions,
      CLEAN_AIR_FORUM_WALL_POLL_INTERVAL_MS,
    );
    return () => clearInterval(interval);
  }, [fetchSubmissions]);

  const totalPages = Math.max(
    1,
    Math.ceil(submissions.length / CLEAN_AIR_FORUM_WALL_PAGE_SIZE),
  );

  // Auto-advance the on-screen page — this is a slideshow for an unattended
  // venue screen, not something anyone scrolls.
  useEffect(() => {
    if (totalPages <= 1) return;
    const timer = setInterval(() => {
      setPage((prev) => (prev + 1) % totalPages);
    }, CLEAN_AIR_FORUM_WALL_SLIDE_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [totalPages]);

  const pageItems = submissions.slice(
    page * CLEAN_AIR_FORUM_WALL_PAGE_SIZE,
    page * CLEAN_AIR_FORUM_WALL_PAGE_SIZE + CLEAN_AIR_FORUM_WALL_PAGE_SIZE,
  );

  const openRemovalPrompt = (id: string) => {
    setPendingRemovalId(id);
    setPin('');
    setPinError(null);
  };

  const handleTileTap = (id: string) => {
    // A long press already opened the prompt — the click that follows the
    // pointer-up shouldn't also be counted as the first half of a tap.
    if (longPressTriggeredRef.current) {
      longPressTriggeredRef.current = false;
      return;
    }

    const now = Date.now();
    const lastTap = lastTapRef.current;

    if (
      lastTap &&
      lastTap.id === id &&
      now - lastTap.time < DOUBLE_TAP_WINDOW_MS
    ) {
      lastTapRef.current = null;
      openRemovalPrompt(id);
    } else {
      lastTapRef.current = { id, time: now };
    }
  };

  const startLongPress = (id: string) => {
    longPressTriggeredRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      longPressTriggeredRef.current = true;
      openRemovalPrompt(id);
    }, LONG_PRESS_DURATION_MS);
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const cancelRemoval = () => {
    setPendingRemovalId(null);
    setPin('');
    setPinError(null);
  };

  const confirmRemoval = async () => {
    if (!pendingRemovalId || isRemoving) return;
    setIsRemoving(true);
    setPinError(null);

    try {
      const response = await fetch(
        `/api/clean-air-forum/selfies/${pendingRemovalId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ pin }),
        },
      );

      if (!response.ok) {
        setPinError(
          response.status === 401
            ? 'Incorrect PIN. Please try again.'
            : 'Could not remove this photo. Please try again.',
        );
        return;
      }

      setSubmissions((prev) =>
        prev.filter((submission) => submission.id !== pendingRemovalId),
      );
      cancelRemoval();
    } catch {
      setPinError('Something went wrong. Please try again.');
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#05070d] text-white select-none">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% -10%, ${BRAND_BLUE}33, transparent 60%)`,
        }}
      />

      <header className="relative flex flex-col items-center gap-2 pt-10 pb-8">
        <div className="flex items-center gap-4">
          <Image
            src={AIRQO_LOGO_URL}
            alt="AirQo"
            width={140}
            height={48}
            unoptimized
            className="h-9 w-auto"
          />
          <span className="text-2xl font-light text-white/30">×</span>
          <span className="text-2xl font-bold tracking-tight md:text-3xl">
            Clean Air Forum
          </span>
        </div>
        <p className="text-sm tracking-wide text-white/50">
          Live from the AirQo booth
        </p>
      </header>

      <main className="relative px-6 pb-12 md:px-10">
        {submissions.length === 0 ? (
          <div className="flex h-[60vh] flex-col items-center justify-center gap-3 px-6 text-center text-white/60">
            <p className="text-xl md:text-2xl">
              Be the first to share your Clean Air Forum selfie!
            </p>
            <p className="text-sm md:text-base">
              Photos submitted from the AirQo app will appear here.
            </p>
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={page}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="mx-auto grid max-w-6xl grid-cols-2 gap-5 md:grid-cols-4"
              >
                {pageItems.map((submission, index) => (
                  <motion.button
                    key={submission.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    type="button"
                    onClick={() => handleTileTap(submission.id)}
                    onPointerDown={() => startLongPress(submission.id)}
                    onPointerUp={cancelLongPress}
                    onPointerLeave={cancelLongPress}
                    className="group relative aspect-[9/16] overflow-hidden rounded-2xl ring-1 ring-white/10 focus:outline-none focus-visible:ring-2 shadow-[0_12px_30px_rgba(0,0,0,0.55)]"
                    style={{ ['--tw-ring-color' as string]: BRAND_BLUE }}
                  >
                    <Image
                      src={submission.imageUrl}
                      alt={submission.locationName || 'Clean Air Forum selfie'}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="(min-width: 768px) 25vw, 50vw"
                    />
                    {(submission.locationName ||
                      submission.pm25Value != null) && (
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-3 text-left">
                        {submission.locationName && (
                          <p className="truncate text-sm font-semibold">
                            {submission.locationName}
                          </p>
                        )}
                        {submission.pm25Value != null && (
                          <span
                            className="mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium"
                            style={{
                              backgroundColor: `${BRAND_BLUE}33`,
                              color: '#9DBBFF',
                            }}
                          >
                            {submission.pm25Value.toFixed(0)} µg/m³
                            {submission.aqiCategory
                              ? ` · ${submission.aqiCategory}`
                              : ''}
                          </span>
                        )}
                      </div>
                    )}
                  </motion.button>
                ))}
              </motion.div>
            </AnimatePresence>

            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                {Array.from({ length: totalPages }).map((_, dotIndex) => (
                  <span
                    key={dotIndex}
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: dotIndex === page ? 24 : 6,
                      backgroundColor:
                        dotIndex === page
                          ? BRAND_BLUE
                          : 'rgba(255,255,255,0.2)',
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      {pendingRemovalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 text-black">
            <h2 className="mb-2 text-lg font-bold">Remove this photo?</h2>
            <p className="mb-4 text-sm text-black/60">
              Enter the staff PIN to remove this photo from the wall.
            </p>
            <input
              type="password"
              inputMode="numeric"
              autoFocus
              value={pin}
              onChange={(event) => setPin(event.target.value)}
              placeholder="Staff PIN"
              className="mb-2 w-full rounded-lg border border-black/20 px-3 py-2 focus:border-black/40 focus:outline-none"
            />
            {pinError && (
              <p className="mb-2 text-sm text-red-600">{pinError}</p>
            )}
            <div className="mt-4 flex gap-3">
              <button
                type="button"
                onClick={cancelRemoval}
                className="flex-1 rounded-lg border border-black/20 py-2 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRemoval}
                disabled={isRemoving}
                className="flex-1 rounded-lg bg-red-600 py-2 font-semibold text-white disabled:opacity-60"
              >
                {isRemoving ? 'Removing…' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
