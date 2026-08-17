'use client';

import React, { useMemo } from 'react';
import { cn } from '@/shared/lib/utils';
import { Card, CardContent } from '@/shared/components/ui/card';
import { useAqiConfig } from '@/shared/providers/aqi-config-provider';
import { getAirQualityInfo } from '@/shared/utils/airQuality';
import { AqiGauge } from './AqiGauge';
import { SitePollutantCards } from './SitePollutantCards';
import { AqiLegend } from '@/modules/analytics/components/explorer/AqiLegend';
import type { RecentReading } from '@/shared/types/api';
import {
  formatReadingFreshness,
  getReadingPollutantValue,
} from '../../utils/siteDetails';

interface SiteCurrentReadingCardProps {
  reading?: RecentReading | null;
  isLoading?: boolean;
  className?: string;
}

const HEALTH_DESCRIPTIONS: Record<string, string> = {
  good: 'Air quality is satisfactory and poses little or no risk. Enjoy your outdoor activities.',
  moderate:
    'Air quality is acceptable. Some pollutants may be a concern for sensitive individuals.',
  'unhealthy-sensitive-groups':
    'Sensitive groups should reduce prolonged or heavy outdoor exertion.',
  unhealthy: 'Everyone may begin to experience health effects.',
  'very-unhealthy':
    'Health alert: everyone may experience more serious health effects.',
  hazardous:
    'Health warning of emergency conditions — everyone is likely to be affected.',
};

/**
 * Current air quality hero: two-column layout with AQI gauge + AQI ranges
 * on the left, "What this means" description + pollutant cards on the right.
 */
export const SiteCurrentReadingCard: React.FC<SiteCurrentReadingCardProps> = ({
  reading,
  isLoading = false,
  className,
}) => {
  const { config: aqiConfig } = useAqiConfig('pm2_5');

  const pm25 = getReadingPollutantValue(reading, 'pm2_5');

  const airInfo = useMemo(() => {
    if (pm25 === null) return null;
    return getAirQualityInfo(pm25, 'pm2_5', 'WHO', aqiConfig);
  }, [pm25, aqiConfig]);

  const freshness = formatReadingFreshness(reading?.time);

  const description = airInfo
    ? (HEALTH_DESCRIPTIONS[airInfo.level] ?? airInfo.description ?? '')
    : '';

  // Loading skeleton
  if (isLoading) {
    return (
      <Card className={cn('w-full', className)}>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
            <div className="flex justify-center">
              <div className="animate-pulse">
                <div className="h-[130px] w-[200px] rounded-b-full bg-muted" />
                <div className="mt-3 h-9 w-full rounded bg-muted" />
              </div>
            </div>
            <div className="space-y-4 animate-pulse">
              <div className="space-y-2">
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="h-3 w-full rounded bg-muted" />
                <div className="h-3 w-3/4 rounded bg-muted" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-24 rounded-lg bg-muted" />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
          {/* Left column: Gauge + AQI ranges */}
          <div className="flex flex-col items-center gap-4">
            <AqiGauge value={pm25} freshness={freshness} />
            <AqiLegend
              aqiConfig={aqiConfig ?? null}
              compact
              markerValue={pm25}
            />
          </div>

          {/* Right column: What this means + Pollutant cards */}
          <div className="space-y-5">
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-foreground">
                What this means
              </h3>
              {description ? (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              ) : (
                <p className="text-sm leading-relaxed text-muted-foreground">
                  No current reading available. The trend and forecast below
                  show the latest available data for this location.
                </p>
              )}
              {airInfo && (
                <div className="flex items-center gap-4 text-sm pt-1">
                  <div>
                    <span className="text-muted-foreground">
                      Primary Pollutant:{' '}
                    </span>
                    <span className="font-semibold text-foreground">PM₂.₅</span>
                  </div>
                  <div>
                    <span className="font-semibold text-foreground">
                      {pm25 !== null ? `${pm25.toFixed(1)} µg/m³` : '—'}
                    </span>
                    <span className="ml-1 text-muted-foreground">
                      {airInfo.label}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <SitePollutantCards reading={reading} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SiteCurrentReadingCard;
