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
import {
  type KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FiCamera } from 'react-icons/fi';

import AmbientBackground from '@/components/clean-air-forum-2026/AmbientBackground';
import QrCodeButton from '@/components/clean-air-forum-2026/QrCodeButton';
import {
  CLEAN_AIR_FORUM_CURRENT_EVENT_ID,
  CLEAN_AIR_FORUM_WALL_ACTIVE_POLL_INTERVAL_MS,
} from '@/config/cleanAirForumConfig';
import { usePollingWithVisibility } from '@/hooks/usePollingWithVisibility';
import { facesOfCleanAirService } from '@/services/external';
import type { CleanAirSubmissionWithId } from '@/services/external/faces-of-clean-air.service';

const AIRQO_LOGO_URL = '/assets/images/white-logo.png';
const EVENT_LABEL = 'Africa Clean Air Forum';
const EVENT_LOCATION_AND_YEAR = 'Pretoria 2026';
const CAROUSEL_INTERVAL_MS = 7600;
const SWIPE_DISTANCE_THRESHOLD = 70;
const SWIPE_VELOCITY_THRESHOLD = 500;
const MOBILE_MEDIA_QUERY = '(max-width: 639px)';
const DESKTOP_CARDS_PER_PAGE = 8;

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

const cardVariants: Variants = {
  enter: { opacity: 0, y: 28, scale: 0.94 },
  center: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -16, scale: 0.96 },
};

type FetchState = 'idle' | 'loading' | 'success' | 'error';

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    const updateMatch = () => setMatches(mediaQuery.matches);
    updateMatch();
    mediaQuery.addEventListener('change', updateMatch);
    return () => mediaQuery.removeEventListener('change', updateMatch);
  }, [query]);

  return matches;
}

function FaceCard({
  submission,
  priority,
  reduceMotion,
}: {
  submission: CleanAirSubmissionWithId;
  priority: boolean;
  reduceMotion: boolean | null;
}) {
  const displayName =
    submission.displayName?.trim() ||
    submission.locationName?.trim() ||
    'Clean Air Champion';

  const location =
    submission.locationName?.trim() || 'Pretoria, Gauteng, South Africa';

  return (
    <motion.article
      layout
      variants={cardVariants}
      transition={{
        duration: reduceMotion ? 0 : 0.68,
        ease: [0.22, 1, 0.36, 1],
      }}
      whileHover={
        reduceMotion
          ? undefined
          : {
              y: -8,
              scale: 1.015,
              transition: { type: 'spring', stiffness: 240, damping: 24 },
            }
      }
      whileTap={reduceMotion ? undefined : { scale: 0.986 }}
      className="group relative aspect-square w-full overflow-hidden rounded-xl border border-white/15 bg-[#005257] shadow-[0_28px_70px_-35px_rgba(2,6,23,0.95)] [transform-style:preserve-3d] will-change-transform"
    >
      <Image
        src={submission.imageUrl}
        alt={`${displayName} at ${location}`}
        fill
        priority={priority}
        unoptimized
        className="object-contain transition-transform duration-1000 ease-out sm:group-hover:scale-[1.05]"
        sizes="(max-width: 639px) 86vw, (max-width: 1023px) 42vw, (max-width: 1279px) 25vw, 22vw"
      />
    </motion.article>
  );
}

function SkeletonCard({
  index,
  reduceMotion,
}: {
  index: number;
  reduceMotion: boolean | null;
}) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: reduceMotion ? 0 : 0.62,
        delay: reduceMotion ? 0 : index * 0.075,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative aspect-square w-full overflow-hidden rounded-xl border border-white/15 bg-white/20 shadow-[0_24px_60px_-32px_rgba(2,6,23,0.8)] backdrop-blur-md"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-[#39BFC7]/15 to-[#39BFC7]/20" />

      {!reduceMotion && (
        <motion.div
          className="absolute inset-y-0 -left-[75%] w-[65%] skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/45 to-transparent"
          animate={{ x: ['0%', '330%'] }}
          transition={{
            duration: 2.15,
            delay: index * 0.1,
            repeat: Infinity,
            repeatDelay: 0.7,
            ease: 'easeInOut',
          }}
        />
      )}

      <div className="absolute left-3 top-3 flex items-center gap-2">
        <div className="h-6 w-10 rounded-full bg-white/35" />
        <div className="space-y-1">
          <div className="h-2 w-16 rounded-full bg-white/35" />
          <div className="h-2 w-12 rounded-full bg-white/25" />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-[#005257]/80 via-[#39BFC7]/50 to-transparent" />

      <div className="absolute inset-x-3 bottom-3 space-y-2">
        <div className="h-5 w-3/4 rounded-full bg-white/45" />
        <div className="h-2 w-1/2 rounded-full bg-white/30" />
        <div className="flex items-end gap-2">
          <div className="h-8 w-16 rounded-lg bg-white/45" />
          <div className="h-4 w-14 rounded-full bg-white/35" />
        </div>
        <div className="flex justify-between border-t border-white/15 pt-2">
          <div className="h-4 w-24 rounded-full bg-white/35" />
          <div className="h-3 w-20 rounded-full bg-white/25" />
        </div>
      </div>
    </motion.div>
  );
}

