'use client';

import {
  motion,
  type PanInfo,
  useMotionValue,
  useSpring,
  useTransform,
  type Variants,
} from 'framer-motion';
import Image from 'next/image';
import {
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { FiCamera } from 'react-icons/fi';

import type { CleanAirSubmissionWithId } from '@/services/external/faces-of-clean-air.service';

export const CAROUSEL_INTERVAL_MS = 7600;
export const SWIPE_DISTANCE_THRESHOLD = 70;
export const SWIPE_VELOCITY_THRESHOLD = 500;
export const MOBILE_MEDIA_QUERY = '(max-width: 639px)';
export const DESKTOP_CARDS_PER_PAGE = 8;

const SMOOTH_SPRING = { stiffness: 150, damping: 25, mass: 0.9 };

export const headerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { delayChildren: 0.1, staggerChildren: 0.16 },
  },
};

export const headerItemVariants: Variants = {
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

export function useMediaQuery(query: string): boolean {
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

export function FaceCard({
  submission,
  priority,
  reduceMotion,
}: {
  submission: CleanAirSubmissionWithId;
  priority: boolean;
  reduceMotion: boolean | null;
}) {
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);

  const transformedRotateX = useTransform(pointerY, [0, 1], [5, -5]);
  const transformedRotateY = useTransform(pointerX, [0, 1], [-5, 5]);

  const rotateX = useSpring(transformedRotateX, SMOOTH_SPRING);
  const rotateY = useSpring(transformedRotateY, SMOOTH_SPRING);

  const displayName =
    submission.displayName?.trim() ||
    submission.locationName?.trim() ||
    'Clean Air Champion';

  const location =
    submission.locationName?.trim() || 'the Africa Clean Air Forum';

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (reduceMotion || event.pointerType !== 'mouse') return;

      const cardBounds = event.currentTarget.getBoundingClientRect();
      const relativeX = (event.clientX - cardBounds.left) / cardBounds.width;
      const relativeY = (event.clientY - cardBounds.top) / cardBounds.height;

      pointerX.set(Math.min(Math.max(relativeX, 0), 1));
      pointerY.set(Math.min(Math.max(relativeY, 0), 1));
    },
    [pointerX, pointerY, reduceMotion],
  );

  const resetPointerPosition = useCallback(() => {
    pointerX.set(0.5);
    pointerY.set(0.5);
  }, [pointerX, pointerY]);

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
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointerPosition}
      style={{
        rotateX: reduceMotion ? 0 : rotateX,
        rotateY: reduceMotion ? 0 : rotateY,
        transformPerspective: 1000,
      }}
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

export function SkeletonCard({
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

export function SelfieEmptyState({
  reduceMotion,
}: {
  reduceMotion: boolean | null;
}) {
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
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeOut' }}
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
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-white/20 shadow-lg backdrop-blur-md sm:h-14 sm:w-14"
        >
          <FiCamera className="h-6 w-6 text-white sm:h-7 sm:w-7" />
        </motion.div>
      </div>

      <h2 className="text-lg font-bold text-white sm:text-xl">No faces yet</h2>

      <p className="mt-2 max-w-sm text-xs leading-5 text-[#072b31]/70 sm:text-sm sm:leading-6">
        Be the first to share an air quality selfie from the Africa Clean Air
        Forum.
      </p>
    </motion.div>
  );
}

export function SelfieErrorState({
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

export function SelfieDesktopPagination({
  page,
  totalPages,
  isPaused,
  reduceMotion,
  onPageChange,
  layoutId = 'active-carousel-indicator',
}: {
  page: number;
  totalPages: number;
  isPaused: boolean;
  reduceMotion: boolean | null;
  onPageChange: (page: number) => void;
  layoutId?: string;
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
                  layoutId={layoutId}
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

export function SelfieMobilePagination({
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

export function useSelfieCarouselKeyboard(
  totalSlides: number,
  goToRelativePage: (offset: number) => void,
) {
  return useCallback(
    (event: KeyboardEvent<HTMLElement>) => {
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
}

export function useSelfieDragEnd(
  totalSlides: number,
  goToRelativePage: (offset: number) => void,
) {
  return useCallback(
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
}
