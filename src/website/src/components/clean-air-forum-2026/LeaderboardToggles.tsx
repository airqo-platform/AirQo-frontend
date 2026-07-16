'use client';

import { motion } from 'framer-motion';

type LeaderboardTogglesProps = {
  activeIndex: number;
  count?: number;
  intervalMs?: number;
  isPaused?: boolean;
  reduceMotion?: boolean | null;
  onIndexChange?: (index: number) => void;
};

export default function LeaderboardToggles({
  activeIndex,
  count = 2,
  intervalMs = 7600,
  isPaused = false,
  reduceMotion,
  onIndexChange,
}: LeaderboardTogglesProps) {
  return (
    <nav
      className="mx-auto flex w-fit items-center gap-3"
      aria-label="Leaderboard pagination indicators"
      role="group"
    >
      {Array.from({ length: count }, (_, index) => {
        const isActive = index === activeIndex;

        return (
          <motion.button
            key={`toggle-${index}`}
            type="button"
            aria-label={`Show leaderboard page ${index + 1} of ${count}`}
            aria-current={isActive ? 'page' : undefined}
            onClick={() => onIndexChange?.(index)}
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
                  layoutId="active-leaderboard-indicator"
                  className="absolute inset-0 rounded-full bg-[#39BFC7]/20"
                  transition={{
                    type: 'spring',
                    stiffness: 320,
                    damping: 32,
                  }}
                />

                {!reduceMotion && !isPaused && (
                  <motion.span
                    key={`leaderboard-progress-${activeIndex}`}
                    initial={{
                      scaleX: 0,
                    }}
                    animate={{
                      scaleX: 1,
                    }}
                    transition={{
                      duration: intervalMs / 1000,
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