function EmptyState({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 26, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -16, scale: 0.97 }}
      transition={{
        duration: reduceMotion ? 0 : 0.68,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="mx-auto flex min-h-[200px] w-[90vw] max-w-[520px] flex-col items-center justify-center rounded-2xl border border-white/20 bg-white/15 px-5 py-7 text-center shadow-[0_30px_80px_-45px_rgba(2,6,23,0.85)] backdrop-blur-xl sm:min-h-[240px] sm:w-full sm:px-8 sm:py-10"
    >
      <div className="relative mb-4 flex h-14 w-14 items-center justify-center sm:mb-5 sm:h-16 sm:w-16">
        {!reduceMotion && (
          <>
            <motion.span
              className="absolute inset-0 rounded-full border border-white/25"
              animate={{ scale: [1, 1.65], opacity: [0.55, 0] }}
              transition={{
                duration: 2.6,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
            <motion.span
              className="absolute inset-0 rounded-full border border-[#39BFC7]/30"
              animate={{ scale: [1, 1.45], opacity: [0.45, 0] }}
              transition={{
                duration: 2.6,
                delay: 0.9,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />
          </>
        )}

        <motion.div
          animate={
            reduceMotion ? undefined : { y: [0, -4, 0], rotate: [0, -2, 2, 0] }
          }
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-white/20 shadow-lg backdrop-blur-md sm:h-14 sm:w-14"
        >
          <FiCamera className="h-6 w-6 text-white sm:h-7 sm:w-7" />
        </motion.div>
      </div>

      <h2 className="text-lg font-bold text-white sm:text-xl">
        No selfies yet
      </h2>

      <p className="mt-2 max-w-sm text-xs leading-5 text-[#072b31]/70 sm:text-sm sm:leading-6">
        Be the first to share an air quality selfie from the Africa Clean Air
        Forum.
      </p>
    </motion.div>
  );
}

function ErrorState({
  onRetry,
  reduceMotion,
}: {
  onRetry: () => void;
  reduceMotion: boolean | null;
}) {
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 22, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -14, scale: 0.98 }}
      role="alert"
      transition={{
        duration: reduceMotion ? 0 : 0.64,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="mx-auto flex min-h-[200px] w-[90vw] max-w-[520px] flex-col items-center justify-center rounded-2xl border border-white/20 bg-white/15 px-5 py-7 text-center shadow-[0_30px_80px_-45px_rgba(2,6,23,0.85)] backdrop-blur-xl sm:min-h-[240px] sm:w-full sm:px-8 sm:py-10"
    >
      <h2 className="text-lg font-bold text-white sm:text-xl">
        Could not load selfies
      </h2>

      <p className="mt-2 text-xs leading-5 text-[#072b31]/70 sm:text-sm sm:leading-6">
        Please check the connection and try again.
      </p>

      <motion.button
        type="button"
        onClick={onRetry}
        whileHover={reduceMotion ? undefined : { scale: 1.04, y: -2 }}
        whileTap={reduceMotion ? undefined : { scale: 0.96 }}
        className="mt-5 rounded-lg bg-[#39BFC7] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[#005257]/20 transition-colors hover:bg-[#39BFC7]/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#39BFC7]"
      >
        Try again
      </motion.button>
    </motion.div>
  );
}

function DesktopPagination({
  page,
  totalPages,
  isPaused,
  reduceMotion,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  isPaused: boolean;
  reduceMotion: boolean | null;
  onPageChange: (page: number) => void;
}) {
  return (
    <nav
      className="mt-8 hidden items-center justify-center gap-3 sm:flex"
      aria-label="Selfie carousel pages"
    >
      {Array.from({ length: totalPages }).map((_, index) => {
        const isActive = index === page;

        return (
          <motion.button
            layout
            key={index}
            type="button"
            onClick={() => onPageChange(index)}
            aria-label={`Show selfie page ${index + 1} of ${totalPages}`}
            aria-current={isActive ? 'page' : undefined}
            whileHover={reduceMotion ? undefined : { scale: 1.1, y: -1 }}
            whileTap={reduceMotion ? undefined : { scale: 0.92 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className={`relative h-2.5 overflow-hidden rounded-full border border-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
              isActive
                ? 'w-11 bg-white/30'
                : 'w-2.5 bg-white/30 hover:bg-white/50'
            }`}
          >
            {isActive && (
              <>
                <motion.span
                  layoutId="active-selfies-indicator"
                  className="absolute inset-0 rounded-full bg-[#39BFC7]/20"
                  transition={{
                    type: 'spring',
                    stiffness: 320,
                    damping: 32,
                  }}
                />

                {!reduceMotion && !isPaused && (
                  <motion.span
                    key={`desktop-progress-${page}`}
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{
                      duration: CAROUSEL_INTERVAL_MS / 1000,
                      ease: 'linear',
                    }}
                    className="absolute inset-0 origin-left rounded-full bg-[#39BFC7]"
                  />
                )}

                {(reduceMotion || isPaused) && (
                  <span className="absolute inset-0 rounded-full bg-[#39BFC7]" />
                )}
              </>
            )}
          </motion.button>
        );
      })}
    </nav>
  );
}

function MobilePagination({
  page,
  totalPages,
  reduceMotion,
}: {
  page: number;
  totalPages: number;
  reduceMotion: boolean | null;
}) {
  return (
    <div
      className="mt-3 flex items-center justify-center gap-3 sm:hidden"
      aria-label={`Selfie ${page + 1} of ${totalPages}`}
    >
      <div className="h-1.5 w-24 overflow-hidden rounded-full bg-white/20">
        <motion.div
          key={`mobile-progress-${page}`}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{
            duration: reduceMotion ? 0 : CAROUSEL_INTERVAL_MS / 1000,
            ease: 'linear',
          }}
          className="h-full origin-left rounded-full bg-white"
        />
      </div>

      <span className="min-w-[38px] text-center text-[11px] font-semibold tabular-nums text-white/85">
        {page + 1}/{totalPages}
      </span>
    </div>
  );
}

export default function SelfiesScreen() {
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);

  const [submissions, setSubmissions] = useState<CleanAirSubmissionWithId[]>(
    [],
  );
  const [fetchState, setFetchState] = useState<FetchState>('idle');
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isPaused, setIsPaused] = useState(false);

  const hasLoadedRef = useRef(false);

  const fetchSubmissions = useCallback(async () => {
    if (!hasLoadedRef.current) {
      setFetchState('loading');
    }

    try {
      const data = await facesOfCleanAirService.getSubmissions(
        CLEAN_AIR_FORUM_CURRENT_EVENT_ID,
      );
      setSubmissions(Array.isArray(data) ? data : []);
      setFetchState('success');
      hasLoadedRef.current = true;
    } catch (error) {
      console.error('Failed to load selfies:', error);
      if (!hasLoadedRef.current) {
        setFetchState('error');
      }
    }
  }, []);

  usePollingWithVisibility(
    fetchSubmissions,
    CLEAN_AIR_FORUM_WALL_ACTIVE_POLL_INTERVAL_MS,
  );

  const totalSlides = useMemo(() => {
    if (isMobile) {
      return Math.max(1, submissions.length);
    }
    return Math.max(1, Math.ceil(submissions.length / DESKTOP_CARDS_PER_PAGE));
  }, [isMobile, submissions.length]);

  const visibleItems = useMemo(() => {
    if (isMobile) {
      return submissions.slice(page, page + 1);
    }
    const startIndex = page * DESKTOP_CARDS_PER_PAGE;
    return submissions.slice(startIndex, startIndex + DESKTOP_CARDS_PER_PAGE);
  }, [isMobile, page, submissions]);

  useEffect(() => {
    setPage(0);
    setDirection(1);
    setIsPaused(false);
  }, [isMobile]);

  useEffect(() => {
    setPage((currentPage) => Math.min(currentPage, totalSlides - 1));
  }, [totalSlides]);

  const goToPage = useCallback(
    (nextPage: number) => {
      if (nextPage === page || nextPage < 0 || nextPage >= totalSlides) {
        return;
      }
      setDirection(nextPage > page ? 1 : -1);
      setPage(nextPage);
    },
    [page, totalSlides],
  );

  const goToRelativePage = useCallback(
    (offset: number) => {
      if (totalSlides <= 1) {
        return;
      }
      const nextPage = (page + offset + totalSlides) % totalSlides;
      setDirection(offset > 0 ? 1 : -1);
      setPage(nextPage);
    },
    [page, totalSlides],
  );

  useEffect(() => {
    if (fetchState !== 'success' || isPaused || shouldReduceMotion) {
      return;
    }

    const carouselTimer = window.setTimeout(() => {
      if (totalSlides > 1 && page < totalSlides - 1) {
        goToRelativePage(1);
        return;
      }
      goToRelativePage(1);
    }, CAROUSEL_INTERVAL_MS);

    return () => {
      window.clearTimeout(carouselTimer);
    };
  }, [
    fetchState,
    goToRelativePage,
    isPaused,
    page,
    shouldReduceMotion,
    totalSlides,
  ]);

  const handleCarouselKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
      if (totalSlides <= 1) {
        return;
      }
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
      if (totalSlides <= 1) {
        return;
      }
      const movedLeft =
        info.offset.x < -SWIPE_DISTANCE_THRESHOLD ||
        info.velocity.x < -SWIPE_VELOCITY_THRESHOLD;
      const movedRight =
        info.offset.x > SWIPE_DISTANCE_THRESHOLD ||
        info.velocity.x > SWIPE_VELOCITY_THRESHOLD;

      if (movedLeft) {
        goToRelativePage(1);
      } else if (movedRight) {
        goToRelativePage(-1);
      }
    },
    [goToRelativePage, totalSlides],
  );

  const pageVariants: Variants = {
    enter: (slideDirection: number) => ({
      x: shouldReduceMotion
        ? 0
        : slideDirection > 0
          ? isMobile
            ? 78
            : 120
          : isMobile
            ? -78
            : -120,
      rotateY: shouldReduceMotion
        ? 0
        : isMobile
          ? slideDirection > 0
            ? 9
            : -9
          : 0,
      opacity: 0,
      scale: isMobile ? 0.92 : 0.96,
    }),
    center: {
      x: 0,
      rotateY: 0,
      opacity: 1,
      scale: 1,
      transition: {
        duration: shouldReduceMotion ? 0 : isMobile ? 0.82 : 0.74,
        ease: [0.22, 1, 0.36, 1],
        staggerChildren: shouldReduceMotion ? 0 : isMobile ? 0 : 0.08,
        delayChildren: shouldReduceMotion ? 0 : isMobile ? 0 : 0.07,
      },
    },
    exit: (slideDirection: number) => ({
      x: shouldReduceMotion
        ? 0
        : slideDirection > 0
          ? isMobile
            ? -72
            : -100
          : isMobile
            ? 72
            : 100,
      rotateY: shouldReduceMotion
        ? 0
        : isMobile
          ? slideDirection > 0
            ? -8
            : 8
          : 0,
      opacity: 0,
      scale: isMobile ? 0.94 : 0.972,
      transition: {
        duration: shouldReduceMotion ? 0 : isMobile ? 0.56 : 0.46,
        ease: [0.4, 0, 1, 1],
        staggerChildren: shouldReduceMotion ? 0 : isMobile ? 0 : 0.035,
        staggerDirection: -1,
      },
    }),
  };

  const isInitialLoading = fetchState === 'idle' || fetchState === 'loading';
  const showError = fetchState === 'error' && submissions.length === 0;
  const showEmpty = fetchState === 'success' && submissions.length === 0;
  const skeletonCount = isMobile ? 1 : DESKTOP_CARDS_PER_PAGE;

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

          <div className="min-w-0 overflow-hidden">
            <motion.h1
              variants={headerItemVariants}
              className="whitespace-nowrap text-left leading-none text-white"
            >
              <span
                className="text-[clamp(1.2rem,2.6vw,2.6rem)] font-normal tracking-[-0.05em]"
                style={{
                  fontFamily:
                    '"Brush Script MT", "Segoe Script", "URW Chancery L", cursive',
                }}
              >
                Faces of{' '}
              </span>
              <span className="text-[clamp(1.1rem,2.5vw,2.5rem)] font-extrabold tracking-[-0.045em]">
                Air Quality
              </span>
            </motion.h1>

            <motion.div
              variants={headerItemVariants}
              className="mt-1 text-[9px] leading-tight text-white/85 sm:hidden"
            >
              <span className="font-bold">{EVENT_LABEL}</span>
              <span aria-hidden="true"> • </span>
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

        <main className="mx-auto flex w-full max-w-[1200px] flex-1 flex-col items-center justify-center overflow-hidden pt-6 sm:pt-10">
          <section
            tabIndex={0}
            aria-label="Faces of Air Quality selfie carousel"
            aria-roledescription="carousel"
            className="flex w-full flex-col items-center"
            onKeyDown={handleCarouselKeyDown}
            onMouseEnter={() => {
              if (!isMobile) setIsPaused(true);
            }}
            onMouseLeave={() => {
              if (!isMobile) setIsPaused(false);
            }}
            onFocusCapture={() => {
              if (!isMobile) setIsPaused(true);
            }}
            onBlurCapture={() => {
              if (!isMobile) setIsPaused(false);
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isInitialLoading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.985 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.64,
                  }}
                  className={
                    isMobile
                      ? 'flex w-full items-center justify-center'
                      : 'grid grid-cols-1 justify-items-center gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-8'
                  }
                >
                  {Array.from({ length: skeletonCount }).map((_, index) => (
                    <div
                      key={index}
                      className={
                        isMobile
                          ? 'w-full'
                          : 'w-full max-w-[320px] lg:max-w-[360px] xl:max-w-[400px]'
                      }
                      style={
                        isMobile
                          ? {
                              width: 'min(86vw, calc(100svh - 205px), 360px)',
                            }
                          : undefined
                      }
                    >
                      <SkeletonCard
                        index={index}
                        reduceMotion={shouldReduceMotion}
                      />
                    </div>
                  ))}
                </motion.div>
              )}

              {showError && (
                <ErrorState
                  key="error"
                  reduceMotion={shouldReduceMotion}
                  onRetry={() => void fetchSubmissions()}
                />
              )}

              {showEmpty && (
                <EmptyState key="empty" reduceMotion={shouldReduceMotion} />
              )}

              {!isInitialLoading && !showError && !showEmpty ? (
                <motion.div
                  key="content"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.68,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="flex w-full flex-col items-center"
                >
                  <AnimatePresence
                    initial={false}
                    mode="wait"
                    custom={direction}
                  >
                    <motion.div
                      key={`${isMobile ? 'mobile' : 'desktop'}-${page}`}
                      custom={direction}
                      variants={pageVariants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      aria-live="polite"
                      drag={
                        totalSlides > 1 && !shouldReduceMotion ? 'x' : false
                      }
                      dragConstraints={{ left: 0, right: 0 }}
                      dragElastic={isMobile ? 0.2 : 0.14}
                      dragMomentum={false}
                      onDragEnd={handleDragEnd}
                      style={{ transformPerspective: 1200 }}
                      className={
                        isMobile
                          ? 'flex touch-pan-y cursor-grab items-center justify-center active:cursor-grabbing'
                          : 'grid touch-pan-y cursor-grab grid-cols-1 justify-items-center gap-4 active:cursor-grabbing sm:grid-cols-2 md:gap-6 lg:grid-cols-3 xl:grid-cols-4 xl:gap-8'
                      }
                    >
                      {visibleItems.map((submission, index) => (
                        <div
                          key={submission.id}
                          className={
                            isMobile
                              ? 'w-full'
                              : 'w-full max-w-[320px] lg:max-w-[360px] xl:max-w-[400px]'
                          }
                          style={
                            isMobile
                              ? {
                                  width:
                                    'min(86vw, calc(100svh - 205px), 360px)',
                                }
                              : undefined
                          }
                        >
                          <FaceCard
                            submission={submission}
                            priority={
                              isMobile ? page === 0 : page === 0 && index < 3
                            }
                            reduceMotion={shouldReduceMotion}
                          />
                        </div>
                      ))}
                    </motion.div>
                  </AnimatePresence>

                  {totalSlides > 1 && (
                    <>
                      <MobilePagination
                        page={page}
                        totalPages={totalSlides}
                        reduceMotion={shouldReduceMotion}
                      />

                      <DesktopPagination
                        page={page}
                        totalPages={totalSlides}
                        isPaused={isPaused}
                        reduceMotion={shouldReduceMotion}
                        onPageChange={goToPage}
                      />
                    </>
                  )}
                </motion.div>
              ) : null}
            </AnimatePresence>
          </section>
        </main>

        <QrCodeButton src="/clean-air-forum-2026/cleanair.jpeg" />
      </div>
    </div>
  );
}
