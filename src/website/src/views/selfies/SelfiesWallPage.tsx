'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

import {
  CLEAN_AIR_FORUM_CURRENT_EVENT_ID,
  CLEAN_AIR_FORUM_WALL_POLL_INTERVAL_MS,
} from '@/configs/cleanAirForumConfig';

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

/**
 * Full-screen "wall" display meant to run in a browser on the conference
 * venue's monitor/projector, auto-cycling through selfies submitted from
 * the AirQo mobile app's Clean Air Forum filter.
 *
 * Moderation is inline: double-tapping a tile prompts for the shared staff
 * PIN, then removes (soft-hides) the photo from the wall.
 */
export default function SelfiesWallPage() {
  const [submissions, setSubmissions] = useState<WallSubmission[]>([]);
  const [pendingRemovalId, setPendingRemovalId] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  const lastTapRef = useRef<{ id: string; time: number } | null>(null);

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

  const handleTileTap = (id: string) => {
    const now = Date.now();
    const lastTap = lastTapRef.current;

    if (
      lastTap &&
      lastTap.id === id &&
      now - lastTap.time < DOUBLE_TAP_WINDOW_MS
    ) {
      lastTapRef.current = null;
      setPendingRemovalId(id);
      setPin('');
      setPinError(null);
    } else {
      lastTapRef.current = { id, time: now };
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
    <div className="min-h-screen w-full bg-black text-white">
      <header className="flex items-center justify-center gap-3 py-8">
        <span className="text-2xl md:text-4xl font-bold tracking-wide">
          AirQo
        </span>
        <span className="text-white/40 text-2xl md:text-4xl">×</span>
        <span className="text-2xl md:text-4xl font-bold tracking-wide">
          Clean Air Forum
        </span>
      </header>

      {submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[65vh] text-white/60 gap-3 px-6 text-center">
          <p className="text-xl md:text-2xl">
            Be the first to share your Clean Air Forum selfie!
          </p>
          <p className="text-sm md:text-base">
            Photos submitted from the AirQo app will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 p-6 [grid-template-columns:repeat(auto-fill,minmax(220px,1fr))]">
          {submissions.map((submission) => (
            <button
              key={submission.id}
              type="button"
              onClick={() => handleTileTap(submission.id)}
              className="relative aspect-[9/16] rounded-2xl overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
            >
              <Image
                src={submission.imageUrl}
                alt={
                  submission.displayName ||
                  submission.locationName ||
                  'Clean Air Forum selfie'
                }
                fill
                unoptimized
                className="object-cover"
                sizes="220px"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-3 text-left">
                <p className="text-sm font-semibold truncate">
                  {submission.displayName ||
                    submission.locationName ||
                    'Anonymous'}
                </p>
                {submission.pm25Value != null && (
                  <p className="text-xs text-white/70">
                    {submission.pm25Value.toFixed(0)} µg/m³
                    {submission.aqiCategory
                      ? ` · ${submission.aqiCategory}`
                      : ''}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

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
