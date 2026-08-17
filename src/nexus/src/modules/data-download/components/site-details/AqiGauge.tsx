'use client';

import React, { useMemo } from 'react';
import { cn } from '@/shared/lib/utils';
import { useAqiConfig } from '@/shared/providers/aqi-config-provider';
import {
  getAirQualityInfo,
  getAirQualityColor,
} from '@/shared/utils/airQuality';
import { formatRoundedNumber } from '@/shared/lib/utils';

interface AqiGaugeProps {
  /** PM2.5 concentration value (µg/m³) — used to compute the AQI level */
  value?: number | null;
  /** Pollutant key for computing the AQI level */
  pollutant?: 'pm2_5' | 'pm10';
  /** Freshness label (e.g. "Updated 5 minutes ago") */
  freshness?: string;
  className?: string;
}

/**
 * SVG arc geometry — the gauge spans from START_ANGLE to END_ANGLE (degrees,
 * 0° = 3 o'clock, negative = upward). The gap at the bottom gives the
 * semicircle its "open" feel matching the AirVista/AirAware reference.
 */
const START_ANGLE = -150;
const END_ANGLE = 150;
const ARC_SPAN = END_ANGLE - START_ANGLE; // 300°

const toRad = (deg: number) => (deg * Math.PI) / 180;

const valueToAngle = (value: number, maxAqi: number): number => {
  const clamped = Math.min(Math.max(value, 0), maxAqi);
  return START_ANGLE + (clamped / maxAqi) * ARC_SPAN;
};

const polarToCartesian = (
  cx: number,
  cy: number,
  r: number,
  angleDeg: number
) => {
  const rad = toRad(angleDeg);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const describeArc = (
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number
): string => {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
};

const MAX_AQI = 500;

/**
 * Semicircular AQI gauge — a visually rich, semicircle-arc gauge with colored
 * segments from the live AQI ranges config, a triangular marker at the
 * current value, and the AQI number + category centered in the arc.
 *
 * Empty state: the arc renders in muted gray with all colored segments visible
 * at reduced opacity, and "—" centered — matching the AirVista reference where
 * the gauge always renders.
 */
export const AqiGauge: React.FC<AqiGaugeProps> = ({
  value,
  pollutant = 'pm2_5',
  freshness,
  className,
}) => {
  const { config: aqiConfig } = useAqiConfig(pollutant);

  const hasValue =
    value !== null && value !== undefined && Number.isFinite(value);

  const airInfo = useMemo(() => {
    if (!hasValue) return null;
    return getAirQualityInfo(value!, pollutant, 'WHO', aqiConfig);
  }, [value, pollutant, aqiConfig, hasValue]);

  const categoryColor = useMemo(() => {
    if (airInfo) return getAirQualityColor(airInfo.level, aqiConfig ?? null);
    return '#6B7280';
  }, [airInfo, aqiConfig]);

  const svgSize = 200;
  const cx = svgSize / 2;
  const cy = svgSize / 2 + 10;
  const arcRadius = 80;
  const strokeWidth = 14;

  const segments = useMemo(() => {
    if (!aqiConfig?.ranges) return [];
    const sorted = [...aqiConfig.ranges].sort(
      (a, b) => a.display_order - b.display_order
    );
    return sorted.map(range => ({
      ...range,
      startAngle: valueToAngle(range.min_value ?? 0, MAX_AQI),
      endAngle:
        range.max_value !== null
          ? valueToAngle(range.max_value, MAX_AQI)
          : END_ANGLE,
    }));
  }, [aqiConfig]);

  const markerAngle = useMemo(() => {
    if (!hasValue) return null;
    return valueToAngle(value!, MAX_AQI);
  }, [value, hasValue]);

  const trianglePoints = useMemo(() => {
    if (markerAngle === null) return '';
    const outer = polarToCartesian(
      cx,
      cy,
      arcRadius + strokeWidth / 2 + 6,
      markerAngle
    );
    const left = polarToCartesian(
      cx,
      cy,
      arcRadius - strokeWidth / 2 - 2,
      markerAngle - 4
    );
    const right = polarToCartesian(
      cx,
      cy,
      arcRadius - strokeWidth / 2 - 2,
      markerAngle + 4
    );
    return `${outer.x},${outer.y} ${left.x},${left.y} ${right.x},${right.y}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [markerAngle]);

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div
        className="relative"
        style={{ width: svgSize, height: svgSize * 0.65 }}
      >
        <svg
          viewBox={`0 0 ${svgSize} ${svgSize * 0.7}`}
          className="w-full h-full"
          role="img"
          aria-label={`Air quality index: ${hasValue ? value : 'no data'}${airInfo ? `, ${airInfo.label}` : ''}`}
        >
          {/* Background arc (track) — always visible */}
          <path
            d={describeArc(cx, cy, arcRadius, START_ANGLE, END_ANGLE)}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="text-muted/30"
          />

          {/* Colored segments — dimmed when no value */}
          {segments.map(segment => (
            <path
              key={segment.key}
              d={describeArc(
                cx,
                cy,
                arcRadius,
                segment.startAngle,
                Math.min(segment.endAngle, END_ANGLE)
              )}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeLinecap="butt"
              opacity={hasValue ? 1 : 0.3}
            />
          ))}

          {/* Marker triangle — only when value exists */}
          {trianglePoints && (
            <polygon
              points={trianglePoints}
              fill={categoryColor}
              stroke="white"
              strokeWidth="1.5"
            />
          )}
        </svg>

        {/* Center text */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ paddingTop: '12%' }}
        >
          {hasValue ? (
            <>
              <span
                className="text-4xl font-bold leading-none tabular-nums"
                style={{ color: categoryColor }}
              >
                {formatRoundedNumber(value!, 0)}
              </span>
              <span
                className="mt-1 text-sm font-semibold"
                style={{ color: categoryColor }}
              >
                {airInfo?.label ?? '—'}
              </span>
              <span className="mt-0.5 text-[10px] text-muted-foreground">
                AQI (US)
              </span>
            </>
          ) : (
            <>
              <span className="text-4xl font-bold leading-none text-muted-foreground">
                —
              </span>
              <span className="mt-1 text-sm text-muted-foreground">
                No data
              </span>
              <span className="mt-0.5 text-[10px] text-muted-foreground">
                AQI (US)
              </span>
            </>
          )}
        </div>
      </div>

      {freshness && (
        <p className="mt-1 text-xs text-muted-foreground">{freshness}</p>
      )}
    </div>
  );
};

export default AqiGauge;
