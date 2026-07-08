'use client';

import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Variants,
} from 'framer-motion';
import Image from 'next/image';
import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FiCamera } from 'react-icons/fi';

import {
  CLEAN_AIR_FORUM_CURRENT_EVENT_ID,
  CLEAN_AIR_FORUM_WALL_POLL_INTERVAL_MS,
} from '@/config/cleanAirForumConfig';
import { facesOfCleanAirService } from '@/services/external';
import type { CleanAirSubmission } from '@/services/external/faces-of-clean-air.service';

const AIRQO_LOGO_URL = '/assets/images/white-logo.png';

const CARDS_PER_PAGE = 6;
const CAROUSEL_INTERVAL_MS = 7000;

const EVENT_LABEL = 'Africa CLEAN-Air Forum';
const EVENT_LOCATION_AND_YEAR = 'Pretoria 2026';
const EVENT_DATES_BADGE = '13TH-16TH JULY';

type FetchState = 'idle' | 'loading' | 'success' | 'error';

type CategoryStyle = {
  label: string;
  className: string;
};

function formatPm25(value: number | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '--';
  return value.toFixed(1);
}

function getFallbackCategory(pm25: number): CategoryStyle {
  if (pm25 <= 12) {
    return { label: 'Good', className: 'bg-emerald-100 text-emerald-700' };
  }
  if (pm25 <= 35.4) {
    return { label: 'Moderate', className: 'bg-amber-100 text-amber-700' };
  }
  if (pm25 <= 55.4) {
    return { label: 'Sensitive', className: 'bg-orange-100 text-orange-700' };
  }
  return { label: 'Unhealthy', className: 'bg-red-100 text-red-700' };
}

function getCategoryStyle(
  category: string | null | undefined,
  pm25: number,
): CategoryStyle {
  const normalized = category?.trim().toLowerCase();
  if (!normalized) return getFallbackCategory(pm25);
  if (normalized.includes('good'))
    return { label: category!, className: 'bg-emerald-100 text-emerald-700' };
  if (normalized.includes('moderate'))
    return { label: category!, className: 'bg-amber-100 text-amber-700' };
  if (normalized.includes('sensitive'))
    return { label: category!, className: 'bg-orange-100 text-orange-700' };
  return { label: category!, className: 'bg-red-100 text-red-700' };
}

function SkeletonCard({ index }: { index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.35,
        delay: index * 0.045,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative aspect-square w-full overflow-hidden rounded-lg bg-white/40"
      aria-hidden="true"
    >
      <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-white/60 via-blue-50 to-blue-100/60" />
      <div className="absolute left-3 top-3 flex items-center gap-2">
        <div className="h-6 w-9 rounded-full bg-white/60" />
        <div className="space-y-1">
          <div className="h-2 w-16 rounded bg-white/50" />
          <div className="h-2 w-12 rounded bg-white/40" />
        </div>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[48%] bg-gradient-to-t from-blue-600/70 via-blue-500/30 to-transparent" />
      <div className="absolute inset-x-3 bottom-3 space-y-2">
        <div className="h-5 w-3/4 rounded bg-white/70" />
        <div className="h-2 w-1/2 rounded bg-white/50" />
        <div className="flex items-end gap-2">
          <div className="h-8 w-16 rounded bg-white/70" />
          <div className="h-4 w-14 rounded-full bg-white/60" />
        </div>
        <div className="flex justify-between border-t border-white/20 pt-2">
          <div className="h-4 w-24 rounded-full bg-white/60" />
          <div className="h-3 w-20 rounded bg-white/40" />
        </div>
      </div>
    </motion.div>
  );
}

