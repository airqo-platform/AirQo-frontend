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
}

export const StandardsDialog: React.FC<StandardsDialogProps> = ({
  open,
  onClose,
  currentStandards,
  onApplyStandards,
}) => {
  const [selectedOrg, setSelectedOrg] = useState<ChartStandardsType>(
    currentStandards?.organization || 'WHO'
  );
  const [selectedPollutant, setSelectedPollutant] = useState<'PM2.5' | 'PM10'>(
    'PM2.5'
  );
  const [showReferenceLine, setShowReferenceLine] = useState(
    currentStandards?.showReferenceLine ?? true
  );

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
    switch (`${selectedOrg}_${selectedPollutant}`) {
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
      switch (selectedPollutant) {
        case 'PM2.5':
          return REFERENCE_LINES.WHO.PM25_ANNUAL;
        case 'PM10':
          return REFERENCE_LINES.WHO.PM10_ANNUAL;
        default:
          return REFERENCE_LINES.WHO.PM25_ANNUAL;
      }
    } else {
      // NEMA only supports PM2.5 and PM10
      switch (selectedPollutant) {
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
      pollutant: selectedPollutant,
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
      title="Air Quality Standards & Reference Lines"
      size="lg"
      contentClassName="overflow-y-auto"
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
              Display guideline threshold at {referenceLine} µg/m³
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
            <h3 className="text-lg font-normal">
              {STANDARDS_ORGANIZATIONS[selectedOrg]} - {selectedPollutant}{' '}
              Standards
            </h3>
            <span className="text-sm text-muted-foreground">
              Annual guideline levels
            </span>
          </div>

          {/* Pollutant Selection Tabs */}
          <div className="space-y-3">
            <h3 className="text-sm font-normal">View Standards For</h3>
            <div className="flex gap-2">
              {(['PM2.5', 'PM10'] as const).map(pollutant => (
                <button
                  key={pollutant}
                  onClick={() => setSelectedPollutant(pollutant)}
                  className={cn(
                    'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    selectedPollutant === pollutant
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  )}
                >
                  {pollutant}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {standards.map((standard: (typeof standards)[0], index: number) => {
              const IconComponent = getAirQualityIcon(standard.level);
              const iconColor = getAirQualityColor(standard.level);

              return (
                <div
                  key={index}
                  className="border border-border rounded-md p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">
                      {standard.level}
                    </span>
                    <span style={{ color: iconColor }}>
                      <IconComponent className="h-5 w-5" />
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    {standard.range.min}-
                    {standard.range.max === Infinity ? '∞' : standard.range.max}{' '}
                    µg/m³
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-2">
                    {standard.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Dialog>
  );
};
