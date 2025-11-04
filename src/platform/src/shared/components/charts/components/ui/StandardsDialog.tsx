'use client';

import React, { useState } from 'react';
import Dialog from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import Checkbox from '@/shared/components/ui/checkbox';
import {
  WHO_PM25_STANDARDS,
  WHO_PM10_STANDARDS,
  STANDARDS_ORGANIZATIONS,
  REFERENCE_LINES,
  AIR_QUALITY_ICONS,
} from '../../constants';
import { AirQualityStandardsConfig, ChartStandardsType } from '../../types';

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

import { cn } from '@/shared/lib/utils';

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
  const [selectedOrg, setSelectedOrg] = useState<ChartStandardsType>(
    currentStandards?.organization || 'WHO'
  );
  const [showReferenceLine, setShowReferenceLine] = useState(
    currentStandards?.showReferenceLine ?? true
  );
  const [viewMode, setViewMode] = useState<'annual' | '24hour'>('annual');

  // Convert pollutant format from filter to display format
  const displayPollutant: 'PM2.5' | 'PM10' =
    activePollutant === 'pm2_5' ? 'PM2.5' : 'PM10';

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

  const getStandardsData = () => {
    switch (`${selectedOrg}_${displayPollutant}`) {
      case 'WHO_PM2.5':
        return WHO_PM25_STANDARDS;
      case 'WHO_PM10':
        return WHO_PM10_STANDARDS;
      default:
        return WHO_PM25_STANDARDS;
    }
  };

  const getReferenceLine = () => {
    if (selectedOrg === 'WHO') {
      switch (displayPollutant) {
        case 'PM2.5':
          return REFERENCE_LINES.WHO.PM25_ANNUAL;
        case 'PM10':
          return REFERENCE_LINES.WHO.PM10_ANNUAL;
        default:
          return REFERENCE_LINES.WHO.PM25_ANNUAL;
      }
    } else {
      // NEMA only supports PM2.5 and PM10
      switch (displayPollutant) {
        case 'PM2.5':
          return REFERENCE_LINES.NEMA.PM25_ANNUAL;
        case 'PM10':
          return REFERENCE_LINES.NEMA.PM10_ANNUAL;
        default:
          return REFERENCE_LINES.NEMA.PM25_ANNUAL;
      }
    }
  };

  const handleApply = () => {
    onApplyStandards({
      organization: selectedOrg,
      pollutant: displayPollutant,
      showReferenceLine,
    });
    onClose();
  };

  const standards = getStandardsData();
  const referenceLine = getReferenceLine();

  if (!open) return null;

  return (
    <Dialog
      isOpen={open}
      onClose={onClose}
      title={`Air Quality Standards - ${displayPollutant} Research Guidelines`}
      size="lg"
      contentClassName="overflow-y-auto max-h-[80vh]"
      primaryAction={{
        label: 'Apply Standards',
        onClick: handleApply,
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: onClose,
      }}
    >
      <div className="space-y-6">
        {/* Organization Selection */}
        <div className="space-y-3">
          <h3 className="text-sm font-normal">Standards Organization</h3>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(STANDARDS_ORGANIZATIONS).map(([key, label]) => (
              <Button
                key={key}
                variant={selectedOrg === key ? 'filled' : 'outlined'}
                onClick={() => setSelectedOrg(key as ChartStandardsType)}
                className="justify-start h-11"
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Reference Line Option */}
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
          <div className="flex flex-col">
            <label htmlFor="referenceLine" className="text-sm font-medium">
              Show Reference Line
            </label>
            <span className="text-xs text-muted-foreground">
              Display {selectedOrg} {displayPollutant} annual guideline at{' '}
              {referenceLine} µg/m³ on charts
            </span>
            <span className="text-xs text-blue-600 mt-1">
              {selectedOrg === 'WHO'
                ? displayPollutant === 'PM2.5'
                  ? 'WHO 2021: 5 µg/m³ annual, 15 µg/m³ 24-hour'
                  : 'WHO 2021: 15 µg/m³ annual, 45 µg/m³ 24-hour'
                : displayPollutant === 'PM2.5'
                  ? 'NEMA Uganda: 25 µg/m³ annual, 35 µg/m³ 24-hour'
                  : 'NEMA Uganda: 40 µg/m³ annual, 60 µg/m³ 24-hour'}
            </span>
          </div>
          <Checkbox
            id="referenceLine"
            checked={showReferenceLine}
            onCheckedChange={setShowReferenceLine}
          />
        </div>

        <hr className="border-border" />

        {/* Standards Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium">
              {STANDARDS_ORGANIZATIONS[selectedOrg]} - {displayPollutant}{' '}
              Standards
            </h3>
            <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              Active Pollutant: {displayPollutant}
            </div>
          </div>

          {/* Time Period Selection */}
          <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex items-center gap-1 text-blue-600">
              <svg
                className="w-4 h-4"
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
              <span className="text-sm font-medium">Research Note:</span>
            </div>
            <span className="text-sm text-blue-700">
              Standards shown are{' '}
              {selectedOrg === 'WHO'
                ? 'WHO 2021 guidelines'
                : 'NEMA Uganda standards'}{' '}
              for {displayPollutant} measurements
            </span>
          </div>

          {/* View Mode Selector */}
          <div className="flex gap-1 p-1 bg-muted rounded-lg">
            {(['annual', '24hour'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={cn(
                  'flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  viewMode === mode
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {mode === 'annual' ? 'Annual Guidelines' : '24-Hour Guidelines'}
              </button>
            ))}
          </div>

          {/* Enhanced Standards Display */}
          <div className="space-y-3">
            {standards.map((standard: (typeof standards)[0], index: number) => {
              const IconComponent = getAirQualityIcon(standard.level);
              const iconColor = getAirQualityColor(standard.level);

              // Get specific values for annual and 24-hour based on WHO 2021 and NEMA standards
              const getDetailedValues = () => {
                const orgPrefix =
                  selectedOrg === 'WHO' ? 'WHO 2021' : 'NEMA Uganda';

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
                } else {
                  // NEMA standards
                  return {
                    annual: `${standard.range.min}-${standard.range.max === Infinity ? '∞' : standard.range.max} µg/m³`,
                    daily:
                      viewMode === '24hour'
                        ? 'See NEMA regulations'
                        : 'Annual average',
                    note: `${orgPrefix}: Local regulatory standards for Uganda`,
                  };
                }
              };

              const detailedValues = getDetailedValues();

              return (
                <div
                  key={index}
                  className="border border-border rounded-lg p-4 hover:shadow-sm transition-all bg-card"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span style={{ color: iconColor }}>
                        <IconComponent className="h-5 w-5" />
                      </span>
                      <span className="font-medium text-sm text-foreground">
                        {standard.level}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      AQI Category
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="text-muted-foreground font-medium">
                          Annual Average
                        </div>
                        <div className="font-mono text-foreground">
                          {detailedValues.annual}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="text-muted-foreground font-medium">
                          24-Hour Average
                        </div>
                        <div className="font-mono text-foreground">
                          {detailedValues.daily}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-border">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {standard.description}
                      </p>
                      <p className="text-xs text-blue-600 mt-1 font-medium">
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
