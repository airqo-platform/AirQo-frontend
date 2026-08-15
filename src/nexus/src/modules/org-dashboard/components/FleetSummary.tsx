'use client';

import * as React from 'react';
import { Card, CardContent } from '@/shared/components/ui/card';
import { LoadingSpinner } from '@/shared/components/ui/loading-spinner';
import {
  getAirQualityColor,
  getAirQualityIcon,
  getAirQualityLabel,
  getPollutantLabel,
} from '@/shared/utils/airQuality';
import type { AqiConfig } from '@/shared/types/aqi';
import type { Site } from '@/shared/types/api';
import { getSiteDisplayName } from '@/shared/utils/siteUtils';
import {
  AqTrendUp01,
  AqTrendDown01,
  AqUsers01,
  AqSignal02,
  AqMarkerPin01,
} from '@airqo/icons-react';
import type { Measurement, PollutantType } from '../types';
import {
  countLevelDistribution,
  summarizeFleetMeasurements,
} from '../utils/measurements';
import { cn } from '@/shared/lib/utils';

interface FleetSummaryProps {
  latestBySite: Map<string, Measurement>;
  selectedSites: Site[];
  pollutant: PollutantType;
  aqiConfig?: AqiConfig | null;
  isLoading?: boolean;
  className?: string;
}

const LEVEL_LABELS: Record<string, string> = {
  good: 'Good',
  moderate: 'Moderate',
  'unhealthy-sensitive-groups': 'Unhealthy (sensitive)',
  unhealthy: 'Unhealthy',
  'very-unhealthy': 'Very unhealthy',
  hazardous: 'Hazardous',
  'no-value': 'No data',
};

const SkeletonStat: React.FC<{ className?: string }> = ({ className }) => (
  <div
    className={cn('animate-pulse rounded bg-muted', className ?? 'h-6 w-24')}
    aria-hidden="true"
  />
);

/**
 * Fleet hero — average concentration + AQI category, per-level site
 * distribution, and fleet health stats (monitored sites, online devices,
 * worst and cleanest locations).
 */
export const FleetSummary: React.FC<FleetSummaryProps> = ({
  latestBySite,
  selectedSites,
  pollutant,
  aqiConfig = null,
  isLoading = false,
  className,
}) => {
  const summary = React.useMemo(
    () => summarizeFleetMeasurements(latestBySite, pollutant, aqiConfig),
    [latestBySite, pollutant, aqiConfig]
  );
  const distribution = React.useMemo(
    () => countLevelDistribution(latestBySite, pollutant, aqiConfig),
    [latestBySite, pollutant, aqiConfig]
  );

  const siteNameById = React.useMemo(() => {
    const map = new Map<string, string>();
    selectedSites.forEach(site => {
      map.set(site._id, getSiteDisplayName(site));
    });
    return map;
  }, [selectedSites]);

  const worstName = summary.worstSite
    ? (siteNameById.get(summary.worstSite.siteId) ??
      `Site ${summary.worstSite.siteId.slice(-4)}`)
    : null;
  const cleanestName = summary.cleanestSite
    ? (siteNameById.get(summary.cleanestSite.siteId) ??
      `Site ${summary.cleanestSite.siteId.slice(-4)}`)
    : null;

  const averageLevel = summary.averageLevel;
  const averageColor = getAirQualityColor(averageLevel, aqiConfig);
  const AverageIcon = getAirQualityIcon(averageLevel);
  const averageLabel = getAirQualityLabel(
    averageLevel,
    'WHO',
    pollutant === 'pm10' ? 'PM10' : 'PM2.5',
    aqiConfig
  );

  const maxCount = Math.max(1, ...distribution.map(entry => entry.count));

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-5">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Fleet average */}
          <div className="flex flex-col justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Fleet average {getPollutantLabel(pollutant)}
            </p>
            {isLoading && summary.averageConcentration === null ? (
              <div className="space-y-2">
                <SkeletonStat className="h-12 w-28" />
                <SkeletonStat className="h-5 w-32" />
              </div>
            ) : (
              <>
                <div className="flex items-end gap-3">
                  <span
                    className="text-5xl font-bold leading-none"
                    style={{ color: averageColor }}
                  >
                    {summary.averageConcentration === null
                      ? '--'
                      : summary.averageConcentration.toFixed(1)}
                  </span>
                  <span className="mb-1 text-sm text-muted-foreground">
                    µg/m³
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className="flex h-8 w-8 items-center justify-center"
                    style={{ color: averageColor }}
                  >
                    <AverageIcon className="h-8 w-8" />
                  </span>
                  <span
                    className="text-sm font-medium"
                    style={{ color: averageColor }}
                  >
                    {averageLabel}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Level distribution */}
          <div className="flex flex-col justify-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Site distribution
            </p>
            <div className="space-y-1.5">
              {distribution.map(entry => {
                const count = entry.count;
                const width = `${Math.max((count / maxCount) * 100, count > 0 ? 6 : 0)}%`;
                return (
                  <div key={entry.level} className="flex items-center gap-2">
                    <span className="w-32 flex-shrink-0 truncate text-xs text-muted-foreground">
                      {LEVEL_LABELS[entry.level] ?? entry.level}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width,
                          backgroundColor:
                            entry.color ||
                            getAirQualityColor(entry.level, aqiConfig),
                        }}
                      />
                    </div>
                    <span className="w-5 flex-shrink-0 text-right text-xs font-medium text-foreground">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fleet stats */}
          <div className="flex flex-col justify-center gap-3">
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <AqMarkerPin01 className="h-4 w-4" /> Monitored sites
              </span>
              {isLoading ? (
                <SkeletonStat className="h-6 w-10" />
              ) : (
                <span className="text-lg font-semibold text-foreground">
                  {summary.monitoredSiteCount}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <AqSignal02 className="h-4 w-4" /> Devices online
              </span>
              {isLoading ? (
                <SkeletonStat className="h-6 w-10" />
              ) : (
                <span className="text-lg font-semibold text-foreground">
                  {summary.onlineDeviceCount}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <AqTrendUp01 className="h-4 w-4 text-red-500" /> Most polluted
              </span>
              {isLoading ? (
                <SkeletonStat className="h-5 w-28" />
              ) : (
                <span className="truncate text-sm font-medium text-foreground">
                  {worstName ?? '—'}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <AqTrendDown01 className="h-4 w-4 text-green-500" /> Cleanest
                air
              </span>
              {isLoading ? (
                <SkeletonStat className="h-5 w-28" />
              ) : (
                <span className="truncate text-sm font-medium text-foreground">
                  {cleanestName ?? '—'}
                </span>
              )}
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <AqUsers01 className="h-4 w-4" /> Organization
              </span>
              <span className="truncate text-sm font-medium text-foreground">
                {selectedSites.length} saved{' '}
                {selectedSites.length === 1 ? 'location' : 'locations'}
              </span>
            </div>
          </div>
        </div>
        {isLoading && (
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <LoadingSpinner size={12} /> Loading latest readings…
          </div>
        )}
      </CardContent>
    </Card>
  );
};
