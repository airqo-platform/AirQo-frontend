'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { cn } from '@/shared/lib/utils';
import { LoadingState } from '@/shared/components/ui/loading-state';
import { ErrorState } from '@/shared/components/ui/error-state';
import { AqChevronRight } from '@airqo/icons-react';
import { useForecast } from '@/modules/airqo-map/hooks';
import { useSiteRecentReading } from '../../hooks/useSiteRecentReading';
import { useResolveSiteByName } from '../../hooks/useResolveSiteByName';
import { resolveReadingSiteName } from '../../utils/siteDetails';
import { SiteCurrentReadingCard } from './SiteCurrentReadingCard';
import { SiteTrendChartCard } from './SiteTrendChartCard';
import { SiteForecastCard } from './SiteForecastCard';
import { SiteHealthRecommendationsCard } from './SiteHealthRecommendationsCard';

interface SiteDetailsPageProps {
  /** Slugified display name (search_name || location_name) from the explore
   *  table — the real site id is resolved in the background, never in the URL. */
  siteSlug: string;
  /** Base href of the analytics page (the breadcrumb root) */
  backHref: string;
  className?: string;
}

/**
 * Location detail page (`analytics/sites/[siteSlug]`): breadcrumb nav, AQI
 * gauge hero with pollutant strip, 24H/7D/30D trend, hourly/daily forecast,
 * and health recommendations. The URL only carries the site's display-name
 * slug; the real id is resolved via the fleet sites summary and then handed
 * to the data hooks.
 */
export const SiteDetailsPage: React.FC<SiteDetailsPageProps> = ({
  siteSlug,
  backHref,
  className,
}) => {
  // Background resolution: slug → real site id + authoritative display name
  const {
    data: resolved,
    isLoading: resolving,
    error: resolveError,
    refetch: retryResolve,
  } = useResolveSiteByName(siteSlug);

  const siteId = resolved?.siteId ?? '';
  const resolvedName = resolved?.displayName ?? null;

  const {
    data: reading,
    isLoading: readingLoading,
    error: readingError,
    refetch,
  } = useSiteRecentReading(siteId, !!siteId);

  // Forecast provides the site name even when readings are empty
  const { siteName: forecastSiteName } = useForecast({
    siteId,
    mode: 'daily',
    enabled: !!siteId,
  });

  const readingSiteName = useMemo(() => resolveReadingSiteName(reading), [reading]);

  // Priority: resolved site name (what was clicked in explore) > reading
  // siteDetails > forecast site_details > raw slug fallback
  const displayName =
    resolvedName || readingSiteName || forecastSiteName || siteSlug;

  if (resolving) {
    return (
      <div className={cn('space-y-5', className)}>
        <div className="flex min-h-[300px] items-center justify-center">
          <LoadingState text="Locating site..." />
        </div>
      </div>
    );
  }

  if (resolveError || !siteId) {
    return (
      <div className={cn('space-y-5', className)}>
        <ErrorState
          title="Unable to find this location"
          description={
            resolveError?.message ??
            'This location could not be found in your network. It may have been renamed or removed.'
          }
          retryAction={{ label: 'Retry', onClick: () => void retryResolve() }}
        />
      </div>
    );
  }

  return (
    <div className={cn('space-y-5', className)}>
      {/* Breadcrumb navigation */}
      <nav aria-label="Breadcrumb" className="text-sm">
        <ol className="flex items-center gap-1.5 list-none p-0 m-0 text-muted-foreground">
          <li>
            <Link
              href={backHref}
              className="transition-colors hover:text-foreground"
            >
              Air Quality Analytics
            </Link>
          </li>
          <li className="flex items-center gap-1.5" aria-hidden="true">
            <AqChevronRight className="h-3.5 w-3.5" />
            <span className="truncate font-medium text-foreground" title={displayName}>
              {displayName}
            </span>
          </li>
        </ol>
      </nav>

      {/* Location heading */}
      <div>
        <h1 className="truncate text-2xl text-foreground">{displayName}</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Live air quality, trends and forecast for this location.
        </p>
      </div>

      {readingLoading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <LoadingState text="Loading location details..." />
        </div>
      ) : readingError ? (
        <ErrorState
          title="Unable to load location details"
          description={readingError.message}
          retryAction={{ label: 'Retry', onClick: () => void refetch() }}
        />
      ) : (
        <>
          {/* AQI Hero: gauge + AQI ranges (left) | what this means + pollutants (right) */}
          <SiteCurrentReadingCard reading={reading} />

          {/* Historical trend — 24H / 7D / 30D with PM2.5/PM10 toggle */}
          <SiteTrendChartCard siteId={siteId} siteName={displayName} />

          {/* Forecast — full width, before health */}
          <SiteForecastCard siteId={siteId} siteName={displayName} />

          {/* Health recommendation — full width */}
          <SiteHealthRecommendationsCard reading={reading} />
        </>
      )}
    </div>
  );
};

export default SiteDetailsPage;
