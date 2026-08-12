'use client';

import React, { useEffect, useMemo, useState } from 'react';
import ReusableDialog from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import SelectField from '@/shared/components/ui/select';
import Checkbox from '@/shared/components/ui/checkbox';
import { DatePicker } from '@/shared/components/calendar';
import type { DateRange } from '@/shared/components/calendar';
import { AqPresentationChart02 } from '@airqo/icons-react';
import { LocationPickerSection } from './LocationPickerSection';
import {
  deriveRangeFromDays,
  type ExplorerChartDraft,
  type ExplorerChartType,
} from '../../utils/chartConfig';
import type { PollutantType, FrequencyType } from '@/shared/components/charts/types';

const CHART_TYPE_OPTIONS: { value: ExplorerChartType; label: string }[] = [
  { value: 'Line', label: 'Line' },
  { value: 'Area', label: 'Area' },
  { value: 'Bar', label: 'Bar' },
];

const POLLUTANT_OPTIONS: { value: PollutantType; label: string }[] = [
  { value: 'pm2_5', label: 'PM2.5' },
  { value: 'pm10', label: 'PM10' },
];

const FREQUENCY_OPTIONS: { value: FrequencyType; label: string }[] = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
];

const COLOR_PRESETS = [
  '#145DFF',
  '#10B981',
  '#ECAA06',
  '#8B5CF6',
  '#0891B2',
  '#EA580C',
  '#DB2777',
];

interface ChartConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  /** Draft to edit; a new draft is created when omitted */
  draft?: ExplorerChartDraft | null;
  onSave: (draft: ExplorerChartDraft) => void;
  /** Forwarded from the location picker so the page can label chips/forecast */
  onSelectionNamesChange?: (names: Map<string, string>) => void;
  isSaving?: boolean;
  saveError?: string | null;
}

/**
 * Create/edit a chart configuration: display fields (title, subtitle),
 * data shape (pollutant, frequency, chart type, custom date range), styling
 * (series color — default palette when unset — plus legend/grid/tooltip
 * toggles) and the locations the chart covers (sites/devices picker).
 */
