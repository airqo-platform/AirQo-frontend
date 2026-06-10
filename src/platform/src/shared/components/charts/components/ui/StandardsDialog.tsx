'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/shared/store';
import Dialog from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import Checkbox from '@/shared/components/ui/checkbox';
import {
  WHO_PM25_STANDARDS,
  WHO_PM10_STANDARDS,
  NEMA_KENYA_PM25_STANDARDS,
  NEMA_KENYA_PM10_STANDARDS,
  STANDARDS_ORGANIZATIONS,
  REFERENCE_LINES,
  AIR_QUALITY_ICONS,
} from '../../constants';
import { AirQualityStandardsConfig, ChartStandardsType } from '../../types';
import {
  NEMA_PM25_STANDARDS,
  NEMA_PM10_STANDARDS,
} from '@/shared/utils/airQuality';

// Air quality level colors for consistency
export const colors = {
  Invalid: '#C6D1DB',
  Hazardous: '#D95BA3',
  VeryUnhealthy: '#AC5CD9',
  Unhealthy: '#F7453C',
  UnhealthyForSensitiveGroups: '#FF851F',
  ModerateAir: '#FFD633',
  GoodAir: '#34C759',
  undefined: '#C6D1DB',
};

interface StandardsDialogProps {
  open: boolean;
  onClose: () => void;
  currentStandards?: AirQualityStandardsConfig;
  onApplyStandards: (config: AirQualityStandardsConfig) => void;
  activePollutant?: 'pm2_5' | 'pm10'; // Pollutant from active filter
}

