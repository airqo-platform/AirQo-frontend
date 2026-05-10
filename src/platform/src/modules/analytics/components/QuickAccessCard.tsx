'use client';

import React, { memo } from 'react';
import PageHeading from '@/shared/components/ui/page-heading';
import FilterBar from './FilterBar';
import { cn } from '@/shared/lib/utils';
import type { QuickAccessLocationsProps } from '../types';
import { AnalyticsCard } from './AnalyticsCard';
import { LoadingSpinner } from '@/shared/components/ui/loading-spinner';

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
    onCardClick,
  }) => {
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

        {warningBanner && <div>{warningBanner}</div>}

        {/* Sites Grid */}
        <div className="relative">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Render site cards up to 4 to leave room for Add Location */}
            {sites.slice(0, 4).map(site => (
              <AnalyticsCard
                key={site._id}
                siteData={site}
                className="w-full"
                showIcon={showIcon}
                selectedPollutant={selectedPollutant}
                onClick={onCardClick || (() => {})}
              />
            ))}

            {/* Show Add Location button if less than 4 sites */}
            {sites.length < 4 && (
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

          {isLoading && (
            <div className="absolute inset-0 z-20 flex items-center justify-center rounded-md bg-background/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-muted-foreground shadow-sm">
                <LoadingSpinner size={16} />
                <span>Updating locations...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
);
QuickAccessCard.displayName = 'QuickAccessCard';
