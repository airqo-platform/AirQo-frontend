'use client';

import * as React from 'react';
import { cn } from '@/shared/lib/utils';

interface SidebarSkeletonProps {
  isCollapsed?: boolean;
  showBrand?: boolean;
  className?: string;
}

const SkeletonBlock = ({ className }: { className?: string }) => (
  <div
    className={cn(
      'animate-pulse rounded-md border border-border/80 bg-primary/15 shadow-sm dark:border-slate-700 dark:bg-primary/20',
      className
    )}
  />
);

export const SidebarSkeleton: React.FC<SidebarSkeletonProps> = ({
  isCollapsed = false,
  showBrand = false,
  className,
}) => {
  const groupCount = isCollapsed ? 1 : 3;

  return (
    <div
      className={cn(
        'flex-1 py-6 bg-gradient-to-b from-primary/5 via-background to-muted/25',
        className
      )}
    >
      <div className="px-3">
        {showBrand && !isCollapsed && (
          <div className="mb-6 flex items-center gap-3 px-3">
            <SkeletonBlock className="h-10 w-10 rounded-full bg-primary/20 dark:bg-primary/25" />
            <div className="flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-24 bg-primary/20 dark:bg-primary/25" />
              <SkeletonBlock className="h-3 w-16 bg-muted/70 dark:bg-muted/30" />
            </div>
          </div>
        )}

        {isCollapsed ? (
          <div className="space-y-4">
            <div className="space-y-3 px-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`collapsed-item-${index}`}
                  className="flex justify-center"
                >
                  <SkeletonBlock className="h-10 w-10 rounded-full bg-primary/25 dark:bg-primary/30" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {Array.from({ length: groupCount }).map((_, groupIndex) => (
              <div key={`group-${groupIndex}`} className="space-y-3">
                <div className="px-3">
                  <SkeletonBlock className="h-3 w-20 bg-primary/20 dark:bg-primary/25" />
                </div>
                <div className="space-y-2">
                  {Array.from({ length: 4 }).map((_, itemIndex) => (
                    <div
                      key={`group-${groupIndex}-item-${itemIndex}`}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 bg-background/20 dark:bg-background/10"
                    >
                      <SkeletonBlock className="h-8 w-8 rounded-lg bg-primary/25 dark:bg-primary/30" />
                      <div className="flex-1 space-y-2">
                        <SkeletonBlock className="h-3 w-3/4 bg-primary/20 dark:bg-primary/25" />
                        <SkeletonBlock className="h-2 w-1/2 bg-muted/70 dark:bg-muted/30" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
