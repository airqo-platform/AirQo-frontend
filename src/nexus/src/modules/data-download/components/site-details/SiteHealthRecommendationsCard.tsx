'use client';

import React, { useMemo } from 'react';
import { cn } from '@/shared/lib/utils';
import { Card, CardContent } from '@/shared/components/ui/card';
import { useAqiConfig } from '@/shared/providers/aqi-config-provider';
import {
  getAirQualityInfo,
  mapAqiCategoryToLevel,
} from '@/shared/utils/airQuality';
import type { AirQualityLevel } from '@/shared/utils/airQuality';
import type { HealthTip, RecentReading } from '@/shared/types/api';

interface SiteHealthRecommendationsCardProps {
  reading?: RecentReading | null;
  isLoading?: boolean;
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

type AdviceKey = Exclude<AirQualityLevel, 'no-value'>;

const ADVICE_KEYS: readonly AdviceKey[] = [
  'good',
  'moderate',
  'unhealthy-sensitive-groups',
  'unhealthy',
  'very-unhealthy',
  'hazardous',
];

/**
 * Severity for the advice card. The pollutant reading is preferred because it
 * is measured, but the API's AQI category is a valid fallback — a reading can
 * carry a category without a PM2.5 value, and that must not blank the card.
 * `mapAqiCategoryToLevel` is reused so the category spelling matches the rest
 * of the app (it returns the same keys as HEALTH_ADVICE).
 */
const resolveAdviceKey = (
  pm25: number | null,
  aqiCategory: string | undefined,
  aqiConfig: ReturnType<typeof useAqiConfig>['config']
): AdviceKey | null => {
  if (pm25 !== null) {
    const airInfo = getAirQualityInfo(pm25, 'pm2_5', 'WHO', aqiConfig);
    const fromPollutant = ADVICE_KEYS.find(key =>
      airInfo?.label.toLowerCase().includes(key.replace('-', ' '))
    );
    if (fromPollutant) return fromPollutant;
  }

  const fromCategory = mapAqiCategoryToLevel(aqiCategory);
  return fromCategory === 'no-value' ? null : fromCategory;
};

const validTips = (reading: RecentReading | null | undefined): HealthTip[] =>
  (reading?.health_tips ?? []).filter(
    tip => Boolean(tip?.title) || Boolean(tip?.description)
  );

/**
 * Dynamic health recommendation card — content changes based on the
 * current AQI level. When API health_tips exist, they are displayed as
 * additional context. The card background color shifts with severity.
 */
export const SiteHealthRecommendationsCard: React.FC<
  SiteHealthRecommendationsCardProps
> = ({ reading, isLoading = false, className }) => {
  const { config: aqiConfig } = useAqiConfig('pm2_5');

  const pm25 =
    typeof reading?.pm2_5?.value === 'number' ? reading.pm2_5.value : null;

  const adviceKey = useMemo(
    () => resolveAdviceKey(pm25, reading?.aqi_category, aqiConfig),
    [pm25, reading?.aqi_category, aqiConfig]
  );
  const advice = adviceKey ? HEALTH_ADVICE[adviceKey] : null;

  const apiTips = useMemo(() => validTips(reading), [reading]);

  if (isLoading) {
    return (
      <Card className={cn('w-full overflow-hidden', className)}>
        <CardContent className="space-y-3 p-5">
          <div className="h-6 w-2/3 animate-pulse rounded bg-muted motion-reduce:animate-none" />
          <div className="h-4 w-full animate-pulse rounded bg-muted motion-reduce:animate-none" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-muted motion-reduce:animate-none" />
        </CardContent>
      </Card>
    );
  }

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
            {/* The header is the stable severity summary; the API's tips are
                listed below so no tip is rendered twice. */}
            <h3 className="text-base font-semibold text-foreground">
              {advice.headline}
            </h3>
            <p className="text-sm text-muted-foreground">{advice.body}</p>
          </div>
        </div>

        {/* Guidance. The API's audience-specific health_tips are the source of
            truth when present (e.g. "For pregnant women", "For Children");
            the static per-severity list is only a fallback for readings that
            carry no tips. */}
        {apiTips.length > 0 ? (
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {apiTips.map((tip, index) => (
              <li
                key={`${tip.title ?? 'tip'}-${index}`}
                className="flex items-start gap-2.5 rounded-lg bg-background/60 p-2.5"
              >
                {tip.image ? (
                  <img
                    src={tip.image}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className="h-8 w-8 shrink-0 rounded-full object-cover"
                  />
                ) : null}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground">
                    {tip.title}
                  </p>
                  {tip.description ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {tip.description}
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : (
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
        )}
      </CardContent>
    </Card>
  );
};

export default SiteHealthRecommendationsCard;
