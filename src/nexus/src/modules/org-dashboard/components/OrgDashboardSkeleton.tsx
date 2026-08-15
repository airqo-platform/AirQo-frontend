'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/utils';

const SkeletonBlock: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn('animate-pulse rounded bg-muted', className)}
    aria-hidden="true"
  />
);

/**
 * Static dashboard skeleton — header, hero, location cards and chart placeholders.
 */
export const OrgDashboardSkeleton: React.FC<{ className?: string }> = ({
  className,
}) => {
  return (
    <div
      className={cn('w-full space-y-5', className)}
      aria-busy="true"
      aria-label="Loading organization dashboard"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <SkeletonBlock className="h-7 w-64" />
          <SkeletonBlock className="h-4 w-96 max-w-full" />
        </div>
        <div className="flex gap-2">
          <SkeletonBlock className="h-9 w-28" />
          <SkeletonBlock className="h-9 w-32" />
          <SkeletonBlock className="h-9 w-28" />
        </div>
      </div>

      <SkeletonBlock className="h-44 w-full" />

      <SkeletonBlock className="h-6 w-48" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <SkeletonBlock key={`card-${index}`} className="h-[185px] w-full" />
        ))}
      </div>

      <SkeletonBlock className="h-[480px] w-full" />
    </div>
  );
};
