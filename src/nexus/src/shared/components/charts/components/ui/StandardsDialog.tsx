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
  SOUTH_AFRICA_PM25_STANDARDS,
  SOUTH_AFRICA_PM10_STANDARDS,
  NIGERIA_PM25_STANDARDS,
  NIGERIA_PM10_STANDARDS,
  STANDARDS_ORGANIZATIONS,
  REFERENCE_LINES,
} from '../../constants';
import { AirQualityStandardsConfig, ChartStandardsType } from '../../types';
import {
  NEMA_PM25_STANDARDS,
  NEMA_PM10_STANDARDS,
  getAirQualityColor as getConfiguredAirQualityColor,
  getAirQualityIcon,
  mapAqiCategoryToLevel,
} from '@/shared/utils/airQuality';

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

  // Get color for air quality level
  const getAirQualityColor = (level: string) => {
    return getConfiguredAirQualityColor(mapAqiCategoryToLevel(level));
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
      case 'SOUTH_AFRICA_PM2.5':
        return SOUTH_AFRICA_PM25_STANDARDS;
      case 'SOUTH_AFRICA_PM10':
        return SOUTH_AFRICA_PM10_STANDARDS;
      case 'NIGERIA_PM2.5':
        return NIGERIA_PM25_STANDARDS;
      case 'NIGERIA_PM10':
        return NIGERIA_PM10_STANDARDS;
      default:
        return WHO_PM25_STANDARDS;
    }
  }, [selectedOrg, displayPollutant]);

  // Annual + 24-hour limits for the selected organization/pollutant, read
  // straight from REFERENCE_LINES so the dialog always agrees with the
  // reference line drawn on the chart.
  const getLimits = useCallback(() => {
    const lines = REFERENCE_LINES[selectedOrg] ?? REFERENCE_LINES.WHO;
    return {
      annual:
        displayPollutant === 'PM2.5' ? lines.PM25_ANNUAL : lines.PM10_ANNUAL,
      daily:
        displayPollutant === 'PM2.5' ? lines.PM25_24HR : lines.PM10_24HR,
    };
  }, [selectedOrg, displayPollutant]);

  const getReferenceLine = useCallback(() => {
    return getLimits().annual;
  }, [getLimits]);

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
      size="xl"
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
              {getLimits().annual} µg/m³ annual, {getLimits().daily} µg/m³
              24-hour
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
                  ? 'NEMA Uganda standards (SI 22 of 2024)'
                  : selectedOrg === 'NEMA_KENYA'
                    ? 'NEMA Kenya standards (Legal Notice 180/2024)'
                    : selectedOrg === 'SOUTH_AFRICA'
                      ? 'South Africa NEM: Air Quality Act standards (GN 1210/2009, GN 486/2012)'
                      : 'Nigeria NESREA standards (SI 88 of 2021)'}{' '}
              for {displayPollutant}
            </span>
          </div>

          {/* Enhanced Standards Display */}
          <div className="space-y-3">
            {standards.map((standard: (typeof standards)[0]) => {
              const standardLevel = mapAqiCategoryToLevel(standard.level);
              const IconComponent = getAirQualityIcon(standardLevel);
              const iconColor = getAirQualityColor(standardLevel);

              {/* Get specific values for annual and 24-hour based on the
                  selected organization's legal limits (from REFERENCE_LINES
                  so the dialog always agrees with the chart line). */}
              const getDetailedValues = () => {
                const orgPrefix = STANDARDS_ORGANIZATIONS[selectedOrg]
                  .replace(' (World Health Organization)', '')
                  .replace(' (NEM:AQA)', ' (SA)');
                const { annual, daily } = getLimits();

                if (standard.level === 'Good') {
                  return {
                    annual: `0-${annual} µg/m³`,
                    daily: `0-${daily} µg/m³`,
                    note: `${orgPrefix}: Annual ${annual} µg/m³, 24-hour ${daily} µg/m³`,
                  };
                }
                if (standard.level === 'Moderate') {
                  return {
                    annual: `${annual}-${daily} µg/m³`,
                    daily: `≤${daily} µg/m³`,
                    note: `${orgPrefix}: Above annual limit, within 24-hour limit`,
                  };
                }
                return {
                  annual: `${standard.range.min}-${standard.range.max === Infinity ? '∞' : standard.range.max} µg/m³`,
                  daily: 'Exceeds 24-hour limit',
                  note: `${orgPrefix}: Significantly above the 24-hour limit`,
                };
              };

              const detailedValues = getDetailedValues();

              return (
                <div
                  key={standard.level}
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
