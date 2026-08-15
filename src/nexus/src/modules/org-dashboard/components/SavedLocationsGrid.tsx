'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/shared/components/ui/card';
import { AnalyticsCard } from '@/modules/analytics';
import { EmptyState } from '@/shared/components/ui';
import { LoadingSpinner } from '@/shared/components/ui/loading-spinner';
import type { AqiConfig } from '@/shared/types/aqi';
import type { Site, SiteAverages, Measurement } from '@/shared/types/api';
import type { PollutantType } from '../types';
import { buildLocationCardData } from '../utils/measurements';
import { cn } from '@/shared/lib/utils';

interface SavedLocationsGridProps {
  selectedSites: Site[];
  latestBySite: Map<string, Measurement>;
  averagesBySite: Map<string, SiteAverages | null>;
  pollutant: PollutantType;
  aqiConfig?: AqiConfig | null;
  isLoading?: boolean;
  isRefreshing?: boolean;
  errorMessage?: string | null;
  onRefresh?: () => void;
  className?: string;
}

/**
 * Preference-driven location cards — renders exactly the sites the user saved
 * (analytics preferences), matched against the fleet's latest measurements and
 * each site's week-over-week averages.
 */
export const SavedLocationsGrid: React.FC<SavedLocationsGridProps> = ({
  selectedSites,
  latestBySite,
  averagesBySite,
  pollutant,
  aqiConfig = null,
  isLoading = false,
  isRefreshing = false,
  errorMessage = null,
  onRefresh,
  className,
}) => {
  const hasUsableSites = selectedSites.length > 0;
  const shouldShowSkeleton = isLoading && !hasUsableSites;
  const shouldShowErrorState =
    !isLoading && !hasUsableSites && Boolean(errorMessage);

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-2">
        <CardTitle>Saved Locations</CardTitle>
        <CardDescription>
          Live air quality for the locations your organization tracks — change
          them anytime from “Manage Locations”.
        </CardDescription>
        {isRefreshing && hasUsableSites && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <LoadingSpinner size={12} />
            <span>Refreshing latest readings…</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {shouldShowErrorState ? (
            <div className="col-span-full">
              <EmptyState
                compact
                title="Location readings could not be loaded"
                description={errorMessage ?? undefined}
                action={
                  onRefresh
                    ? {
                        label: 'Refresh',
                        onClick: onRefresh,
                        variant: 'outlined',
                      }
                    : undefined
                }
              />
            </div>
          ) : shouldShowSkeleton ? (
            Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`saved-location-skeleton-${index}`}
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
            ))
          ) : (
            selectedSites.map(site => {
              const measurement = latestBySite.get(site._id) ?? null;
              const averages = averagesBySite.get(site._id) ?? null;
              const siteData = buildLocationCardData({
                site,
                measurement,
                averages,
                pollutant,
                aqiConfig,
              });
              return (
                <AnalyticsCard
                  key={site._id}
                  siteData={siteData}
                  selectedPollutant={pollutant}
                  aqiConfig={aqiConfig}
                  interactive={false}
                  showIcon
                />
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};
