'use client';

import {
  AnimatePresence,
  motion,
  type PanInfo,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type Variants,
} from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
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

const DESKTOP_CARDS_PER_PAGE = 6;
const CAROUSEL_INTERVAL_MS = 7600;

const SWIPE_DISTANCE_THRESHOLD = 70;
const SWIPE_VELOCITY_THRESHOLD = 500;
const MOBILE_MEDIA_QUERY = '(max-width: 639px)';

const EVENT_LABEL = 'Africa CLEAN-Air Forum';
const EVENT_LOCATION_AND_YEAR = 'Pretoria 2026';
const EVENT_DATES_BADGE = '13TH-16TH JULY';

const SMOOTH_SPRING = {
  stiffness: 150,
  damping: 25,
  mass: 0.9,
};

type FetchState = 'idle' | 'loading' | 'success' | 'error';

type CategoryStyle = {
  label: string;
  className: string;
};

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    const updateMatch = () => {
      setMatches(mediaQuery.matches);
    };

    updateMatch();
    mediaQuery.addEventListener('change', updateMatch);

    return () => {
      mediaQuery.removeEventListener('change', updateMatch);
    };
  }, [query]);

  return matches;
}

function formatPm25(value: number | null | undefined): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return '--';
  }

  return value.toFixed(1);
}

function getFallbackCategory(pm25: number): CategoryStyle {
  if (pm25 <= 12) {
    return {
      label: 'Good',
      className: 'bg-emerald-100 text-emerald-700',
    };
  }

  if (pm25 <= 35.4) {
    return {
      label: 'Moderate',
      className: 'bg-amber-100 text-amber-700',
    };
  }

  if (pm25 <= 55.4) {
    return {
      label: 'Sensitive',
      className: 'bg-orange-100 text-orange-700',
    };
  }

  return {
    label: 'Unhealthy',
    className: 'bg-red-100 text-red-700',
  };
}

function getCategoryStyle(
  category: string | null | undefined,
  pm25: number,
): CategoryStyle {
  const normalizedCategory = category?.trim().toLowerCase();

  if (!normalizedCategory) {
    return getFallbackCategory(pm25);
  }

  if (normalizedCategory.includes('good')) {
    return {
      label: category!,
      className: 'bg-emerald-100 text-emerald-700',
    };
  }

  if (normalizedCategory.includes('moderate')) {
    return {
      label: category!,
      className: 'bg-amber-100 text-amber-700',
    };
  }

  if (normalizedCategory.includes('sensitive')) {
    return {
      label: category!,
      className: 'bg-orange-100 text-orange-700',
    };
  }

  return {
    label: category!,
    className: 'bg-red-100 text-red-700',
  };
}

