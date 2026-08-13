'use client';

import React from 'react';
import { ReferenceLine } from 'recharts';
import { PollutantType, StandardsType } from '../../types';
import { REFERENCE_LINES } from '../../constants';
import { getPollutantLabel } from '../../utils';

interface CustomReferenceLineProps {
  pollutant: PollutantType;
  standards: StandardsType;
  showReferenceLine?: boolean;
  /** Prefer the 24-hour guideline over the annual one (default: annual) */
  preferPeriod?: '24hr' | 'annual';
}

interface CustomLabelProps {
  viewBox?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  };
  /** Descriptive line, e.g. "WHO 2021 · 24-hour guideline" */
  value?: string;
  /** Bold value line, e.g. "15 μg/m³" */
  valueLabel?: string;
  details?: string;
}

const CUSTOM_LABEL_WIDTH = 110;
const CUSTOM_LABEL_HEIGHT = 22;

const CustomLabel: React.FC<CustomLabelProps> = ({
  viewBox,
  valueLabel,
  details,
  value,
}) => {
  if (!valueLabel || !viewBox) return null;

  const { x = 0, y = 0 } = viewBox;

  // Position at the left end of the reference line, clearly above it
  const labelX = x + 4;
  const labelY = y - CUSTOM_LABEL_HEIGHT - 6;

  return (
    <g>
      <title>{details ?? value}</title>
      <rect
        x={labelX}
        y={labelY}
        width={CUSTOM_LABEL_WIDTH}
        height={CUSTOM_LABEL_HEIGHT}
        fill="#DC2626"
        rx={4}
        ry={4}
        stroke="#DC2626"
        strokeWidth={1}
      />
      <text
        x={labelX + CUSTOM_LABEL_WIDTH / 2}
        y={labelY + 15}
        textAnchor="middle"
        fill="white"
        fontSize="11px"
        fontWeight="700"
      >
        {valueLabel}
      </text>
    </g>
  );
};

const STANDARDS_SHORT_LABELS: Record<StandardsType, string> = {
  WHO: 'WHO 2021',
  NEMA_UGANDA: 'NEMA (UG)',
  NEMA_KENYA: 'NEMA (KE)',
};

export const CustomReferenceLine: React.FC<CustomReferenceLineProps> = ({
  pollutant,
  standards,
  showReferenceLine = true,
  preferPeriod = 'annual',
}) => {
  if (!showReferenceLine) return null;
  // Normalize inputs to be resilient to different formats (e.g. 'PM2.5', 'pm25', 'pm2_5')
  const normalizePollutant = (p: string) => {
    const key = (p || '')
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    // Map to internal short keys
    if (key === 'pm25' || key === 'pm2_5') return 'pm2_5';
    if (key === 'pm10') return 'pm10';
    if (key === 'no2') return 'no2';
    if (key === 'co') return 'co';
    if (key === 'so2') return 'so2';
    if (key === 'o3') return 'o3';
    return key as PollutantType;
  };

  const getReferenceLineValue = (
    rawPollutant: string,
    rawStandards: StandardsType
  ) => {
    const pollutantKey = normalizePollutant(rawPollutant as string);
    const standardsKey = rawStandards || 'WHO';
    const referenceLine = REFERENCE_LINES[standardsKey];

    if (!referenceLine) return null;

    // Candidate keys ordered by the requested averaging period so the
    // chart compares against the guideline that matches the chart's
    // frequency (24-hour for daily/hourly data, annual for monthly).
    const annualKeys: Record<string, string[]> = {
      pm2_5: ['PM25_ANNUAL', 'PM25_24HR'],
      pm10: ['PM10_ANNUAL', 'PM10_24HR'],
      no2: ['NO2_ANNUAL', 'NO2_24HR'],
      co: ['CO_8HR'],
      so2: ['SO2_24HR'],
      o3: ['O3_8HR'],
    };
    const hourKeys: Record<string, string[]> = {
      pm2_5: ['PM25_24HR', 'PM25_ANNUAL'],
      pm10: ['PM10_24HR', 'PM10_ANNUAL'],
      no2: ['NO2_24HR', 'NO2_ANNUAL'],
      co: ['CO_8HR'],
      so2: ['SO2_24HR'],
      o3: ['O3_8HR'],
    };
    const candidateKeys =
      (preferPeriod === '24hr'
        ? hourKeys[pollutantKey]
        : annualKeys[pollutantKey]) ?? [];

    const refRecord = referenceLine as unknown as Record<
      string,
      number | undefined
    >;
    for (const k of candidateKeys) {
      const v = refRecord[k];
      if (typeof v === 'number' && !isNaN(v)) return v;
    }

    return null;
  };

  const referenceValue = getReferenceLineValue(pollutant as string, standards);
  if (!referenceValue) return null;

  const standardsLabel = STANDARDS_SHORT_LABELS[standards] ?? 'WHO';
  const periodLabel = preferPeriod === '24hr' ? '24-hour' : 'annual';
  const lineColor = '#DC2626'; // Consistent red color for all standards
  const valueLabel = `${referenceValue} μg/m³`;
  const descriptiveLabel = `${standardsLabel} · ${periodLabel} guideline`;

  return (
    <ReferenceLine
      y={referenceValue}
      stroke={lineColor}
      strokeDasharray="5 5"
      strokeWidth={2}
      label={
        <CustomLabel
          value={descriptiveLabel}
          valueLabel={valueLabel}
          details={`${standardsLabel} guideline\nPollutant: ${getPollutantLabel(pollutant)}\nAveraging period: ${periodLabel}\nGuideline: ${valueLabel}`}
        />
      }
    />
  );
};
