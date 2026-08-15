'use client';

import * as React from 'react';
import { Button } from '@/shared/components/ui/button';
import {
  AqRefreshCcw01,
  AqCompass,
  AqSettings01,
  AqMarkerPin01,
} from '@airqo/icons-react';

interface DashboardHeaderProps {
  organizationTitle: string;
  selectedSiteCount: number;
  subtitle?: string;
  isRefreshing?: boolean;
  lastUpdatedAt?: string | null;
  onRefresh?: () => void;
  mapHref?: string;
  onManageLocations?: () => void;
}

const formatLastUpdated = (iso: string): string => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Organization dashboard header — title, context line about the user's saved
 * locations (preference-driven), refresh + map + manage-locations actions.
 */
export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  organizationTitle,
  selectedSiteCount,
  subtitle,
  isRefreshing = false,
  lastUpdatedAt = null,
  onRefresh,
  mapHref,
  onManageLocations,
}) => {
  const locationContext =
    selectedSiteCount > 0
      ? `Live air quality across your ${selectedSiteCount} saved ${
          selectedSiteCount === 1 ? 'location' : 'locations'
        }.`
      : 'Select the locations you want to track to see live air quality, trends and insights for your organization.';

  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <AqMarkerPin01 className="h-5 w-5 text-primary" />
          <h1 className="truncate text-2xl text-foreground">
            {organizationTitle}
          </h1>
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {subtitle ?? locationContext}
        </p>
        {lastUpdatedAt && (
          <p className="mt-1 text-xs text-muted-foreground/80">
            Last updated at {formatLastUpdated(lastUpdatedAt)}
          </p>
        )}
      </div>
      <div className="flex flex-shrink-0 flex-wrap items-center gap-2">
        {onRefresh && (
          <Button
            variant="outlined"
            size="md"
            Icon={AqRefreshCcw01}
            onClick={onRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? 'Refreshing…' : 'Refresh'}
          </Button>
        )}
        {onManageLocations && (
          <Button
            variant="outlined"
            size="md"
            Icon={AqSettings01}
            onClick={onManageLocations}
          >
            Manage Locations
          </Button>
        )}
        {mapHref && (
          <Button variant="outlined" size="md" Icon={AqCompass} path={mapHref}>
            View on Map
          </Button>
        )}
      </div>
    </div>
  );
};
