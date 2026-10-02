'use client';

import React from 'react';
import { ReferenceLine } from 'recharts';
import { PollutantType, StandardsType } from '../../types';
import { getCurrentAirQualityLimits, REFERENCE_LINES } from '../../constants';
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
  standardsLabel?: string;
  /** Bold value line, e.g. "15 μg/m³" */
  valueLabel?: string;
  details?: string;
}

const CUSTOM_LABEL_HORIZONTAL_PADDING = 10;
const CUSTOM_LABEL_VERTICAL_PADDING = 4;
const CUSTOM_LABEL_MAX_CONTENT_WIDTH = 132;
const CUSTOM_LABEL_MIN_WIDTH = 58;
const CUSTOM_LABEL_LINE_HEIGHT = 12;
const CUSTOM_LABEL_VALUE_GAP = 2;

const estimateTextWidth = (text: string, fontSize: number) =>
  text.length * fontSize * 0.58;

const wrapLabel = (text: string) => {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let line = '';

  words.forEach(word => {
    const candidate = line ? `${line} ${word}` : word;
    if (
      line &&
      estimateTextWidth(candidate, 10) > CUSTOM_LABEL_MAX_CONTENT_WIDTH
    ) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  });

  if (line) lines.push(line);
  return lines;
};

const CustomLabel: React.FC<CustomLabelProps> = ({
  viewBox,
  valueLabel,
  details,
  value,
  standardsLabel,
}) => {
  if (!valueLabel || !standardsLabel || !viewBox) return null;

  const { x = 0, y = 0 } = viewBox;
  const standardsLines = wrapLabel(standardsLabel);
  const contentWidth = Math.max(
    ...standardsLines.map(line => estimateTextWidth(line, 10)),
    estimateTextWidth(valueLabel, 11)
  );
  const labelWidth =
    Math.ceil(
      Math.max(
        CUSTOM_LABEL_MIN_WIDTH - CUSTOM_LABEL_HORIZONTAL_PADDING * 2,
        Math.min(contentWidth, CUSTOM_LABEL_MAX_CONTENT_WIDTH)
      )
    ) +
    CUSTOM_LABEL_HORIZONTAL_PADDING * 2;
  const labelHeight =
    CUSTOM_LABEL_VERTICAL_PADDING * 2 +
    standardsLines.length * CUSTOM_LABEL_LINE_HEIGHT +
    CUSTOM_LABEL_VALUE_GAP +
    14;

  // Position at the left end of the reference line, clearly above it
  const labelX = x + 4;
  const labelY = y - labelHeight - 6;
  const labelCenterX = labelX + labelWidth / 2;
  const standardsLabelY = labelY + CUSTOM_LABEL_VERTICAL_PADDING + 10;
  const valueLabelY =
    labelY +
    CUSTOM_LABEL_VERTICAL_PADDING +
    standardsLines.length * CUSTOM_LABEL_LINE_HEIGHT +
    CUSTOM_LABEL_VALUE_GAP +
    10;

  return (
    <g style={{ isolation: 'isolate', zIndex: 10 }}>
      <title>{details ?? value}</title>
      <rect
        x={labelX}
        y={labelY}
        width={labelWidth}
        height={labelHeight}
        fill="#DC2626"
        rx={5}
        ry={5}
        stroke="#DC2626"
        strokeWidth={1}
      />
      {standardsLines.map((line, index) => (
        <text
          key={`${line}-${index}`}
          x={labelCenterX}
          y={standardsLabelY + index * CUSTOM_LABEL_LINE_HEIGHT}
          textAnchor="middle"
          fill="white"
          fontSize="10px"
          fontWeight="500"
        >
          {line}
        </text>
      ))}
      <text
        x={labelCenterX}
        y={valueLabelY}
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
  WHO: 'WHO',
  NEMA_UGANDA: 'NEMA (Uganda)',
  NEMA_KENYA: 'NEMA (Kenya)',
  RWANDA: 'Rwanda (RSB/EAS)',
  GHANA: 'Ghana (GS 1236:2019)',
  SOUTH_AFRICA: 'South Africa (NEM:AQA)',
  NIGERIA: 'Nigeria (NESREA)',
};

export const CustomReferenceLine: React.FC<CustomReferenceLineProps> = ({
  pollutant,
  standards,
  showReferenceLine = true,
  preferPeriod = '24hr',
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

  let resolvedPeriod = preferPeriod;
  const getReferenceLineValue = (
    rawPollutant: string,
    rawStandards: StandardsType
  ) => {
    const pollutantKey = normalizePollutant(rawPollutant as string);
    const standardsKey = rawStandards || 'WHO';

    if (pollutantKey === 'pm2_5' || pollutantKey === 'pm10') {
      const limits = getCurrentAirQualityLimits(
        standardsKey,
        pollutantKey === 'pm10' ? 'PM10' : 'PM2.5'
      );
      const preferredLimit =
        preferPeriod === '24hr' ? limits.daily : limits.annual;
      if (preferredLimit !== null) return preferredLimit;

      const fallbackLimit =
        preferPeriod === '24hr' ? limits.annual : limits.daily;
      if (fallbackLimit !== null) {
        resolvedPeriod = preferPeriod === '24hr' ? 'annual' : '24hr';
        return fallbackLimit;
      }
      return null;
    }

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
      if (typeof v === 'number' && !isNaN(v)) {
        if (k.endsWith('_ANNUAL')) resolvedPeriod = 'annual';
        else if (k.endsWith('_24HR')) resolvedPeriod = '24hr';
        return v;
      }
    }

    return null;
  };

  const referenceValue = getReferenceLineValue(pollutant as string, standards);
  if (!referenceValue) return null;

  const standardsLabel = STANDARDS_SHORT_LABELS[standards] ?? 'WHO';
  const periodLabel = resolvedPeriod === '24hr' ? '24-hour' : 'annual';
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
          standardsLabel={standardsLabel}
          valueLabel={valueLabel}
          details={`${standardsLabel} guideline\nPollutant: ${getPollutantLabel(pollutant)}\nAveraging period: ${periodLabel}\nGuideline: ${valueLabel}`}
        />
      }
    />
  );
};
