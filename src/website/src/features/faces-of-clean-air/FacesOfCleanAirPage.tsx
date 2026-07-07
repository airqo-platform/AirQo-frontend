'use client';

import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  CLEAN_AIR_FORUM_CURRENT_EVENT_ID,
  CLEAN_AIR_FORUM_WALL_POLL_INTERVAL_MS,
} from '@/config/cleanAirForumConfig';
import { facesOfCleanAirService } from '@/services/external';
import type { CleanAirSubmission } from '@/services/external/faces-of-clean-air.service';

const AIRQO_LOGO_URL =
  'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728138368/website/Logos/logo_rus4my.png';

const CARDS_PER_PAGE = 6;
const CAROUSEL_INTERVAL_MS = 6000;
const EVENT_LABEL = 'Africa CLEAN - Air Forum';
const EVENT_DATE = 'Pretoria 2026';
const EVENT_DATES_BADGE = '13TH-16TH JULY';

function getAqiColor(aqi: number): string {
  if (aqi <= 50) return '#22c55e';
  if (aqi <= 100) return '#eab308';
  if (aqi <= 150) return '#f97316';
  return '#ef4444';
}

function getAqiCategory(aqi: number): string {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive';
  return 'Unhealthy';
}

function SkeletonCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-white shadow-lg">
      <div className="aspect-[4/5] animate-pulse bg-gradient-to-br from-gray-200 to-gray-100" />
      <div className="space-y-3 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200" />
        <div className="flex items-center gap-2">
          <div className="h-8 w-16 animate-pulse rounded-full bg-gray-200" />
          <div className="h-6 w-12 animate-pulse rounded-full bg-gray-200" />
        </div>
      </div>
    </div>
  );
}

