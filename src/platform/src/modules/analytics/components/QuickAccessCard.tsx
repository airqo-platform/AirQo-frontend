'use client';

import React, { memo } from 'react';
import PageHeading from '@/shared/components/ui/page-heading';
import FilterBar from './FilterBar';
import { cn } from '@/shared/lib/utils';
import type { QuickAccessLocationsProps } from '../types';
import { AnalyticsCard } from './AnalyticsCard';
import { LoadingSpinner } from '@/shared/components/ui/loading-spinner';
import { WarningBanner } from '@/shared/components/ui';

export const QuickAccessCard: React.FC<QuickAccessLocationsProps> = memo(
  ({
    sites,
    onManageFavorites,
    onRefresh,
    isRefreshing,
    className,
    title = 'Favorite Locations',
    subtitle = 'Add up to 4 frequently monitored cities for instant access to air quality trends, visualizations, and quick data downloads.',
    infoLine,
    warningBanner,
    showIcon = true,
    onShowIconsChange,
    selectedPollutant,
    isLoading = false,
    placeholderCount = 0,
    hasError = false,
    onCardClick,
  }) => {
    const visiblePlaceholderCount = Math.min(Math.max(placeholderCount, 1), 4);
    const shouldShowSkeleton =
      visiblePlaceholderCount > 0 &&
      (isLoading || (hasError && sites.length === 0));
    const shouldShowAddFavorite = shouldShowSkeleton
      ? visiblePlaceholderCount < 4
      : sites.length < 4;

    return (
      <div className={cn('w-full space-y-4', className)}>
        <PageHeading
          title={title}
          subtitle={subtitle}
          infoLine={
            infoLine ??
            'All air quality data shown here is open, public, and free to download.'
          }
        />

        {/* External filter bar - matches the design in the image (pill style) */}
        <FilterBar
          onManageFavorites={onManageFavorites}
          onRefresh={onRefresh}
          isRefreshing={isRefreshing}
          showIcons={showIcon}
          onShowIconsChange={onShowIconsChange}
        />

        {isRefreshing && sites.length > 0 && !isLoading && (
          <div className="flex justify-end">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground shadow-sm">
              <LoadingSpinner size={12} />
              <span>Refreshing latest readings...</span>
            </div>
          </div>
        )}

        {hasError && (
          <WarningBanner
            dense={true}
            title="Latest readings are temporarily unavailable"
            message="Try Refresh again. Your saved favorites are still available."
          />
        )}

        {warningBanner && <div>{warningBanner}</div>}

        {/* Sites Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {shouldShowSkeleton
            ? Array.from({ length: visiblePlaceholderCount }).map(
                (_, index) => (
                  <div
                    key={`favorite-skeleton-${index}`}
                    className="h-[185px] rounded-md border border-border bg-card p-4 shadow-sm"
                    aria-hidden="true"
                  >
                    <div className="animate-pulse space-y-4">
                      <div className="space-y-2">
                        <div className="h-6 w-3/5 rounded bg-muted" />
                        <div className="h-4 w-1/3 rounded bg-muted" />
                      </div>
                      <div className="flex items-center justify-between pt-8">
                        <div className="space-y-3">
                          <div className="h-5 w-8 rounded bg-muted" />
                          <div className="h-8 w-20 rounded bg-muted" />
                        </div>
                        <div className="h-16 w-16 rounded-full bg-muted" />
                      </div>
                    </div>
                  </div>
                )
              )
            : sites
                .slice(0, 4)
                .map(site => (
                  <AnalyticsCard
                    key={site._id}
                    siteData={site}
                    className="w-full"
                    showIcon={showIcon}
                    selectedPollutant={selectedPollutant}
                    onClick={onCardClick || (() => {})}
                  />
                ))}

          {shouldShowAddFavorite && (
            <button
              onClick={() => {
                if (onManageFavorites) onManageFavorites();
              }}
              className="w-full h-[185px] border-2 border-dashed border-primary/50 dark:border-primary/80 rounded-md flex items-center justify-center text-primary bg-primary/10 dark:bg-primary/20 hover:bg-primary/20 dark:hover:bg-primary/30 hover:scale-95 transition-all duration-200 focus:outline-none"
              aria-label="Add Location"
            >
              <div className="text-center">
                <div className="text-lg font-medium">+ Add Favorite</div>
              </div>
            </button>
          )}
        </div>
      </div>
    );
  }
);
QuickAccessCard.displayName = 'QuickAccessCard';
