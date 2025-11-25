'use client';

import React from 'react';
import { ReferenceLine } from 'recharts';
import { PollutantType, StandardsType } from '../../types';
import { REFERENCE_LINES } from '../../constants';

interface CustomReferenceLineProps {
  pollutant: PollutantType;
  standards: StandardsType;
  showReferenceLine?: boolean;
}

interface CustomLabelProps {
  viewBox?: {
    x?: number;
    y?: number;
    width?: number;
    height?: number;
  };
  value?: string;
}

const CustomLabel: React.FC<CustomLabelProps> = ({ viewBox, value }) => {
  if (!value || !viewBox) return null;

  const { x = 0, width = 0, y = 0 } = viewBox;

  // Position at the right end of the reference line, above the chart
  const labelX = x + width - 70; // 70px from the right edge
  const labelY = y - 1; // Slightly above the line (moved down from -15)

  return (
    <g>
      <rect
        x={labelX}
        y={labelY}
        width={60}
        height={20}
        fill="#DC2626"
        rx={4}
        ry={4}
        stroke="#DC2626"
        strokeWidth={1}
      />
      <text
        x={labelX + 30}
        y={labelY + 14}
        textAnchor="middle"
        fill="white"
        fontSize="11px"
        fontWeight="600"
      >
        {value}
      </text>
    </g>
  );
};

export const CustomReferenceLine: React.FC<CustomReferenceLineProps> = ({
  pollutant,
  standards,
  showReferenceLine = true,
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

    // Try to find the most appropriate key (prefer 24HR/8HR where applicable, fall back to ANNUAL)
    const candidateKeys: string[] = [];
    switch (pollutantKey) {
      case 'pm2_5':
        candidateKeys.push('PM25_24HR', 'PM25_ANNUAL');
        break;
      case 'pm10':
        candidateKeys.push('PM10_24HR', 'PM10_ANNUAL');
        break;
      case 'no2':
        candidateKeys.push('NO2_24HR', 'NO2_ANNUAL');
        break;
      case 'co':
        candidateKeys.push('CO_8HR');
        break;
      case 'so2':
        candidateKeys.push('SO2_24HR');
        break;
      case 'o3':
        candidateKeys.push('O3_8HR');
        break;
      default:
        return null;
    }

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

  const standardsLabel =
    standards === 'WHO'
      ? 'WHO'
      : standards === 'NEMA_UGANDA'
        ? 'NEMA(UG)'
        : standards === 'NEMA_KENYA'
          ? 'NEMA(KE)'
          : 'WHO';
  const lineColor = '#DC2626'; // Consistent red color for all standards

  return (
    <ReferenceLine
      y={referenceValue}
      stroke={lineColor}
      strokeDasharray="5 5"
      strokeWidth={2}
      label={<CustomLabel value={standardsLabel} />}
    />
  );
};
