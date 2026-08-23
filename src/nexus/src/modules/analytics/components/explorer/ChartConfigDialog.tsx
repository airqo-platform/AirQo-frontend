'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import ReusableDialog from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import SelectField from '@/shared/components/ui/select';
import Checkbox from '@/shared/components/ui/checkbox';
import { DatePicker } from '@/shared/components/calendar';
import type { DateRange } from '@/shared/components/calendar';
import { AqPresentationChart02 } from '@airqo/icons-react';
import { LocationPickerSection } from './LocationPickerSection';
import {
  applySiteColorPick,
  materializeSiteColors,
} from '../../utils/siteColors';
import {
  deriveRangeFromDays,
  type ExplorerChartDraft,
  type ExplorerChartType,
} from '../../utils/chartConfig';
import type {
  PollutantType,
  FrequencyType,
} from '@/shared/components/charts/types';

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

interface ChartConfigDialogProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  /** Draft to edit; a new draft is created when omitted */
  draft?: ExplorerChartDraft | null;
  onSave: (draft: ExplorerChartDraft) => void;
  /** Forwarded from the location picker so the page can label chips/forecast */
  onSelectionNamesChange?: (names: Map<string, string>) => void;
  /** Resolved site names from the page (used for the selected-items strip) */
  siteNames?: Map<string, string>;
  isSaving?: boolean;
  saveError?: string | null;
}

/**
 * Create/edit a chart configuration: display fields (title, subtitle),
 * per-location colors, data shape (pollutant, frequency, chart type, custom
 * date range), legend/grid/tooltip toggles and the locations the chart
 * covers (sites/devices picker).
 */
export const ChartConfigDialog: React.FC<ChartConfigDialogProps> = ({
  isOpen,
  onClose,
  groupId,
  draft = null,
  onSave,
  onSelectionNamesChange,
  siteNames,
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
  const [endDate, setEndDate] = useState(() => deriveRangeFromDays(7).endDate);
  const [locationColors, setLocationColors] = useState<
    { id: string; color: string }[]
  >([]);
  const [showLegend, setShowLegend] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [showTooltip, setShowTooltip] = useState(true);
  const [themeColors, setThemeColors] = useState(false);
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([]);
  const saveErrorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!saveError) return;

    const scrollTimer = window.setTimeout(() => {
      const errorElement = saveErrorRef.current;
      errorElement?.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
      errorElement?.focus({ preventScroll: true });
    }, 0);

    return () => window.clearTimeout(scrollTimer);
  }, [saveError]);

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
    setLocationColors(draft?.locationColors ?? []);
    setShowLegend(draft?.showLegend ?? true);
    setShowGrid(draft?.showGrid ?? true);
    setShowTooltip(draft?.showTooltip ?? true);
    setThemeColors(draft?.themeColors ?? false);
    setSelectedSiteIds(draft?.siteIds ?? []);
  }, [isOpen, draft]);

  // Colors are materialized on save (one entry per selected site, de-duplicated
  // against theme-default shades) — stale entries for deselected sites are
  // pruned here while the form is open so the preview never shows a color for
  // a location that was removed. The previous array reference is kept when
  // nothing changed (no re-render loops).
  useEffect(() => {
    setLocationColors(prev => {
      const filtered = prev.filter(entry => selectedSiteIds.includes(entry.id));
      return filtered.length === prev.length ? prev : filtered;
    });
  }, [selectedSiteIds]);

  // Picking a color another site already uses swaps the two so every site
  // stays visually distinct (never two identical series).
  const setLocationColor = useCallback(
    (siteId: string, nextColor: string | null) => {
      setLocationColors(prev => applySiteColorPick(prev, siteId, nextColor));
    },
    []
  );

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
    value: string | Date | DateRange | { from: string; to: string } | undefined
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
    // Every selected site gets an explicit, distinct color (unset sites take
    // a theme-default shade; manual picks are de-duplicated) so a chart with
    // multiple locations never renders two series in the same color. The
    // locationColors state is already pruned when sites are deselected (see
    // the effect above), so no second filter is needed here.
    onSave({
      id: draft?.id ?? '',
      fieldId: draft?.fieldId ?? 1,
      title: title.trim(),
      subtitle: subtitle.trim(),
      chartType,
      pollutant,
      frequency,
      startDate,
      endDate,
      siteIds: selectedSiteIds,
      siteNames: draft?.siteNames ?? {},
      color: null,
      locationColors: materializeSiteColors(
        selectedSiteIds,
        locationColors,
        themeColors
      ),
      themeColors,
      referenceStandard: draft?.referenceStandard ?? 'WHO',
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
          ? 'Update this chart - changes are saved to its configuration.'
          : 'Configure a new chart - it will be added to your saved charts.'
      }
      icon={AqPresentationChart02}
      size="3xl"
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
            ref={saveErrorRef}
            role="alert"
            aria-live="assertive"
            tabIndex={-1}
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
            useDialog
          />
        </div>

        {/* Chart display toggles */}
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
          <Checkbox
            checked={themeColors}
            onCheckedChange={setThemeColors}
            label="Use theme color shades"
          />
        </div>
        <p className="-mt-3 text-xs text-muted-foreground">
          Theme color shades: series use shades of the active theme color
          instead of the fixed multi-color palette. Off for default palette
          colors.
        </p>

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
            locationColors={locationColors}
            themeColors={themeColors}
            onLocationColorChange={setLocationColor}
            namesBySite={siteNames}
          />
        </div>
      </div>
    </ReusableDialog>
  );
};

export default ChartConfigDialog;