function FaceCard({
  submission,
  priority,
}: {
  submission: CleanAirSubmission;
  priority: boolean;
}) {
  const pm25 = submission.pm25Value ?? 0;
  const category = getCategoryStyle(submission.aqiCategory, pm25);
  const displayName =
    submission.displayName?.trim() ||
    submission.locationName?.trim() ||
    'Clean Air Champion';
  const location =
    submission.locationName?.trim() || 'Pretoria, Gauteng, South Africa';

  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 18, scale: 0.97 },
        visible: { opacity: 1, y: 0, scale: 1 },
      }}
      transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
      className="group relative aspect-square w-full overflow-hidden rounded-lg bg-blue-950"
    >
      <Image
        src={submission.imageUrl}
        alt={`${displayName} at ${location}`}
        fill
        priority={priority}
        unoptimized
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]"
        sizes="(min-width: 1280px) 280px, (min-width: 1024px) 25vw, (min-width: 640px) 42vw, 92vw"
      />

      <div className="absolute inset-x-0 top-0 h-[30%] bg-gradient-to-b from-black/30 via-black/10 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-[49%] bg-gradient-to-t from-blue-700 via-blue-600/90 via-[56%] to-transparent" />

      <div className="absolute left-3 top-3 flex items-center gap-2.5 text-white">
        <Image
          src={AIRQO_LOGO_URL}
          alt="AirQo"
          width={40}
          height={26}
          unoptimized
          className="h-6 w-auto drop-shadow-lg"
        />
        <div className="border-l border-white/40 pl-2.5 leading-[1.1]">
          <p className="text-[11px] font-semibold drop-shadow-sm">
            Clean Air Forum
          </p>
          <p className="text-[10px] italic text-white/85">
            {EVENT_LOCATION_AND_YEAR}
          </p>
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 px-3 pb-2.5 text-white sm:px-3.5 sm:pb-3">
        <h2
          className="truncate text-[16px] font-semibold leading-tight sm:text-[17px]"
          title={displayName}
        >
          {displayName}
        </h2>
        <p
          className="mt-0.5 truncate text-[7px] font-medium text-white/80 sm:text-[8px]"
          title={location}
        >
          {location}
        </p>

        <div className="mt-1.5 flex items-end gap-2">
          <span className="text-[28px] font-bold leading-none tracking-[-0.03em] sm:text-[30px]">
            {formatPm25(submission.pm25Value)}
          </span>
          <div className="mb-0.5 flex min-w-0 items-center gap-1.5">
            <span className="whitespace-nowrap text-[6px] font-semibold text-white/85 sm:text-[7px]">
              PM2.5 µg/m³
            </span>
            <span
              className={`max-w-[92px] truncate rounded-full px-1.5 py-0.5 text-[6px] font-semibold sm:text-[7px] ${category.className}`}
              title={category.label}
            >
              {category.label}
            </span>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2 border-t border-white/20 pt-2">
          <span className="truncate rounded-full bg-white px-2 py-0.5 text-[6px] font-semibold text-blue-700 sm:text-[7px]">
            Shared from the AirQo app
          </span>
          <span className="whitespace-nowrap text-[7px] font-semibold sm:text-[8px]">
            {EVENT_DATES_BADGE}
          </span>
        </div>
      </div>
    </motion.article>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="mx-auto flex min-h-[220px] w-full max-w-[520px] flex-col items-center justify-center rounded-2xl border border-white/50 bg-white/40 px-8 py-10 text-center backdrop-blur-sm"
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/30">
        <FiCamera className="h-7 w-7 text-white" />
      </div>
      <h2 className="text-xl font-bold text-slate-900">No faces yet</h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-slate-600">
        Be the first to share an air quality selfie from the Africa Clean Air
        Forum.
      </p>
    </motion.div>
  );
}

function ErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      role="alert"
      className="mx-auto flex min-h-[220px] w-full max-w-[520px] flex-col items-center justify-center rounded-2xl border border-white/50 bg-white/40 px-8 py-10 text-center backdrop-blur-sm"
    >
      <h2 className="text-xl font-bold text-slate-900">
        We could not load the selfie wall
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        Please check the connection and try again.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
      >
        Try again
      </button>
    </motion.div>
  );
}

