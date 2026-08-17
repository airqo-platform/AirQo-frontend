'use client';

import React, { useMemo } from 'react';
import { cn } from '@/shared/lib/utils';
import { Card, CardContent } from '@/shared/components/ui/card';
import { useAqiConfig } from '@/shared/providers/aqi-config-provider';
import { getAirQualityInfo } from '@/shared/utils/airQuality';
import type { RecentReading } from '@/shared/types/api';

interface SiteHealthRecommendationsCardProps {
  reading?: RecentReading | null;
  className?: string;
}

interface HealthAdvice {
  emoji: string;
  headline: string;
  body: string;
  tips: string[];
  colorClass: string;
}

const HEALTH_ADVICE: Record<string, HealthAdvice> = {
  good: {
    emoji: '🏃',
    headline: 'Great day for outdoor activities!',
    body: 'Air quality is satisfactory. Enjoy your usual outdoor activities.',
    tips: [
      'Open windows for natural ventilation',
      'Ideal for exercise and outdoor sports',
      'No health risk from air pollution',
    ],
    colorClass: 'bg-emerald-50 border-emerald-200',
  },
  moderate: {
    emoji: '🚶',
    headline: 'Air quality is acceptable.',
    body: 'Sensitive individuals should consider limiting prolonged outdoor exertion.',
    tips: [
      'You can continue outdoor activities',
      'Sensitive individuals may want to reduce prolonged exertion',
      'Air quality is generally safe for most people',
    ],
    colorClass: 'bg-amber-50 border-amber-200',
  },
  'unhealthy-sensitive-groups': {
    emoji: '⚠️',
    headline: 'Sensitive groups should take care.',
    body: 'Children, elderly, and people with heart or lung conditions should reduce prolonged outdoor exertion.',
    tips: [
      'Reduce prolonged outdoor exertion for sensitive groups',
      'Keep windows closed during peak hours',
      'Consider indoor exercise alternatives',
    ],
    colorClass: 'bg-orange-50 border-orange-200',
  },
  unhealthy: {
    emoji: '😷',
    headline: 'Reduce outdoor activities.',
    body: 'Everyone should reduce prolonged or heavy outdoor exertion.',
    tips: [
      'Move activities indoors when possible',
      'Wear a mask if you must go outside',
      'Keep windows and doors closed',
    ],
    colorClass: 'bg-red-50 border-red-200',
  },
  'very-unhealthy': {
    emoji: '🚨',
    headline: 'Avoid outdoor activities.',
    body: 'Everyone should avoid prolonged outdoor exertion. Move activities indoors or reschedule.',
    tips: [
      'Avoid all outdoor physical activities',
      'Keep windows and doors tightly closed',
      'Use air purifiers if available',
    ],
    colorClass: 'bg-purple-50 border-purple-200',
  },
  hazardous: {
    emoji: '🏠',
    headline: 'Stay indoors.',
    body: 'Everyone should avoid all physical activities outdoors. Stay indoors and keep activity levels low.',
    tips: [
      'Stay indoors with windows and doors closed',
      'Avoid all physical activities outdoors',
      'Use air purifiers and recirculate indoor air',
    ],
    colorClass: 'bg-rose-50 border-rose-200',
  },
};

const fallbackKeyForLevel = (level: string): string => {
  const normalized = level.toLowerCase();
  if (normalized.includes('hazardous')) return 'hazardous';
  if (normalized.includes('very unhealthy')) return 'very_unhealthy';
  if (normalized.includes('unhealthy') && normalized.includes('sensitive'))
    return 'unhealthy-sensitive-groups';
  if (normalized.includes('unhealthy')) return 'unhealthy';
  if (normalized.includes('moderate')) return 'moderate';
  return 'good';
};

/**
 * Dynamic health recommendation card — content changes based on the
 * current AQI level. When API health_tips exist, they are displayed as
 * additional context. The card background color shifts with severity.
 */
export const SiteHealthRecommendationsCard: React.FC<
  SiteHealthRecommendationsCardProps
> = ({ reading, className }) => {
  const { config: aqiConfig } = useAqiConfig('pm2_5');

  const pm25 =
    typeof reading?.pm2_5?.value === 'number' ? reading.pm2_5.value : null;

  const airInfo = useMemo(() => {
    if (pm25 === null) return null;
    return getAirQualityInfo(pm25, 'pm2_5', 'WHO', aqiConfig);
  }, [pm25, aqiConfig]);

  const fallbackLevel = airInfo ? fallbackKeyForLevel(airInfo.label) : null;
  const advice = fallbackLevel ? HEALTH_ADVICE[fallbackLevel] : null;

  const apiTips = reading?.health_tips ?? [];

  // No data available — show empty state
  if (!advice) {
    return (
      <Card className={cn('w-full overflow-hidden', className)}>
        <CardContent className="p-5 bg-muted/30">
          <div className="flex items-start gap-3">
            <span
              className="text-3xl shrink-0 opacity-40"
              role="img"
              aria-hidden="true"
            >
              🌤️
            </span>
            <div className="space-y-1 min-w-0">
              <h3 className="text-base font-medium text-muted-foreground">
                No health recommendations yet
              </h3>
              <p className="text-sm text-muted-foreground/70">
                Health advice will appear once an air quality reading is
                available for this site.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('w-full overflow-hidden', className)}>
      <CardContent className={cn('p-5', advice.colorClass)}>
        {/* Header with emoji inline */}
        <div className="flex items-start gap-3">
          <span className="text-3xl shrink-0" role="img" aria-hidden="true">
            {advice.emoji}
          </span>
          <div className="space-y-1 min-w-0">
            <h3 className="text-base font-semibold text-foreground">
              {apiTips.length > 0
                ? (apiTips[0].title ?? advice.headline)
                : advice.headline}
            </h3>
            <p className="text-sm text-muted-foreground">
              {apiTips.length > 0
                ? (apiTips[0].description ?? advice.body)
                : advice.body}
            </p>
          </div>
        </div>

        {/* Tips */}
        <ul className="mt-3 space-y-1.5 grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          {advice.tips.map((tip, index) => (
            <li
              key={index}
              className="flex items-start gap-2 text-xs text-muted-foreground"
            >
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground/40" />
              {tip}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default SiteHealthRecommendationsCard;
