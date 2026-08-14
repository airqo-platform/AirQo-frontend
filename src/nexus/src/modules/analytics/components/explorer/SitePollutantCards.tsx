'use client';

import React, { useMemo } from 'react';
import { cn } from '@/shared/lib/utils';
import { Card, CardContent } from '@/shared/components/ui/card';
import { useAqiConfig } from '@/shared/providers/aqi-config-provider';
import {
  getAirQualityInfo,
  getAirQualityColor,
  getPollutantLabel,
} from '@/shared/utils/airQuality';
import { formatRoundedNumber } from '@/shared/lib/utils';
import type { RecentReading } from '@/shared/types/api';

interface SitePollutantCardsProps {
  reading?: RecentReading | null;
  className?: string;
}

interface PollutantEntry {
  key: 'pm2_5' | 'pm10';
  label: string;
  value: number | null;
  unit: string;
  categoryLabel: string;
  categoryColor: string;
}

/**
 * Row of pollutant cards — PM2.5, PM10 — each showing the
 * concentration value, unit, and a color-coded category badge derived from
 * the AQI ranges config. Matches the AirVista / AirAware pollutant-strip
 * pattern. The pollutant label is always paired with its text category —
 * color is an accent, never the sole signal.
 */
export const SitePollutantCards: React.FC<SitePollutantCardsProps> = ({
  reading,
  className,
}) => {
  const { config: aqiConfig } = useAqiConfig('pm2_5');

  const pollutants = useMemo<PollutantEntry[]>(() => {
    const configs: { key: 'pm2_5' | 'pm10'; unit: string }[] = [
      { key: 'pm2_5', unit: 'µg/m³' },
      { key: 'pm10', unit: 'µg/m³' },
    ];

    return configs.map(({ key, unit }) => {
      const rawValue = reading?.[key]?.value;
      const value =
        typeof rawValue === 'number' && Number.isFinite(rawValue)
          ? rawValue
          : null;

      const info = value !== null ? getAirQualityInfo(value, key, 'WHO', aqiConfig) : null;
      const color = info ? getAirQualityColor(info.level, aqiConfig ?? null) : '#6B7280';

      return {
        key,
        label: getPollutantLabel(key),
        value,
        unit,
        categoryLabel: info?.label ?? '—',
        categoryColor: color,
      };
    });
  }, [reading, aqiConfig]);

  return (
    <div className={cn('grid grid-cols-3 gap-3', className)}>
      {pollutants.map(p => (
        <Card key={p.key} className="relative overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {p.label}
                </p>
                <p className="mt-1 text-2xl font-bold tabular-nums text-foreground">
                  {p.value !== null ? formatRoundedNumber(p.value, 1) : '—'}
                </p>
                <p className="text-[11px] text-muted-foreground">{p.unit}</p>
              </div>
              <span
                className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{
                  color: p.categoryColor,
                  backgroundColor: `${p.categoryColor}1a`,
                }}
              >
                {p.categoryLabel}
              </span>
            </div>
          </CardContent>
          {/* Bottom color accent stripe */}
          <div
            className="h-1 w-full"
            style={{ backgroundColor: p.categoryColor }}
          />
        </Card>
      ))}
    </div>
  );
};

export default SitePollutantCards;