export default function FacesOfCleanAirPage() {
  const shouldReduceMotion = useReducedMotion();
  const [submissions, setSubmissions] = useState<CleanAirSubmission[]>([]);
  const [fetchState, setFetchState] = useState<FetchState>('idle');
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);
  const hasLoadedRef = useRef(false);

  const fetchSubmissions = useCallback(async () => {
    if (!hasLoadedRef.current) setFetchState('loading');
    try {
      const data = await facesOfCleanAirService.getSubmissions(
        CLEAN_AIR_FORUM_CURRENT_EVENT_ID,
      );
      setSubmissions(Array.isArray(data) ? data : []);
      setFetchState('success');
      hasLoadedRef.current = true;
    } catch (error) {
      console.error('Failed to load clean air faces:', error);
      if (!hasLoadedRef.current) setFetchState('error');
    }
  }, []);

  useEffect(() => {
    void fetchSubmissions();
    const pollingTimer = window.setInterval(
      () => void fetchSubmissions(),
      CLEAN_AIR_FORUM_WALL_POLL_INTERVAL_MS,
    );
    return () => window.clearInterval(pollingTimer);
  }, [fetchSubmissions]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(submissions.length / CARDS_PER_PAGE)),
    [submissions.length],
  );

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, totalPages - 1));
  }, [totalPages]);

  useEffect(() => {
    if (
      fetchState !== 'success' ||
      totalPages <= 1 ||
      isPaused ||
      shouldReduceMotion
    )
      return;
    const carouselTimer = window.setTimeout(() => {
      setDirection(1);
      setPage((currentPage) => (currentPage + 1) % totalPages);
    }, CAROUSEL_INTERVAL_MS);
    return () => window.clearTimeout(carouselTimer);
  }, [fetchState, isPaused, page, shouldReduceMotion, totalPages]);

  const pageItems = useMemo(() => {
    const startIndex = page * CARDS_PER_PAGE;
    return submissions.slice(startIndex, startIndex + CARDS_PER_PAGE);
  }, [page, submissions]);

  const hasSecondRow = pageItems.length > 3;

  const goToPage = useCallback(
    (nextPage: number) => {
      if (nextPage === page || nextPage < 0 || nextPage >= totalPages) return;
      setDirection(nextPage > page ? 1 : -1);
      setPage(nextPage);
    },
    [page, totalPages],
  );

  const handleCarouselKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (totalPages <= 1) return;
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        goToPage((page + 1) % totalPages);
      }
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goToPage((page - 1 + totalPages) % totalPages);
      }
    },
    [goToPage, page, totalPages],
  );

  const slideVariants: Variants = {
    enter: (slideDirection: number) => ({
      x: shouldReduceMotion ? 0 : slideDirection > 0 ? 72 : -72,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.52,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: shouldReduceMotion ? 0 : 0.055,
      },
    },
    exit: (slideDirection: number) => ({
      x: shouldReduceMotion ? 0 : slideDirection > 0 ? -72 : 72,
      opacity: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.32,
        ease: 'easeInOut',
      },
    }),
  };

  const isInitialLoading = fetchState === 'idle' || fetchState === 'loading';
  const showError = fetchState === 'error' && submissions.length === 0;
  const showEmpty = fetchState === 'success' && submissions.length === 0;

  return (
    <div
      className="relative min-h-[100svh] overflow-hidden"
      style={{
        background: `linear-gradient(180deg, #02143B 0%, #145FFF 50%, #FFFFFF 100%)`,
      }}
    >
      <div className="relative mx-auto min-h-[100svh] w-full max-w-[1400px] px-5 pb-10 pt-8 sm:px-8 lg:px-12">
        <header className="mx-auto grid w-full max-w-[1200px] items-center gap-5 sm:grid-cols-[76px_minmax(0,1fr)_190px] sm:gap-6">
          <div className="flex justify-center sm:justify-start">
            <Image
              src={AIRQO_LOGO_URL}
              alt="AirQo"
              width={78}
              height={51}
              priority
              unoptimized
              className="h-auto w-[72px]"
            />
          </div>

          <h1 className="text-center leading-none text-white sm:text-left">
            <span
              className="text-[38px] font-normal tracking-[-0.05em] sm:text-[42px]"
              style={{
                fontFamily:
                  '"Brush Script MT", "Segoe Script", "URW Chancery L", cursive',
              }}
            >
              Faces of
            </span>{' '}
            <span className="text-[36px] font-extrabold tracking-[-0.045em] sm:text-[40px]">
              Air Quality
            </span>
          </h1>

          <div className="text-center sm:text-left sm:text-white">
            <p className="text-[13px] font-bold leading-tight">{EVENT_LABEL}</p>
            <p className="mt-0.5 text-[13px] italic text-white/85">
              {EVENT_LOCATION_AND_YEAR}
            </p>
          </div>
        </header>

        <main className="mx-auto flex min-h-[60svh] w-full max-w-[1200px] items-center justify-center pt-9 sm:pt-10">
          <section
            tabIndex={0}
            aria-label="Faces of Air Quality selfie carousel"
            aria-roledescription="carousel"
            className="w-full rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent"
            onKeyDown={handleCarouselKeyDown}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocusCapture={() => setIsPaused(true)}
            onBlurCapture={() => setIsPaused(false)}
          >
            {isInitialLoading && (
              <div className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: CARDS_PER_PAGE }).map((_, index) => (
                  <div key={index} className="w-full max-w-[280px]">
                    <SkeletonCard index={index} />
                  </div>
                ))}
              </div>
            )}

            {showError && (
              <ErrorState onRetry={() => void fetchSubmissions()} />
            )}

            {showEmpty && <EmptyState />}

            {!isInitialLoading && !showError && !showEmpty && (
              <>
                <div
                  className={`relative overflow-hidden ${
                    hasSecondRow
                      ? 'min-h-[280px] lg:min-h-[580px]'
                      : 'min-h-[280px]'
                  }`}
                >
                  <AnimatePresence
                    initial={false}
                    mode="wait"
                    custom={direction}
                  >
                    <motion.div
                      key={page}
                      custom={direction}
                      variants={slideVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      aria-live="polite"
                      className="grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3"
                    >
                      {pageItems.map((submission, index) => (
                        <div
                          key={
                            submission.id ??
                            `${submission.imageUrl}-${page}-${index}`
                          }
                          className="w-full max-w-[280px]"
                        >
                          <FaceCard
                            submission={submission}
                            priority={page === 0 && index < 3}
                          />
                        </div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {totalPages > 1 && (
                  <nav
                    className="mt-8 flex items-center justify-center gap-3"
                    aria-label="Selfie carousel pages"
                  >
                    {Array.from({ length: totalPages }).map((_, index) => {
                      const isActive = index === page;
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => goToPage(index)}
                          aria-label={`Show selfie page ${index + 1} of ${totalPages}`}
                          aria-current={isActive ? 'page' : undefined}
                          className={`h-2.5 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 ${
                            isActive
                              ? 'w-10 bg-blue-600'
                              : 'w-2.5 bg-blue-600/40 hover:bg-blue-600/60'
                          }`}
                        />
                      );
                    })}
                  </nav>
                )}
              </>
            )}
          </section>
        </main>
      </div>
    </div>
  );
}
