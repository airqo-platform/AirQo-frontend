'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/shared/store';
import Dialog from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import Checkbox from '@/shared/components/ui/checkbox';
import {
  getCurrentAirQualityLimits,
  OFFICIAL_AIR_QUALITY_STANDARDS,
  STANDARDS_ORGANIZATIONS,
} from '../../constants';
import type {
  AirQualityStandardsConfig,
  ChartStandardsType,
} from '../../types';

interface StandardsDialogProps {
  open: boolean;
  onClose: () => void;
  currentStandards?: AirQualityStandardsConfig;
  onApplyStandards: (config: AirQualityStandardsConfig) => void;
  activePollutant?: 'pm2_5' | 'pm10';
}

const formatValue = (value: number | null) =>
  value === null ? 'Not specified' : `${value} µg/m³`;

export const StandardsDialog: React.FC<StandardsDialogProps> = ({
  open,
  onClose,
  currentStandards,
  onApplyStandards,
  activePollutant = 'pm2_5',
}) => {
  const reduxPollutant = useSelector(
    (state: RootState) => state.analytics?.filters?.pollutant
  );
  const effectivePollutant = reduxPollutant || activePollutant;
  const displayPollutant: 'PM2.5' | 'PM10' =
    effectivePollutant === 'pm2_5' ? 'PM2.5' : 'PM10';

  const [selectedOrg, setSelectedOrg] = useState<ChartStandardsType>(
    currentStandards?.organization || 'WHO'
  );
  const [showReferenceLine, setShowReferenceLine] = useState(
    currentStandards?.showReferenceLine ?? true
  );

  useEffect(() => {
    if (currentStandards?.organization) {
      setSelectedOrg(currentStandards.organization);
    }
    if (currentStandards?.showReferenceLine !== undefined) {
      setShowReferenceLine(currentStandards.showReferenceLine);
    }
  }, [currentStandards]);

  const standard = OFFICIAL_AIR_QUALITY_STANDARDS[selectedOrg];
  const limits = getCurrentAirQualityLimits(selectedOrg, displayPollutant);
  const hasReferenceLimit =
    typeof limits.annual === 'number' || typeof limits.daily === 'number';

  const handleApply = () => {
    onApplyStandards({
      organization: selectedOrg,
      pollutant: displayPollutant,
      showReferenceLine: showReferenceLine && hasReferenceLimit,
    });
    onClose();
  };

  if (!open) return null;

  return (
    <Dialog
      isOpen={open}
      onClose={onClose}
      title={`Air Quality Standards - ${displayPollutant}`}
      size="xl"
      contentClassName="overflow-y-auto max-h-[75vh]"
      primaryAction={{ label: 'Apply Standards', onClick: handleApply }}
      secondaryAction={{ label: 'Cancel', onClick: onClose }}
    >
      <div className="space-y-4">
        <section
          className="space-y-2"
          aria-labelledby="standards-organization-heading"
        >
          <h3
            id="standards-organization-heading"
            className="text-sm font-normal"
          >
            Standards organization
          </h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {Object.entries(STANDARDS_ORGANIZATIONS).map(([key, label]) => (
              <Button
                key={key}
                variant={selectedOrg === key ? 'filled' : 'outlined'}
                onClick={() => setSelectedOrg(key as ChartStandardsType)}
                className="h-9 justify-center text-xs"
                aria-pressed={selectedOrg === key}
              >
                {label
                  .replace(' (World Health Organization)', '')
                  .replace(' (', '\n(')}
              </Button>
            ))}
          </div>
        </section>

        <section
          className="rounded-lg bg-muted/50 p-3"
          aria-label="Chart reference line"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-1">
              <label htmlFor="referenceLine" className="text-sm font-medium">
                Show chart reference line
              </label>
              <p className="text-xs text-muted-foreground">
                {typeof limits.annual === 'number'
                  ? `${STANDARDS_ORGANIZATIONS[selectedOrg]} annual average: ${formatValue(limits.annual)}. The 24-hour value is ${formatValue(limits.daily)}.`
                  : typeof limits.daily === 'number'
                    ? `No annual value is specified. The 24-hour limit is ${formatValue(limits.daily)}.`
                    : 'No numeric reference limit is available from this source.'}
              </p>
            </div>
            <Checkbox
              id="referenceLine"
              checked={showReferenceLine && hasReferenceLimit}
              disabled={!hasReferenceLimit}
              onCheckedChange={setShowReferenceLine}
            />
          </div>
        </section>

        <section
          className="space-y-3"
          aria-labelledby="published-limits-heading"
        >
          <div>
            <h3 id="published-limits-heading" className="text-sm font-medium">
              {STANDARDS_ORGANIZATIONS[selectedOrg]} · {displayPollutant}
            </h3>
            <p className="text-xs font-medium text-muted-foreground">
              {standard.kind}
            </p>
            <p className="text-xs text-muted-foreground">
              {standard.instrument}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs font-medium text-muted-foreground">
                Annual average
              </p>
              <p className="mt-1 text-lg font-semibold">
                {formatValue(limits.annual)}
              </p>
              {limits.annualExceedanceRule && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {limits.annualExceedanceRule}
                </p>
              )}
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs font-medium text-muted-foreground">
                24-hour average
              </p>
              <p className="mt-1 text-lg font-semibold">
                {formatValue(limits.daily)}
              </p>
              {limits.dailyExceedanceRule && (
                <p className="mt-1 text-xs text-muted-foreground">
                  {limits.dailyExceedanceRule}
                </p>
              )}
            </div>
          </div>

          {limits.unavailableReason && !hasReferenceLimit && (
            <p className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              {limits.unavailableReason} The app does not draw a reference line
              for this pollutant and organization.
            </p>
          )}

          {limits.context && (
            <p className="text-xs text-muted-foreground">{limits.context}</p>
          )}

          {limits.areaLimits && (
            <div className="overflow-hidden rounded-lg border border-border">
              <p className="border-b border-border bg-muted/50 px-3 py-2 text-xs font-medium">
                PM10 limits by area type
              </p>
              <div className="divide-y divide-border">
                {limits.areaLimits.map(areaLimit => (
                  <div
                    key={areaLimit.area}
                    className="grid grid-cols-1 items-start gap-1 px-3 py-2 text-xs sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:gap-3"
                  >
                    <span>{areaLimit.area}</span>
                    <span>Annual: {formatValue(areaLimit.annual)}</span>
                    <span>
                      24-hour: {formatValue(areaLimit.daily)}
                      {areaLimit.dailyExceedanceRule && (
                        <span className="mt-1 block text-muted-foreground">
                          {areaLimit.dailyExceedanceRule}
                        </span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {limits.nextPhase && (
            <p className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
              From {limits.nextPhase.starts}: annual{' '}
              {formatValue(limits.nextPhase.annual)}; 24-hour{' '}
              {formatValue(limits.nextPhase.daily)}.
            </p>
          )}

          {standard.note && (
            <p className="text-xs leading-relaxed text-muted-foreground">
              {standard.note}
            </p>
          )}
        </section>

        <section
          className="space-y-2 border-t border-border pt-3"
          aria-labelledby="source-heading"
        >
          <h3 id="source-heading" className="text-sm font-medium">
            Source
          </h3>
          <ul className="space-y-1">
            {standard.sources.map(source => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 underline underline-offset-2 hover:text-blue-700"
                >
                  {source.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </Dialog>
  );
};