function FaceCard({ submission }: { submission: CleanAirSubmission }) {
  const pm25 = submission.pm25Value ?? 0;
  const aqiEstimate = Math.round(pm25 * 2.5);
  const aqiColor = getAqiColor(aqiEstimate);
  const aqiLabel = submission.aqiCategory || getAqiCategory(aqiEstimate);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: -20 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative overflow-hidden rounded-2xl shadow-lg transition-shadow duration-300 hover:shadow-xl"
    >
      <div className="relative aspect-[3/4] overflow-hidden">
        <Image
          src={submission.imageUrl}
          alt={submission.displayName || 'Air quality contributor'}
          fill
          unoptimized
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        />

        {/* Top gradient overlay */}
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/40 via-black/10 to-transparent" />

        {/* AirQo logo badge - top left */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-white/95 px-2 py-1 backdrop-blur-sm">
          <Image
            src={AIRQO_LOGO_URL}
            alt="AirQo"
            width={16}
            height={11}
            unoptimized
            className="h-2.5 w-auto"
          />
        </div>

        {/* Event info - top right */}
        <div className="absolute top-3 right-3 text-right">
          <p className="text-[10px] font-semibold text-white drop-shadow-lg">
            Clean Air Forum
          </p>
          <p className="text-[9px] text-white/90 drop-shadow-lg">
            {EVENT_DATE}
          </p>
        </div>

        {/* Bottom gradient overlay */}
        <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#0d9488] via-[#0d9488]/85 to-transparent" />

        {/* Content overlay */}
        <div className="absolute inset-x-0 bottom-0 flex flex-col justify-end p-4 text-white">
          {/* Location */}
          <h3 className="text-base font-bold leading-tight drop-shadow-lg sm:text-lg">
            {submission.locationName || 'Anonymous Location'}
          </h3>

          {/* Sub-location */}
          {submission.locationName && (
            <p className="mt-0.5 text-[10px] text-white/80">
              {submission.locationName}
            </p>
          )}

          {/* PM2.5 and AQI */}
          <div className="mt-2 flex items-center gap-2">
            <span className="text-2xl font-bold drop-shadow-lg sm:text-3xl">
              {pm25.toFixed(1)}
            </span>
            <div className="flex flex-col gap-1">
              <span className="text-[9px] text-white/70">PM2.5 µg/m³</span>
              <span
                className="inline-flex w-fit items-center rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
                style={{ backgroundColor: aqiColor }}
              >
                {aqiLabel}
              </span>
            </div>
          </div>

          {/* Footer badges */}
          <div className="mt-2.5 flex items-center justify-between border-t border-white/20 pt-2.5">
            <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2 py-0.5 text-[9px] font-medium text-white backdrop-blur-sm">
              Shared from the AirQo App
            </span>
            <span className="text-[10px] font-medium text-white/90">
              {EVENT_DATES_BADGE}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function FacesOfCleanAirPage() {
  const [submissions, setSubmissions] = useState<CleanAirSubmission[]>([]);
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [direction, setDirection] = useState(0);

  const fetchSubmissions = useCallback(async () => {
    try {
      const data = await facesOfCleanAirService.getSubmissions(
        CLEAN_AIR_FORUM_CURRENT_EVENT_ID,
      );
      setSubmissions(data);
    } catch (error) {
      console.error('Failed to load clean air faces:', error);
    } finally {
      setIsLoading(false);
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

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(submissions.length / CARDS_PER_PAGE)),
    [submissions.length],
  );

  useEffect(() => {
    if (totalPages <= 1 || isLoading) return;
    const timer = setInterval(() => {
      setDirection(1);
      setPage((prev) => (prev + 1) % totalPages);
    }, CAROUSEL_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [totalPages, isLoading]);

  const pageItems = useMemo(
    () =>
      submissions.slice(
        page * CARDS_PER_PAGE,
        page * CARDS_PER_PAGE + CARDS_PER_PAGE,
      ),
    [submissions, page],
  );

  const goToPage = (index: number) => {
    setDirection(index > page ? 1 : -1);
    setPage(index);
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
      scale: 0.95,
    }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({
      x: dir > 0 ? -300 : 300,
      opacity: 0,
      scale: 0.95,
    }),
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0d9488] via-[#14b8a6] to-[#5eead4]" />

      {/* Header */}
      <header className="relative px-4 pt-8 sm:px-6 sm:pt-12">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row sm:gap-6">
          {/* AirQo logo */}
          <div className="flex-shrink-0">
            <Image
              src={AIRQO_LOGO_URL}
              alt="AirQo"
              width={100}
              height={34}
              unoptimized
              className="h-8 w-auto sm:h-10"
            />
          </div>

          {/* Title */}
          <h1
            className="text-center text-3xl font-bold text-white drop-shadow-lg sm:text-left sm:text-4xl md:text-5xl"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            Faces of <span className="italic">Air Quality</span>
          </h1>

          {/* Event info */}
          <div className="flex-shrink-0 text-center sm:text-right">
            <p className="text-xs font-semibold text-white/90 sm:text-sm">
              {EVENT_LABEL}
            </p>
            <p className="text-[10px] text-white/70 sm:text-xs">{EVENT_DATE}</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="relative px-4 pb-12 sm:px-6 sm:pb-16">
        <div className="mx-auto max-w-6xl">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {Array.from({ length: CARDS_PER_PAGE }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : submissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center sm:py-20">
              <div className="mb-6 rounded-full bg-white/10 p-6 backdrop-blur-sm">
                <Image
                  src={AIRQO_LOGO_URL}
                  alt="AirQo"
                  width={60}
                  height={20}
                  unoptimized
                  className="h-5 w-auto opacity-50"
                />
              </div>
              <h2 className="mb-2 text-xl font-bold text-white sm:text-2xl">
                No faces yet
              </h2>
              <p className="max-w-md text-sm text-white/70">
                Be the first to share your air quality selfie from the Clean Air
                Forum!
              </p>
            </div>
          ) : (
            <>
              {/* Carousel */}
              <div className="relative overflow-hidden">
                <AnimatePresence mode="wait" custom={direction}>
                  <motion.div
                    key={page}
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: 'spring', stiffness: 200, damping: 30 },
                      opacity: { duration: 0.4 },
                      scale: { duration: 0.4 },
                    }}
                    className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3"
                  >
                    {pageItems.map((submission) => (
                      <FaceCard key={submission.id} submission={submission} />
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Pagination dots */}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-center gap-2.5 sm:mt-10">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => goToPage(i)}
                      aria-label={`Go to page ${i + 1}`}
                    >
                      <span
                        className="block rounded-full transition-all duration-300"
                        style={{
                          width: i === page ? 28 : 8,
                          height: 8,
                          backgroundColor:
                            i === page ? '#0d9488' : 'rgba(255,255,255,0.5)',
                        }}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* Counter */}
              <div className="mt-4 text-center">
                <p className="text-[10px] text-white/60 sm:text-xs">
                  {submissions.length} faces shared
                </p>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
