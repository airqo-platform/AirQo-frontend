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
 * Dashboard skeleton — header placeholder (title bar + card) and
 * a few stacked chart-card shaped blocks.
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
      {/* Header: title + empty-state card */}
      <div className="space-y-3">
        <SkeletonBlock className="h-7 w-64" />
        <SkeletonBlock className="h-[88px] w-full" />
      </div>

      {/* Saved locations section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <SkeletonBlock className="h-5 w-36" />
          <SkeletonBlock className="h-9 w-36" />
        </div>
        <SkeletonBlock className="h-[380px] w-full rounded-md" />
      </div>

      {/* Charts section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <SkeletonBlock className="h-5 w-28" />
          <SkeletonBlock className="h-9 w-32" />
        </div>
        <SkeletonBlock className="h-[220px] w-full" />
        <SkeletonBlock className="h-[220px] w-full" />
      </div>

      {/* AqiLegend placeholder */}
      <SkeletonBlock className="h-8 w-72" />
    </div>
  );
};
