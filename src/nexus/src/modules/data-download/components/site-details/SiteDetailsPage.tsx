'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { cn } from '@/shared/lib/utils';
import { LoadingState } from '@/shared/components/ui/loading-state';
import { ErrorState } from '@/shared/components/ui/error-state';
import { Button } from '@/shared/components/ui/button';
import { AqChevronRight, AqCompass } from '@airqo/icons-react';
import { useResolveSiteByName } from '../../hooks/useResolveSiteByName';
import { SiteCurrentReadingCard } from './SiteCurrentReadingCard';
import { SiteTrendChartCard } from './SiteTrendChartCard';
import { SiteForecastCard } from './SiteForecastCard';
import { SiteHealthRecommendationsCard } from './SiteHealthRecommendationsCard';

interface SiteDetailsPageProps {
  /** Slugified display name (search_name || location_name) from a location row. */
  siteSlug: string;
  /** The authoritative site id from the source row, when available. */
  siteId?: string;
  /** Base href of the data-export page (the breadcrumb root) */
  backHref: string;
  /** Map route for the current account context (user or organization). */
  mapHref?: string;
  className?: string;
}

/**
 * Location detail page (`data-export/sites/[siteSlug]`): breadcrumb nav, AQI
 * gauge hero with pollutant strip, 7D/30D/90D trend, hourly/daily forecast,
 * and health recommendations. The display-name slug keeps the URL readable;
 * export-table navigation passes the authoritative site id to the data hooks.
 */
export const SiteDetailsPage: React.FC<SiteDetailsPageProps> = ({
  siteSlug,
  siteId: siteIdFromRoute,
  backHref,
  mapHref = '/user/map',
  className,
}) => {
  // Background resolution: slug → real site id + authoritative display name
  const {
    data: resolved,
    isLoading: resolving,
    error: resolveError,
    refetch: retryResolve,
  } = useResolveSiteByName(siteSlug, siteIdFromRoute);

  // Row navigation passes the exact site id so a duplicate display name can
  // never resolve to a different location. Direct links still use the slug
  // resolver for backwards compatibility.
  const siteId = siteIdFromRoute?.trim() || resolved?.siteId || '';
  const resolvedName = resolved?.displayName ?? null;

  // Prefer the coordinates captured from the selected table row/resolver.
  const mapUrl = useMemo(() => {
    const latitude = resolved?.latitude;
    const longitude = resolved?.longitude;

    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      !Number.isFinite(latitude) ||
      !Number.isFinite(longitude)
    ) {
      return mapHref;
    }

    const params = new URLSearchParams({
      lat: String(latitude),
      lng: String(longitude),
      zoom: '14',
    });
    return `${mapHref}?${params.toString()}`;
  }, [mapHref, resolved?.latitude, resolved?.longitude]);

  // Forecast is NOT prefetched here — SiteForecastCard below fetches only
  // the mode the user has selected (hourly by default), so loading the page
  // fires exactly one forecast request instead of hourly + daily.

  // Priority: resolved site name > raw slug fallback
  const displayName = siteIdFromRoute ? siteSlug : resolvedName || siteSlug;

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
            'This location could not be found. It may have been renamed or removed.'
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
              Data Export
            </Link>
          </li>
          <li className="flex items-center gap-1.5" aria-hidden="true">
            <AqChevronRight className="h-3.5 w-3.5" />
            <span
              className="truncate font-medium text-foreground"
              title={displayName}
            >
              {displayName}
            </span>
          </li>
        </ol>
      </nav>

      {/* Location heading + View on Map */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-2xl text-foreground">{displayName}</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Live air quality, trends and forecast for this location.
          </p>
        </div>
        <Button variant="outlined" size="md" Icon={AqCompass} path={mapUrl}>
          View on Map
        </Button>
      </div>

      {/* AQI Hero: gauge + AQI ranges (left) | what this means + pollutants (right) */}
      <SiteCurrentReadingCard />

      {/* Historical trend — 7D / 30D / 90D with PM2.5/PM10 toggle */}
      <SiteTrendChartCard siteId={siteId} siteName={displayName} />

      {/* Forecast — full width, before health */}
      <SiteForecastCard siteId={siteId} siteName={displayName} />

      {/* Health recommendation — full width */}
      <SiteHealthRecommendationsCard />
    </div>
  );
};

export default SiteDetailsPage;
