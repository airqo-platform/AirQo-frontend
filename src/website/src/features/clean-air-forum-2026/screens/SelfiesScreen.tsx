'use client';

import { AnimatePresence, motion, type Variants } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import AmbientBackground from '@/components/clean-air-forum-2026/AmbientBackground';
import QrCodeButton from '@/components/clean-air-forum-2026/QrCodeButton';
import {
  CAROUSEL_INTERVAL_MS,
  DESKTOP_CARDS_PER_PAGE,
  FaceCard,
  headerContainerVariants,
  headerItemVariants,
  MOBILE_MEDIA_QUERY,
  SelfieDesktopPagination,
  SelfieEmptyState,
  SelfieErrorState,
  SelfieMobilePagination,
  SkeletonCard,
  useMediaQuery,
  useSelfieCarouselKeyboard,
  useSelfieDragEnd,
} from '@/components/clean-air-forum-2026/selfie-components';
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

type FetchState = 'idle' | 'loading' | 'success' | 'error';

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
    if (!hasLoadedRef.current) setFetchState('loading');

    try {
      const data = await facesOfCleanAirService.getSubmissions(
        CLEAN_AIR_FORUM_CURRENT_EVENT_ID,
      );
      setSubmissions(Array.isArray(data) ? data : []);
      setFetchState('success');
      hasLoadedRef.current = true;
    } catch (error) {
      console.error('Failed to load selfies:', error);
      if (!hasLoadedRef.current) setFetchState('error');
    }
  }, []);

  usePollingWithVisibility(
    fetchSubmissions,
    CLEAN_AIR_FORUM_WALL_ACTIVE_POLL_INTERVAL_MS,
  );

  const totalSlides = useMemo(() => {
    if (isMobile) return Math.max(1, submissions.length);
    return Math.max(1, Math.ceil(submissions.length / DESKTOP_CARDS_PER_PAGE));
  }, [isMobile, submissions.length]);

  const visibleItems = useMemo(() => {
    if (isMobile) return submissions.slice(page, page + 1);
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
      if (nextPage === page || nextPage < 0 || nextPage >= totalSlides) return;
      setDirection(nextPage > page ? 1 : -1);
      setPage(nextPage);
    },
    [page, totalSlides],
  );

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
    if (fetchState !== 'success' || isPaused || shouldReduceMotion) return;

    const carouselTimer = window.setTimeout(() => {
      if (totalSlides > 1 && page < totalSlides - 1) {
        goToRelativePage(1);
        return;
      }
      goToRelativePage(1);
    }, CAROUSEL_INTERVAL_MS);

    return () => window.clearTimeout(carouselTimer);
  }, [
    fetchState,
    goToRelativePage,
    isPaused,
    page,
    shouldReduceMotion,
    totalSlides,
  ]);

  const handleCarouselKeyDown = useSelfieCarouselKeyboard(
    totalSlides,
    goToRelativePage,
  );
  const handleDragEnd = useSelfieDragEnd(totalSlides, goToRelativePage);

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

        <main className="mx-auto flex min-h-0 w-full max-w-[1200px] flex-1 items-center justify-center pt-2 sm:min-h-[60svh] sm:flex-none sm:pt-10">
          <section
            tabIndex={0}
            aria-label="Faces of Air Quality selfie carousel"
            aria-roledescription="carousel"
            className="flex h-full w-full min-h-0 flex-col justify-center overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent sm:block sm:h-auto"
            onKeyDown={handleCarouselKeyDown}
            onMouseEnter={() => !isMobile && setIsPaused(true)}
            onMouseLeave={() => !isMobile && setIsPaused(false)}
            onFocusCapture={() => !isMobile && setIsPaused(true)}
            onBlurCapture={() => !isMobile && setIsPaused(false)}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isInitialLoading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, scale: 0.985 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.64 }}
                  className={
                    isMobile
                      ? 'flex h-full min-h-0 w-full flex-1 items-center justify-center'
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
                <SelfieErrorState
                  key="error"
                  reduceMotion={shouldReduceMotion}
                  onRetry={() => void fetchSubmissions()}
                />
              )}

              {showEmpty && (
                <SelfieEmptyState
                  key="empty"
                  reduceMotion={shouldReduceMotion}
                />
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
                  className={
                    isMobile
                      ? 'flex h-full min-h-0 flex-col items-center justify-center'
                      : undefined
                  }
                >
                  <div
                    className={
                      isMobile
                        ? 'flex min-h-0 w-full flex-1 items-center justify-center'
                        : undefined
                    }
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
                  </div>

                  {totalSlides > 1 && (
                    <>
                      <SelfieMobilePagination
                        page={page}
                        totalPages={totalSlides}
                        reduceMotion={shouldReduceMotion}
                      />

                      <SelfieDesktopPagination
                        page={page}
                        totalPages={totalSlides}
                        isPaused={isPaused}
                        reduceMotion={shouldReduceMotion}
                        onPageChange={goToPage}
                        layoutId="active-selfies-indicator"
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