function AmbientBackground({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Main grid lines */}
      <div
        className="absolute inset-0 opacity-[0.1]"
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(255, 255, 255, 0.32) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.32) 1px,
              transparent 1px
            )
          `,
          backgroundSize: '72px 72px',
          maskImage:
            'linear-gradient(to bottom, black 0%, black 45%, transparent 84%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, black 0%, black 45%, transparent 84%)',
        }}
      />

      {/* Fine secondary grid */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(255, 255, 255, 0.45) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(255, 255, 255, 0.45) 1px,
              transparent 1px
            )
          `,
          backgroundSize: '24px 24px',
          maskImage: 'linear-gradient(to bottom, black 0%, transparent 70%)',
          WebkitMaskImage:
            'linear-gradient(to bottom, black 0%, transparent 70%)',
        }}
      />

      {/* Right atmospheric glow */}
      <motion.div
        className="absolute -right-[55%] top-[5%] h-[420px] w-[420px] rounded-full bg-blue-300/20 blur-[100px] sm:-right-[14%] sm:h-[540px] sm:w-[540px] sm:blur-[110px]"
        animate={
          reduceMotion
            ? undefined
            : {
                x: [0, -38, 14, 0],
                y: [0, 26, -12, 0],
                scale: [1, 1.09, 0.97, 1],
              }
        }
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Left atmospheric glow */}
      <motion.div
        className="absolute -left-[60%] top-[28%] h-[380px] w-[380px] rounded-full bg-cyan-300/12 blur-[100px] sm:-left-[13%] sm:top-[20%] sm:h-[450px] sm:w-[450px] sm:blur-[115px]"
        animate={
          reduceMotion
            ? undefined
            : {
                x: [0, 45, -8, 0],
                y: [0, -22, 28, 0],
                scale: [1, 0.94, 1.06, 1],
              }
        }
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      {/* Travelling soft light */}
      <motion.div
        className="absolute left-[28%] top-[17%] h-32 w-32 rounded-full bg-white/10 blur-[60px] sm:left-[34%] sm:top-[12%] sm:h-40 sm:w-40 sm:blur-[68px]"
        animate={
          reduceMotion
            ? undefined
            : {
                x: [-45, 120, -15, -45],
                y: [0, 58, -26, 0],
                opacity: [0.2, 0.5, 0.28, 0.2],
              }
        }
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="absolute inset-x-0 bottom-0 h-[30%] bg-gradient-to-b from-transparent via-white/15 to-white/70 sm:h-[36%] sm:via-white/20 sm:to-white/80" />
    </div>
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
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              y: 24,
              scale: 0.96,
              filter: 'blur(6px)',
            }
      }
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
      }}
      transition={{
        duration: reduceMotion ? 0 : 0.62,
        delay: reduceMotion ? 0 : index * 0.075,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="relative aspect-square w-full overflow-hidden rounded-xl border border-white/15 bg-white/20 shadow-[0_24px_60px_-32px_rgba(2,6,23,0.8)] backdrop-blur-md"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-blue-100/15 to-blue-600/20" />

      {!reduceMotion && (
        <motion.div
          className="absolute inset-y-0 -left-[75%] w-[65%] skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/45 to-transparent"
          animate={{
            x: ['0%', '330%'],
          }}
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

      <div className="absolute inset-x-0 bottom-0 h-[50%] bg-gradient-to-t from-blue-700/80 via-blue-600/50 to-transparent" />

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

const cardVariants: Variants = {
  enter: {
    opacity: 0,
    y: 28,
    scale: 0.94,
    filter: 'blur(9px)',
  },
  center: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: 'blur(0px)',
  },
  exit: {
    opacity: 0,
    y: -16,
    scale: 0.96,
    filter: 'blur(6px)',
  },
};

function FaceCard({
  submission,
  priority,
  reduceMotion,
}: {
  submission: CleanAirSubmission;
  priority: boolean;
  reduceMotion: boolean | null;
}) {
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);

  const transformedRotateX = useTransform(pointerY, [0, 1], [5, -5]);
  const transformedRotateY = useTransform(pointerX, [0, 1], [-5, 5]);

  const rotateX = useSpring(transformedRotateX, SMOOTH_SPRING);
  const rotateY = useSpring(transformedRotateY, SMOOTH_SPRING);

  const glareX = useTransform(pointerX, [0, 1], [0, 100]);
  const glareY = useTransform(pointerY, [0, 1], [0, 100]);

  const glareBackground = useMotionTemplate`
    radial-gradient(
      circle at ${glareX}% ${glareY}%,
      rgba(255,255,255,0.30) 0%,
      rgba(255,255,255,0.12) 16%,
      rgba(255,255,255,0) 44%
    )
  `;

  const pm25 = submission.pm25Value ?? 0;
  const category = getCategoryStyle(submission.aqiCategory, pm25);

  const displayName =
    submission.displayName?.trim() ||
    submission.locationName?.trim() ||
    'Clean Air Champion';

  const location =
    submission.locationName?.trim() || 'Pretoria, Gauteng, South Africa';

  const handlePointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (reduceMotion || event.pointerType !== 'mouse') {
        return;
      }

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
              transition: {
                type: 'spring',
                stiffness: 240,
                damping: 24,
              },
            }
      }
      whileTap={
        reduceMotion
          ? undefined
          : {
              scale: 0.986,
            }
      }
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointerPosition}
      style={{
        rotateX: reduceMotion ? 0 : rotateX,
        rotateY: reduceMotion ? 0 : rotateY,
        transformPerspective: 1000,
      }}
      className="group relative aspect-square w-full overflow-hidden rounded-xl border border-white/15 bg-blue-950 shadow-[0_28px_70px_-35px_rgba(2,6,23,0.95)] [transform-style:preserve-3d] will-change-transform"
    >
      <Image
        src={submission.imageUrl}
        alt={`${displayName} at ${location}`}
        fill
        priority={priority}
        unoptimized
        className="object-cover transition-transform duration-1000 ease-out sm:group-hover:scale-[1.05]"
        sizes="(max-width: 639px) 86vw, (min-width: 1280px) 280px, (min-width: 1024px) 25vw, 42vw"
      />

      <div className="absolute inset-x-0 top-0 h-[31%] bg-gradient-to-b from-black/35 via-black/10 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 h-[51%] bg-gradient-to-t from-blue-800 via-blue-600/95 via-[58%] to-transparent" />

      {!reduceMotion && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 mix-blend-screen"
          style={{
            backgroundImage: glareBackground,
          }}
        />
      )}

      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[1px] rounded-[11px] ring-1 ring-inset ring-white/10"
        animate={
          reduceMotion
            ? undefined
            : {
                boxShadow: [
                  'inset 0 0 0 rgba(255,255,255,0)',
                  'inset 0 0 24px rgba(255,255,255,0.05)',
                  'inset 0 0 0 rgba(255,255,255,0)',
                ],
              }
        }
        transition={{
          duration: 5.2,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

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
        <motion.div
          initial={false}
          whileHover={
            reduceMotion
              ? undefined
              : {
                  x: 2,
                }
          }
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 25,
          }}
        >
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
        </motion.div>

        <div className="mt-1.5 flex items-end gap-2">
          <motion.span
            className="text-[28px] font-bold leading-none tracking-[-0.03em] sm:text-[30px]"
            whileHover={
              reduceMotion
                ? undefined
                : {
                    scale: 1.04,
                    x: 1,
                  }
            }
          >
            {formatPm25(submission.pm25Value)}
          </motion.span>

          <div className="mb-0.5 flex min-w-0 items-center gap-1.5">
            <span className="whitespace-nowrap text-[6px] font-semibold text-white/85 sm:text-[7px]">
              PM2.5 µg/m³
            </span>

            <motion.span
              whileHover={
                reduceMotion
                  ? undefined
                  : {
                      scale: 1.07,
                    }
              }
              className={`max-w-[92px] truncate rounded-full px-1.5 py-0.5 text-[6px] font-semibold sm:text-[7px] ${category.className}`}
              title={category.label}
            >
              {category.label}
            </motion.span>
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

