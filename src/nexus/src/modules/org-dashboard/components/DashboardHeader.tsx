'use client';

import * as React from 'react';
import { Button } from '@/shared/components/ui/button';
import { AqRefreshCcw01, AqCompass, AqSettings01 } from '@airqo/icons-react';

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

const formatOrgName = (name: string, maxLen = 30): string => {
  const cleaned = name.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  const titled = cleaned
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
  return titled.length > maxLen ? `${titled.slice(0, maxLen - 1)}…` : titled;
};

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
        <h1 className="truncate text-2xl text-foreground">
          {formatOrgName(organizationTitle)}
        </h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {subtitle ?? locationContext}
        </p>
        {lastUpdatedAt && (
          <p className="mt-1 text-xs text-muted-foreground/80">
            Last updated at {formatLastUpdated(lastUpdatedAt)}
          </p>
        )}
      </div>
      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-shrink-0 sm:flex-wrap sm:items-center">
        {onRefresh && (
          <Button
            variant="outlined"
            size="md"
            Icon={AqRefreshCcw01}
            onClick={onRefresh}
            loading={isRefreshing}
            showTextOnMobile
            className="w-full sm:w-auto"
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
            showTextOnMobile
            className="w-full sm:w-auto"
          >
            Manage Locations
          </Button>
        )}
        {mapHref && (
          <Button
            variant="outlined"
            size="md"
            Icon={AqCompass}
            path={mapHref}
            showTextOnMobile
            className="w-full sm:w-auto"
          >
            View on Map
          </Button>
        )}
      </div>
    </div>
  );
};