export const StandardsDialog: React.FC<StandardsDialogProps> = ({
  open,
  onClose,
  currentStandards,
  onApplyStandards,
  activePollutant = 'pm2_5',
}) => {
  // Get pollutant from Redux store (primary source of truth)
  const reduxPollutant = useSelector(
    (state: RootState) => state.analytics?.filters?.pollutant
  );

  // Use Redux pollutant if available, otherwise fall back to prop
  const effectivePollutant = reduxPollutant || activePollutant;

  const [selectedOrg, setSelectedOrg] = useState<ChartStandardsType>(
    currentStandards?.organization || 'WHO'
  );
  const [showReferenceLine, setShowReferenceLine] = useState(
    currentStandards?.showReferenceLine ?? true
  );

  // Convert pollutant format from filter to display format
  const displayPollutant: 'PM2.5' | 'PM10' =
    effectivePollutant === 'pm2_5' ? 'PM2.5' : 'PM10';

  // Sync state with props when they change (e.g., when user switches pollutant)
  useEffect(() => {
    if (currentStandards?.organization) {
      setSelectedOrg(currentStandards.organization);
    }
    if (currentStandards?.showReferenceLine !== undefined) {
      setShowReferenceLine(currentStandards.showReferenceLine);
    }
  }, [currentStandards]);

  // Get the appropriate icon for air quality level
  const getAirQualityIcon = (level: string) => {
    // Map level names to air quality level keys
    const levelKeyMap: Record<string, keyof typeof AIR_QUALITY_ICONS> = {
      Good: 'good',
      Moderate: 'moderate',
      'Unhealthy for Sensitive Groups': 'unhealthy-sensitive-groups',
      Unhealthy: 'unhealthy',
      'Very Unhealthy': 'very-unhealthy',
      Hazardous: 'hazardous',
    };

    const levelKey = levelKeyMap[level] || 'good';
    return AIR_QUALITY_ICONS[levelKey];
  };

  // Get color for air quality level
  const getAirQualityColor = (level: string) => {
    const colorMap: Record<string, string> = {
      Good: colors.GoodAir,
      Moderate: colors.ModerateAir,
      'Unhealthy for Sensitive Groups': colors.UnhealthyForSensitiveGroups,
      Unhealthy: colors.Unhealthy,
      'Very Unhealthy': colors.VeryUnhealthy,
      Hazardous: colors.Hazardous,
    };
    return colorMap[level] || colors.GoodAir;
  };

  const getStandardsData = useCallback(() => {
    switch (`${selectedOrg}_${displayPollutant}`) {
      case 'WHO_PM2.5':
        return WHO_PM25_STANDARDS;
      case 'WHO_PM10':
        return WHO_PM10_STANDARDS;
      case 'NEMA_UGANDA_PM2.5':
        return NEMA_PM25_STANDARDS;
      case 'NEMA_UGANDA_PM10':
        return NEMA_PM10_STANDARDS;
      case 'NEMA_KENYA_PM2.5':
        return NEMA_KENYA_PM25_STANDARDS;
      case 'NEMA_KENYA_PM10':
        return NEMA_KENYA_PM10_STANDARDS;
      default:
        return WHO_PM25_STANDARDS;
    }
  }, [selectedOrg, displayPollutant]);

  const getReferenceLine = useCallback(() => {
    if (selectedOrg === 'WHO') {
      switch (displayPollutant) {
        case 'PM2.5':
          return REFERENCE_LINES.WHO.PM25_ANNUAL;
        case 'PM10':
          return REFERENCE_LINES.WHO.PM10_ANNUAL;
        default:
          return REFERENCE_LINES.WHO.PM25_ANNUAL;
      }
    } else if (selectedOrg === 'NEMA_UGANDA') {
      switch (displayPollutant) {
        case 'PM2.5':
          return REFERENCE_LINES.NEMA_UGANDA.PM25_ANNUAL;
        case 'PM10':
          return REFERENCE_LINES.NEMA_UGANDA.PM10_ANNUAL;
        default:
          return REFERENCE_LINES.NEMA_UGANDA.PM25_ANNUAL;
      }
    } else {
      // NEMA_KENYA
      switch (displayPollutant) {
        case 'PM2.5':
          return REFERENCE_LINES.NEMA_KENYA.PM25_ANNUAL;
        case 'PM10':
          return REFERENCE_LINES.NEMA_KENYA.PM10_ANNUAL;
        default:
          return REFERENCE_LINES.NEMA_KENYA.PM25_ANNUAL;
      }
    }
  }, [selectedOrg, displayPollutant]);

  const handleApply = () => {
    onApplyStandards({
      organization: selectedOrg,
      pollutant: displayPollutant,
      showReferenceLine,
    });
    onClose();
  };

  // Memoize standards data and reference line to ensure they update when pollutant or org changes
  const standards = useMemo(() => getStandardsData(), [getStandardsData]);
  const referenceLine = useMemo(() => getReferenceLine(), [getReferenceLine]);

  if (!open) return null;

  return (
    <Dialog
      isOpen={open}
      onClose={onClose}
      title={`Air Quality Standards - ${displayPollutant}`}
      size="lg"
      contentClassName="overflow-y-auto max-h-[75vh]"
      primaryAction={{
        label: 'Apply Standards',
        onClick: handleApply,
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: onClose,
      }}
    >
      <div className="space-y-4">
        {/* Organization Selection */}
        <div className="space-y-2">
          <h3 className="text-sm font-normal">Standards Organization</h3>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(STANDARDS_ORGANIZATIONS).map(([key, label]) => (
              <Button
                key={key}
                variant={selectedOrg === key ? 'filled' : 'outlined'}
                onClick={() => setSelectedOrg(key as ChartStandardsType)}
                className="justify-center h-9 text-xs"
              >
                {label
                  .replace(' (World Health Organization)', '')
                  .replace(' (', '\n(')}
              </Button>
            ))}
          </div>
        </div>

        {/* Reference Line Option */}
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex flex-col gap-0.5">
            <label htmlFor="referenceLine" className="text-sm font-medium">
              Show Reference Line
            </label>
            <span className="text-xs text-muted-foreground">
              {STANDARDS_ORGANIZATIONS[selectedOrg]} annual at {referenceLine}{' '}
              µg/m³
            </span>
            <span className="text-xs text-blue-600">
              {selectedOrg === 'WHO'
                ? displayPollutant === 'PM2.5'
                  ? 'WHO 2021: 5 µg/m³ annual, 15 µg/m³ 24-hour'
                  : 'WHO 2021: 15 µg/m³ annual, 45 µg/m³ 24-hour'
                : selectedOrg === 'NEMA_UGANDA'
                  ? displayPollutant === 'PM2.5'
                    ? 'NEMA Uganda: 25 µg/m³ annual, 35 µg/m³ 24-hour'
                    : 'NEMA Uganda: 40 µg/m³ annual, 60 µg/m³ 24-hour'
                  : displayPollutant === 'PM2.5'
                    ? 'NEMA Kenya (Legal Notice 180/2024): 35 µg/m³ annual, 75 µg/m³ 24-hour'
                    : 'NEMA Kenya (Legal Notice 180/2024): 70 µg/m³ annual, 150 µg/m³ 24-hour'}
            </span>
          </div>
          <Checkbox
            id="referenceLine"
            checked={showReferenceLine}
            onCheckedChange={setShowReferenceLine}
          />
        </div>

        <hr className="border-border my-3" />

        {/* Standards Preview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">
              {STANDARDS_ORGANIZATIONS[selectedOrg]} - {displayPollutant}
            </h3>
            <div className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
              {displayPollutant}
            </div>
          </div>

          {/* Time Period Selection */}
          <div className="flex items-center gap-2 p-2.5 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-1 text-blue-600">
              <svg
                className="w-4 h-4 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-xs font-medium">Research Note:</span>
            </div>
            <span className="text-xs text-blue-700">
              {selectedOrg === 'WHO'
                ? 'WHO 2021 Air Quality Guidelines'
                : selectedOrg === 'NEMA_UGANDA'
                  ? 'NEMA Uganda standards'
                  : 'NEMA Kenya standards (Legal Notice 180/2024)'}{' '}
              for {displayPollutant}
            </span>
          </div>

          {/* Enhanced Standards Display */}
          <div className="space-y-3">
            {standards.map((standard: (typeof standards)[0], index: number) => {
              const IconComponent = getAirQualityIcon(standard.level);
              const iconColor = getAirQualityColor(standard.level);

              // Get specific values for annual and 24-hour based on WHO 2021, NEMA Uganda, and NEMA Kenya standards
              const getDetailedValues = () => {
                const orgPrefix =
                  selectedOrg === 'WHO'
                    ? 'WHO 2021'
                    : selectedOrg === 'NEMA_UGANDA'
                      ? 'NEMA Uganda'
                      : 'NEMA Kenya (LN 180/2024)';

                if (selectedOrg === 'WHO' && displayPollutant === 'PM2.5') {
                  switch (standard.level) {
                    case 'Good':
                      return {
                        annual: '0-5 µg/m³',
                        daily: '0-15 µg/m³',
                        note: `${orgPrefix}: Annual guideline 5 µg/m³, 24-hour guideline 15 µg/m³`,
                      };
                    case 'Moderate':
                      return {
                        annual: '5-15 µg/m³',
                        daily: '15-25 µg/m³',
                        note: `${orgPrefix}: Above annual guideline, approaching 24-hour limit`,
                      };
                    default:
                      return {
                        annual: `${standard.range.min}-${standard.range.max === Infinity ? '∞' : standard.range.max} µg/m³`,
                        daily: 'Exceeds 24-hour guidelines',
                        note: `${orgPrefix}: Significantly above health-protective levels`,
                      };
                  }
                } else if (
                  selectedOrg === 'WHO' &&
                  displayPollutant === 'PM10'
                ) {
                  switch (standard.level) {
                    case 'Good':
                      return {
                        annual: '0-15 µg/m³',
                        daily: '0-45 µg/m³',
                        note: `${orgPrefix}: Annual guideline 15 µg/m³, 24-hour guideline 45 µg/m³`,
                      };
                    case 'Moderate':
                      return {
                        annual: '15-45 µg/m³',
                        daily: '45-75 µg/m³',
                        note: `${orgPrefix}: Above annual guideline, approaching 24-hour limit`,
                      };
                    default:
                      return {
                        annual: `${standard.range.min}-${standard.range.max === Infinity ? '∞' : standard.range.max} µg/m³`,
                        daily: 'Exceeds 24-hour guidelines',
                        note: `${orgPrefix}: Significantly above health-protective levels`,
                      };
                  }
                } else if (selectedOrg === 'NEMA_UGANDA') {
                  // NEMA Uganda standards
                  if (displayPollutant === 'PM2.5') {
                    return {
                      annual: `${standard.range.min}-${standard.range.max === Infinity ? '∞' : standard.range.max} µg/m³`,
                      daily:
                        standard.level === 'Moderate'
                          ? '24h: 35 µg/m³'
                          : standard.level === 'Good'
                            ? '24h: <35 µg/m³'
                            : 'Exceeds 24h limit',
                      note: `${orgPrefix}: Annual 25 µg/m³, 24-hour 35 µg/m³`,
                    };
                  } else {
                    // PM10
                    return {
                      annual: `${standard.range.min}-${standard.range.max === Infinity ? '∞' : standard.range.max} µg/m³`,
                      daily:
                        standard.level === 'Moderate'
                          ? '24h: 60 µg/m³'
                          : standard.level === 'Good'
                            ? '24h: <60 µg/m³'
                            : 'Exceeds 24h limit',
                      note: `${orgPrefix}: Annual 40 µg/m³, 24-hour 60 µg/m³`,
                    };
                  }
                } else {
                  // NEMA Kenya standards
                  if (displayPollutant === 'PM2.5') {
                    return {
                      annual: `${standard.range.min}-${standard.range.max === Infinity ? '∞' : standard.range.max} µg/m³`,
                      daily:
                        standard.level === 'Moderate'
                          ? '24h: 75 µg/m³'
                          : standard.level === 'Good'
                            ? '24h: <75 µg/m³'
                            : 'Exceeds 24h limit',
                      note: `${orgPrefix}: Annual 35 µg/m³, 24-hour 75 µg/m³`,
                    };
                  } else {
                    // PM10
                    return {
                      annual: `${standard.range.min}-${standard.range.max === Infinity ? '∞' : standard.range.max} µg/m³`,
                      daily:
                        standard.level === 'Moderate'
                          ? '24h: 150 µg/m³'
                          : standard.level === 'Good'
                            ? '24h: <150 µg/m³'
                            : 'Exceeds 24h limit',
                      note: `${orgPrefix}: Annual 70 µg/m³, 24-hour 150 µg/m³`,
                    };
                  }
                }
              };

              const detailedValues = getDetailedValues();

              return (
                <div
                  key={index}
                  className="border border-border rounded-lg p-3 hover:shadow-sm transition-all bg-card"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span style={{ color: iconColor }}>
                        <IconComponent className="h-4 w-4" />
                      </span>
                      <span className="font-medium text-sm text-foreground">
                        {standard.level}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="space-y-0.5">
                        <div className="text-muted-foreground font-medium">
                          Annual
                        </div>
                        <div className="font-mono text-foreground text-xs">
                          {detailedValues.annual}
                        </div>
                      </div>
                      <div className="space-y-0.5">
                        <div className="text-muted-foreground font-medium">
                          24-Hour
                        </div>
                        <div className="font-mono text-foreground text-xs">
                          {detailedValues.daily}
                        </div>
                      </div>
                    </div>

                    <div className="pt-1.5 border-t border-border">
                      <p className="text-xs text-muted-foreground leading-snug">
                        {standard.description}
                      </p>
                      <p className="text-xs text-blue-600 mt-0.5 font-medium">
                        {detailedValues.note}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Dialog>
  );
};
