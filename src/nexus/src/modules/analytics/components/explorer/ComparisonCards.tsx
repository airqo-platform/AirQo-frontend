'use client';

import React, { useMemo } from 'react';
import { cn } from '@/shared/lib/utils';
import { Card, CardContent } from '@/shared/components/ui/card';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { ErrorState } from '@/shared/components/ui/error-state';
import { AnalyticsCard } from '../AnalyticsCard';
import {
  useComparisonReadings,
  extractReadingNames,
} from '../../hooks/useComparisonReadings';
import { normalizeRecentReadingsToSiteData } from '../../utils';
import type { AqiConfig } from '@/shared/types/aqi';
import type { SiteData } from '../../types';

interface ComparisonCardsProps {
  siteIds: string[];
  siteNames: Map<string, string>;
  aqiConfig?: AqiConfig | null;
  /** Hydrates the page-level names map from readings (no raw ids shown) */
  onNamesResolved?: (names: Map<string, string>) => void;
  className?: string;
}

/**
 * Favorites-style card grid for the selected locations, driven by the same
 * recent-readings service the favorites analytics cards use. Cards show the
 * AQI status icon, PM2.5 value, location name and trend — with the shared
 * AQI legend shown above the grid at page level.
 */
export const ComparisonCards: React.FC<ComparisonCardsProps> = ({
  siteIds,
  siteNames,
  aqiConfig,
  onNamesResolved,
  className,
}) => {
  const { data: readings, isLoading, error, refetch } = useComparisonReadings(
    siteIds,
    true
  );

  // Share display names from readings with the parent
  React.useEffect(() => {
    if (!onNamesResolved || !readings) return;
    const names = extractReadingNames(readings);
    if (names.size > 0) onNamesResolved(names);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readings]);

  // Normalize the exact same way the favorites dashboard does, using the
  // page-selected pollutant so the cards match the legend above them
  const siteCards = useMemo<SiteData[]>(() => {
    if (!readings || readings.length === 0) return [];
    const pollutant: 'pm2_5' | 'pm10' =
      aqiConfig?.pollutant === 'pm10' ? 'pm10' : 'pm2_5';
    return normalizeRecentReadingsToSiteData(readings, pollutant, aqiConfig ?? null);
  }, [readings, aqiConfig]);

  // Fall back to page names for sites without readings
  const displayCards = useMemo<SiteData[]>(() => {
    if (siteCards.length > 0) return siteCards;
    return siteIds.map(siteId => ({
      _id: siteId,
      name: siteNames.get(siteId) ?? 'Unknown location',
      search_name: siteNames.get(siteId),
      location: '',
      value: 0,
      status: 'no-value',
      pollutant: 'pm2_5',
      unit: 'μg/m³',
      trend: 'stable',
    }));
  }, [siteCards, siteIds, siteNames]);

  if (siteIds.length === 0) {
    return (
      <EmptyState
        compact
        title="No locations to compare"
        description="Add locations to your charts to see their latest readings side by side."
      />
    );
  }

  if (error && !isLoading) {
    return (
      <ErrorState
        compact
        title="Unable to load readings"
        description={error.message}
        retryAction={{ label: 'Retry', onClick: () => void refetch() }}
      />
    );
  }

  return (
    <div className={className}>
      {isLoading && displayCards.length === 0 ? (
        <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4')}>
          {Array.from({ length: Math.min(4, siteIds.length) }, (_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-4 space-y-3">
                <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-10 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="h-14 w-14 rounded-full bg-gray-200 dark:bg-gray-700" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {displayCards.map(card => (
            <AnalyticsCard
              key={card._id}
              siteData={card}
              aqiConfig={aqiConfig ?? null}
              selectedPollutant={aqiConfig?.pollutant === 'pm10' ? 'pm10' : 'pm2_5'}
              showIcon
              showTrend
              interactive={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ComparisonCards;