export const ChartConfigDialog: React.FC<ChartConfigDialogProps> = ({
  isOpen,
  onClose,
  groupId,
  draft = null,
  onSave,
  onSelectionNamesChange,
  isSaving = false,
  saveError = null,
}) => {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [chartType, setChartType] = useState<ExplorerChartType>('Line');
  const [pollutant, setPollutant] = useState<PollutantType>('pm2_5');
  const [frequency, setFrequency] = useState<FrequencyType>('daily');
  // Initialized with a valid range so the DatePicker never renders
  // `new Date('')` before the seed effect runs.
  const [startDate, setStartDate] = useState(
    () => deriveRangeFromDays(7).startDate
  );
  const [endDate, setEndDate] = useState(
    () => deriveRangeFromDays(7).endDate
  );
  const [color, setColor] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showTooltip, setShowTooltip] = useState(true);
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([]);

  // Seed the form when the dialog opens
  useEffect(() => {
    if (!isOpen) return;
    setTitle(draft?.title ?? '');
    setSubtitle(draft?.subtitle ?? '');
    setChartType(draft?.chartType ?? 'Line');
    setPollutant(draft?.pollutant ?? 'pm2_5');
    setFrequency(draft?.frequency ?? 'daily');
    const range =
      draft?.startDate && draft?.endDate
        ? { startDate: draft.startDate, endDate: draft.endDate }
        : deriveRangeFromDays(7);
    setStartDate(range.startDate);
    setEndDate(range.endDate);
    setColor(draft?.color ?? null);
    setShowLegend(draft?.showLegend ?? true);
    setShowGrid(draft?.showGrid ?? true);
    setShowTooltip(draft?.showTooltip ?? true);
    setSelectedSiteIds(draft?.siteIds ?? []);
  }, [isOpen, draft]);

  const canSave = useMemo(
    () => title.trim().length > 0 && selectedSiteIds.length > 0,
    [title, selectedSiteIds]
  );

  // Stable reference so the DatePicker only reacts when the dates actually
  // change — a fresh object per render re-triggers its value-sync effect.
  const datePickerValue = useMemo(
    () => ({ from: new Date(startDate), to: new Date(endDate) }),
    [startDate, endDate]
  );

  const handleDateRangeChange = (
    value:
      | string
      | Date
      | DateRange
      | { from: string; to: string }
      | undefined
  ) => {
    if (!value) return;
    if (typeof value === 'object' && 'from' in value && 'to' in value) {
      const { from, to } = value;
      if (typeof from === 'string' && typeof to === 'string') {
        setStartDate(from);
        setEndDate(to);
      }
    }
  };

  const handleSave = () => {
    if (!canSave || isSaving) return;
    onSave({
      id: draft?.id ?? '',
      title: title.trim(),
      subtitle: subtitle.trim(),
      chartType,
      pollutant,
      frequency,
      startDate,
      endDate,
      siteIds: selectedSiteIds,
      deviceIds: draft?.deviceIds ?? [],
      color,
      showLegend,
      showGrid,
      showTooltip,
      referenceLines: draft?.referenceLines ?? [],
    });
  };

  return (
    <ReusableDialog
      isOpen={isOpen}
      onClose={onClose}
      title={draft ? 'Edit chart configuration' : 'Add chart'}
      subtitle={
        draft
          ? 'Update this chart — changes are saved to the group chart configuration.'
          : 'Configure a new chart — it will be added to this group’s saved chart configurations.'
      }
      icon={AqPresentationChart02}
      size="2xl"
      maxHeight="max-h-[70vh]"
      primaryAction={{
        label: isSaving ? 'Saving...' : draft ? 'Save changes' : 'Add chart',
        onClick: handleSave,
        loading: isSaving,
        disabled: !canSave || isSaving,
      }}
      secondaryAction={{ label: 'Cancel', onClick: onClose }}
    >
      <div className="space-y-5">
        {saveError && (
          <div
            role="alert"
            className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          >
            {saveError}
          </div>
        )}

        {/* Title & subtitle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Chart title *"
            value={title}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setTitle(event.target.value)
            }
            placeholder="e.g. PM2.5 levels across Kampala"
            maxLength={80}
          />
          <Input
            label="Subtitle"
            value={subtitle}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              setSubtitle(event.target.value)
            }
            placeholder="e.g. Hourly PM2.5 for selected sites"
            maxLength={120}
          />
        </div>

        {/* Data shape */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SelectField
            label="Pollutant"
            value={pollutant}
            onChange={(event: { target: { value: unknown } }) =>
              setPollutant(event.target.value as PollutantType)
            }
          >
            {POLLUTANT_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Frequency"
            value={frequency}
            onChange={(event: { target: { value: unknown } }) =>
              setFrequency(event.target.value as FrequencyType)
            }
          >
            {FREQUENCY_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>

          <SelectField
            label="Chart type"
            value={chartType}
            onChange={(event: { target: { value: unknown } }) =>
              setChartType(event.target.value as ExplorerChartType)
            }
          >
            {CHART_TYPE_OPTIONS.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>
        </div>

        {/* Date range */}
        <div>
          <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Date range
          </span>
          <DatePicker
            mode="range"
            value={datePickerValue}
            onChange={handleDateRangeChange}
            placeholder="Select date range"
            className="bg-white dark:bg-[#1d1f20] dark:border-gray-700 shadow-sm w-auto"
            showPresets
            returnFormat="backend-datetime"
          />
        </div>

        {/* Styling */}
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Series color
            </span>
            <button
              type="button"
              onClick={() => setColor(null)}
              aria-pressed={color === null}
              className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              title="Use the chart component's default palette"
            >
              {color === null && (
                <span className="h-2 w-2 rounded-full bg-primary" />
              )}
              Default
            </button>
            {COLOR_PRESETS.map(preset => (
              <button
                key={preset}
                type="button"
                onClick={() => setColor(preset)}
                aria-label={`Use color ${preset}`}
                aria-pressed={color === preset}
                className="h-6 w-6 rounded-full border-2 transition-transform hover:scale-110"
                style={{
                  backgroundColor: preset,
                  borderColor:
                    color === preset ? '#0f172a' : 'transparent',
                }}
              />
            ))}
            <label className="relative ml-1 flex h-6 w-6 cursor-pointer items-center justify-center overflow-hidden rounded-full border border-border">
              <span
                className="h-4 w-4 rounded-full"
                style={{
                  background:
                    'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)',
                }}
              />
              <input
                type="color"
                value={color ?? '#145DFF'}
                onChange={event => setColor(event.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
                aria-label="Custom series color"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-4">
            <Checkbox
              checked={showLegend}
              onCheckedChange={setShowLegend}
              label="Show legend"
            />
            <Checkbox
              checked={showGrid}
              onCheckedChange={setShowGrid}
              label="Show grid"
            />
            <Checkbox
              checked={showTooltip}
              onCheckedChange={setShowTooltip}
              label="Show tooltips"
            />
          </div>
        </div>

        {/* Locations */}
        <div>
          <p className="mb-2 text-sm font-medium text-foreground">
            Locations for this chart *
          </p>
          <LocationPickerSection
            groupId={groupId}
            selectedSiteIds={selectedSiteIds}
            onSelectionChange={(siteIds, names) => {
              setSelectedSiteIds(siteIds);
              onSelectionNamesChange?.(names);
            }}
            maxSelection={50}
          />
        </div>
      </div>
    </ReusableDialog>
  );
};

export default ChartConfigDialog;
