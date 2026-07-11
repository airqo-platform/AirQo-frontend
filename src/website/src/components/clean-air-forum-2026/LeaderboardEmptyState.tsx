'use client';

import { motion } from 'framer-motion';
import { FiAward } from 'react-icons/fi';

type LeaderboardEmptyStateProps = {
  reduceMotion?: boolean | null;
};

export default function LeaderboardEmptyState({
  reduceMotion,
}: LeaderboardEmptyStateProps) {
  return (
    <motion.div
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              y: 26,
              scale: 0.96,
            }
      }
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        y: -16,
        scale: 0.97,
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
              className="absolute inset-0 rounded-full border border-[#39BFC7]/30"
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
          <FiAward className="h-6 w-6 text-white sm:h-7 sm:w-7" />
        </motion.div>
      </div>

      <h2 className="text-lg font-bold text-white sm:text-xl">
        No leaderboard data yet
      </h2>

      <p className="mt-2 max-w-sm text-xs leading-5 text-[#39BFC7]/80 sm:text-sm sm:leading-6">
        Complete the quiz to earn points and appear on the leaderboard.
      </p>
    </motion.div>
  );
}
