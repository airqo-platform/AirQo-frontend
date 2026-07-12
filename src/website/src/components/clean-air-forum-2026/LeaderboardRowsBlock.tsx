'use client';

import {
  AnimatePresence,
  LayoutGroup,
  motion,
  type Variants,
} from 'framer-motion';

import LeaderboardEmptyState from './LeaderboardEmptyState';
import LeaderboardRow from './LeaderboardRow';

type LeaderboardRowData = {
  id: string;
  isEmpty?: boolean;
  avatar?: string;
  avatarImageUrl?: string;
  rank: number;
  name: string;
  points: string;
  tone: 'light' | 'tint';
};

type LeaderboardRowsBlockProps = {
  rows: LeaderboardRowData[];
  slideKey?: string | number;
  reduceMotion?: boolean | null;
  isEmpty?: boolean;
};

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.08,
    },
  },
};

const rowVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 14,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.42,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    scale: 0.98,
    transition: {
      duration: 0.28,
      ease: [0.4, 0, 1, 1],
    },
  },
};

const placeholderRows: LeaderboardRowData[] = Array.from(
  { length: 5 },
  (_, index) => ({
    id: `placeholder-${index}`,
    avatar: '',
    avatarImageUrl: '',
    rank: index + 1,
    name: 'Loading...',
    points: '-- pts',
    tone: index % 2 === 0 ? 'light' : 'tint',
  }),
);

export default function LeaderboardRowsBlock({
  rows,
  slideKey,
  reduceMotion,
  isEmpty,
}: LeaderboardRowsBlockProps) {
  if (isEmpty && rows.length === 0) {
    return (
      <div className="mx-auto flex w-full max-w-[75.125rem] flex-col items-center gap-3 sm:gap-4 lg:gap-4">
        <LeaderboardEmptyState reduceMotion={reduceMotion} />
      </div>
    );
  }

  const visibleRows = rows.length > 0 ? rows : placeholderRows;

  return (
    <div className="mx-auto flex w-full max-w-[75.125rem] flex-col gap-3 sm:gap-4 lg:gap-4">
      <LayoutGroup>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={slideKey ?? 'rows'}
            layout
            variants={reduceMotion ? undefined : containerVariants}
            initial={reduceMotion ? false : 'hidden'}
            animate="visible"
            exit="exit"
            className="flex flex-col gap-3 sm:gap-4 lg:gap-4"
          >
            {visibleRows.map((row) => (
              <motion.div
                key={row.id}
                layout
                layoutId={row.id}
                variants={reduceMotion ? undefined : rowVariants}
                transition={{
                  layout: {
                    type: 'spring',
                    damping: 25,
                    stiffness: 300,
                    mass: 0.8,
                  },
                }}
              >
                <LeaderboardRow
                  avatar={row.avatar}
                  avatarImageUrl={row.avatarImageUrl}
                  rank={row.rank}
                  name={row.name}
                  points={row.points}
                  tone={row.tone}
                  isEmpty={row.isEmpty}
                />
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </LayoutGroup>
    </div>
  );
}