function EmptyState({ reduceMotion }: { reduceMotion: boolean | null }) {
  return (
    <motion.div
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              y: 26,
              scale: 0.96,
              filter: 'blur(8px)',
            }
      }
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
      }}
      exit={{
        opacity: 0,
        y: -16,
        scale: 0.97,
        filter: 'blur(5px)',
      }}
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
              animate={{
                scale: [1, 1.65],
                opacity: [0.55, 0],
              }}
              transition={{
                duration: 2.6,
                repeat: Infinity,
                ease: 'easeOut',
              }}
            />

            <motion.span
              className="absolute inset-0 rounded-full border border-blue-200/30"
              animate={{
                scale: [1, 1.45],
                opacity: [0.45, 0],
              }}
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
            reduceMotion
              ? undefined
              : {
                  y: [0, -4, 0],
                  rotate: [0, -2, 2, 0],
                }
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

      <h2 className="text-lg font-bold text-white sm:text-xl">No faces yet</h2>

      <p className="mt-2 max-w-sm text-xs leading-5 text-blue-50/80 sm:text-sm sm:leading-6">
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
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              y: 22,
              scale: 0.97,
              filter: 'blur(7px)',
            }
      }
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        filter: 'blur(0px)',
      }}
      exit={{
        opacity: 0,
        y: -14,
        scale: 0.98,
      }}
      role="alert"
      transition={{
        duration: reduceMotion ? 0 : 0.64,
        ease: [0.22, 1, 0.36, 1],
      }}
      className="mx-auto flex min-h-[200px] w-[90vw] max-w-[520px] flex-col items-center justify-center rounded-2xl border border-white/20 bg-white/15 px-5 py-7 text-center shadow-[0_30px_80px_-45px_rgba(2,6,23,0.85)] backdrop-blur-xl sm:min-h-[240px] sm:w-full sm:px-8 sm:py-10"
    >
      <h2 className="text-lg font-bold text-white sm:text-xl">
        We could not load the selfie wall
      </h2>

      <p className="mt-2 text-xs leading-5 text-blue-50/80 sm:text-sm sm:leading-6">
        Please check the connection and try again.
      </p>

      <motion.button
        type="button"
        onClick={onRetry}
        whileHover={
          reduceMotion
            ? undefined
            : {
                scale: 1.04,
                y: -2,
              }
        }
        whileTap={
          reduceMotion
            ? undefined
            : {
                scale: 0.96,
              }
        }
        className="mt-5 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-950/20 transition-colors hover:bg-blue-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600"
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
            whileHover={
              reduceMotion
                ? undefined
                : {
                    scale: 1.1,
                    y: -1,
                  }
            }
            whileTap={
              reduceMotion
                ? undefined
                : {
                    scale: 0.92,
                  }
            }
            transition={{
              type: 'spring',
              stiffness: 320,
              damping: 30,
            }}
            className={`relative h-2.5 overflow-hidden rounded-full border border-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${
              isActive
                ? 'w-11 bg-white/30'
                : 'w-2.5 bg-white/30 hover:bg-white/50'
            }`}
          >
            {isActive && (
              <>
                <motion.span
                  layoutId="active-carousel-indicator"
                  className="absolute inset-0 rounded-full bg-blue-300/20"
                  transition={{
                    type: 'spring',
                    stiffness: 320,
                    damping: 32,
                  }}
                />

                {!reduceMotion && !isPaused && (
                  <motion.span
                    key={`desktop-progress-${page}`}
                    initial={{
                      scaleX: 0,
                    }}
                    animate={{
                      scaleX: 1,
                    }}
                    transition={{
                      duration: CAROUSEL_INTERVAL_MS / 1000,
                      ease: 'linear',
                    }}
                    className="absolute inset-0 origin-left rounded-full bg-blue-600"
                  />
                )}

                {(reduceMotion || isPaused) && (
                  <span className="absolute inset-0 rounded-full bg-blue-600" />
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
          initial={{
            scaleX: 0,
          }}
          animate={{
            scaleX: 1,
          }}
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
  hidden: {
    opacity: 0,
    y: -20,
    filter: 'blur(7px)',
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.78,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

export default function FacesOfCleanAirPage() {
  const shouldReduceMotion = useReducedMotion();
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY);

  const [submissions, setSubmissions] = useState<CleanAirSubmission[]>([]);
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
      console.error('Failed to load clean air faces:', error);

      if (!hasLoadedRef.current) {
        setFetchState('error');
      }
    }
  }, []);

  useEffect(() => {
    void fetchSubmissions();

    const pollingTimer = window.setInterval(
      () => void fetchSubmissions(),
      CLEAN_AIR_FORUM_WALL_POLL_INTERVAL_MS,
    );

    return () => {
      window.clearInterval(pollingTimer);
    };
  }, [fetchSubmissions]);

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

  /*
   * Mobile indexes individual cards while desktop indexes groups of six.
   * Reset when crossing the breakpoint so an old index is never reused
   * against a different pagination model.
   */
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
    if (
      fetchState !== 'success' ||
      totalSlides <= 1 ||
      isPaused ||
      shouldReduceMotion
    ) {
      return;
    }

    const carouselTimer = window.setTimeout(() => {
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
      filter: shouldReduceMotion
        ? 'blur(0px)'
        : isMobile
          ? 'blur(12px)'
          : 'blur(11px)',
    }),

    center: {
      x: 0,
      rotateY: 0,
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
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
      filter: shouldReduceMotion
        ? 'blur(0px)'
        : isMobile
          ? 'blur(10px)'
          : 'blur(8px)',
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
          'linear-gradient(180deg, #02143B 0%, #145FFF 50%, #FFFFFF 100%)',
      }}
    >
      <AmbientBackground reduceMotion={shouldReduceMotion} />

      <div className="relative mx-auto flex h-full w-full max-w-[1400px] flex-col px-4 pb-3 pt-4 sm:min-h-[100svh] sm:px-8 sm:pb-12 sm:pt-8 lg:px-12">
        <motion.header
          variants={headerContainerVariants}
          initial={shouldReduceMotion ? false : 'hidden'}
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
              <span
                className="text-[25px] font-normal tracking-[-0.05em] sm:text-[42px]"
                style={{
                  fontFamily:
                    '"Brush Script MT", "Segoe Script", "URW Chancery L", cursive',
                }}
              >
                Faces of
              </span>{' '}
              <span className="text-[23px] font-extrabold tracking-[-0.045em] sm:text-[40px]">
                Air Quality
              </span>
            </motion.h1>

            <motion.div
              variants={headerItemVariants}
              className="mt-1 flex items-center gap-2 text-[9px] leading-tight text-white/85 sm:hidden"
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

        <main className="mx-auto flex min-h-0 w-full max-w-[1200px] flex-1 items-center justify-center pt-2 sm:min-h-[60svh] sm:flex-none sm:pt-10">
          <section
            tabIndex={0}
            aria-label="Faces of Air Quality selfie carousel"
            aria-roledescription="carousel"
            className="flex h-full w-full min-h-0 flex-col justify-center rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-4 focus-visible:ring-offset-transparent sm:block sm:h-auto"
            onKeyDown={handleCarouselKeyDown}
            onMouseEnter={() => {
              if (!isMobile) {
                setIsPaused(true);
              }
            }}
            onMouseLeave={() => {
              if (!isMobile) {
                setIsPaused(false);
              }
            }}
            onFocusCapture={() => {
              if (!isMobile) {
                setIsPaused(true);
              }
            }}
            onBlurCapture={() => {
              if (!isMobile) {
                setIsPaused(false);
              }
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isInitialLoading && (
                <motion.div
                  key="loading"
                  initial={{
                    opacity: 0,
                    filter: 'blur(5px)',
                  }}
                  animate={{
                    opacity: 1,
                    filter: 'blur(0px)',
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.985,
                    filter: 'blur(6px)',
                  }}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.64,
                  }}
                  className={
                    isMobile
                      ? 'flex h-full min-h-0 items-center justify-center'
                      : 'grid grid-cols-1 justify-items-center gap-6 sm:grid-cols-2 lg:grid-cols-3'
                  }
                >
                  {Array.from({
                    length: skeletonCount,
                  }).map((_, index) => (
                    <div
                      key={index}
                      className={isMobile ? 'w-full' : 'w-full max-w-[280px]'}
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

              {!isInitialLoading && !showError && !showEmpty && (
                <motion.div
                  key="content"
                  initial={
                    shouldReduceMotion
                      ? false
                      : {
                          opacity: 0,
                          y: 18,
                          filter: 'blur(6px)',
                        }
                  }
                  animate={{
                    opacity: 1,
                    y: 0,
                    filter: 'blur(0px)',
                  }}
                  exit={{
                    opacity: 0,
                    y: -12,
                    filter: 'blur(4px)',
                  }}
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
                        dragConstraints={{
                          left: 0,
                          right: 0,
                        }}
                        dragElastic={isMobile ? 0.2 : 0.14}
                        dragMomentum={false}
                        onDragEnd={handleDragEnd}
                        style={{
                          transformPerspective: 1200,
                        }}
                        className={
                          isMobile
                            ? 'flex touch-pan-y cursor-grab items-center justify-center active:cursor-grabbing'
                            : 'grid touch-pan-y cursor-grab grid-cols-1 justify-items-center gap-6 active:cursor-grabbing sm:grid-cols-2 lg:grid-cols-3'
                        }
                      >
                        {visibleItems.map((submission, index) => (
                          <div
                            key={
                              submission.id ??
                              `${submission.imageUrl}-${page}-${index}`
                            }
                            className={
                              isMobile ? 'w-full' : 'w-full max-w-[280px]'
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
              )}
            </AnimatePresence>
          </section>
        </main>

        {/* Keeps mobile spacing balanced without making the page scroll. */}
        <div className="h-2 flex-none sm:hidden" />
      </div>
    </div>
  );
}
