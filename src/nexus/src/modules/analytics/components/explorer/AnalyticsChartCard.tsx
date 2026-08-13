'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { usePostHog } from 'posthog-js/react';
import { useQueries } from '@tanstack/react-query';
import { HiChevronDown } from 'react-icons/hi';
import {
  AqDotsVertical,
  AqEdit02,
  AqCopy01,
  AqTrash01,
  AqRefreshCcw01,
  AqDownload01,
  AqInfoCircle,
  AqCheck,
  AqXClose,
} from '@airqo/icons-react';
import { DynamicChart } from '@/shared/components/charts';
import { useChartExport } from '@/shared/components/charts';
import { getPrimaryColor } from '@/shared/components/charts/constants';
import { FREQUENCY_LABELS } from '@/shared/components/charts/constants';
import {
  getPollutantLabel,
  getPollutantUnits,
} from '@/shared/components/charts/utils';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/shared/components/ui/dropdown-menu';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { LoadingSpinner } from '@/shared/components/ui/loading-spinner';
import { Card, CardContent } from '@/shared/components/ui/card';
import { toast } from '@/shared/components/ui/toast';
import { Tooltip } from 'flowbite-react';
import { useAqiConfig } from '@/shared/providers/aqi-config-provider';
import { deviceService } from '@/shared/services/deviceService';
import { useAnalyticsChartData } from '../../hooks';
import {
  formatChartRangeLabel,
  readChartSidecar,
  writeChartSidecar,
  type ExplorerChartDraft,
} from '../../utils/chartConfig';
import { REFERENCE_LINES } from '@/shared/utils/airQuality';
import { resolveParsedNumber } from '@/shared/types/api';
import {
  buildDataKeyBySiteId,
  buildSiteLabels,
  buildSeriesLabels,
} from '../../utils/chartLabels';
import type { NormalizedChartData } from '@/shared/components/charts/types';
import type { StandardsType } from '@/shared/components/charts/types';

interface AnalyticsChartCardProps {
  draft: ExplorerChartDraft;
  groupId: string;
  /** Display names for sites (forecast series labels, location colors) */
  siteNames: Map<string, string>;
  /** Device names for device-resolved sites (siteId → device name) */
  deviceNames?: Map<string, string>;
  forecastEnabled: boolean;
  onForecastToggle: () => void;
  onEdit: (draft: ExplorerChartDraft) => void;
  /** Arms the inline delete confirmation on the card */
  onRequestDelete: (draft: ExplorerChartDraft) => void;
  /** Executes the delete after the user confirms on the card */
  onConfirmDelete: (draft: ExplorerChartDraft) => void;
  onCancelDelete: () => void;
  onEditTitle: (
    draftId: string,
    title: string,
    subtitle?: string
  ) => Promise<void>;
  onDuplicate: (draft: ExplorerChartDraft) => Promise<void>;
  deleteConfirming?: boolean;
  className?: string;
}

/** Forecast series prefix — each site's projection gets its own dashed line */
const FORECAST_SERIES_PREFIX = 'Forecast · ';

const STANDARDS_OPTIONS: { value: StandardsType; label: string }[] = [
  { value: 'WHO', label: 'WHO 2021' },
  { value: 'NEMA_UGANDA', label: 'NEMA (Uganda)' },
  { value: 'NEMA_KENYA', label: 'NEMA (Kenya)' },
];

const STANDARDS_TITLES: Record<StandardsType, string> = {
  WHO: 'WHO (World Health Organization) 2021 air quality guidelines',
  NEMA_UGANDA: 'National Environment Management Authority (Uganda) limits',
  NEMA_KENYA: 'NEMA Kenya — Legal Notice 180 of 2024',
};

const PERIOD_KEYS: Record<
  string,
  { '24hr': string | undefined; annual: string | undefined }
> = {
  pm2_5: { '24hr': 'PM25_24HR', annual: 'PM25_ANNUAL' },
  pm10: { '24hr': 'PM10_24HR', annual: 'PM10_ANNUAL' },
};

interface ForecastSeries {
  siteId: string;
  siteIndex: number;
  key: string;
  points: NormalizedChartData[];
}

/**
 * The active chart workspace: a large, structured chart card that is the
 * primary focus of the analytics page. Contains the header (title, metadata,
 * Edit + menu), the chart controls (reference standard, forecast, export),
 * the chart itself (with guideline + per-site forecast overlay, colored per
 * location via locationColors), and the Manage locations action. Deleting a
 * chart arms the inline confirmation bar.
 */
export const AnalyticsChartCard: React.FC<AnalyticsChartCardProps> = ({
  draft,
  groupId,
  siteNames,
  deviceNames,
  forecastEnabled,
  onForecastToggle,
  onEdit,
  onRequestDelete,
  onConfirmDelete,
  onCancelDelete,
  onEditTitle,
  onDuplicate,
  deleteConfirming = false,
  className,
}) => {
  const posthog = usePostHog();
  const { config: aqiConfig } = useAqiConfig(draft.pollutant);
  const { exportRef, exportChart } = useChartExport();

  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(draft.title);
  const [draftSubtitle, setDraftSubtitle] = useState(draft.subtitle);
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [referenceStandard, setReferenceStandard] = useState<StandardsType>(
    () => readChartSidecar(groupId, draft.id).referenceStandard ?? 'WHO'
  );

  const filters = useMemo(
    () => ({
      frequency: draft.frequency,
      pollutant: draft.pollutant,
      startDate: draft.startDate,
      endDate: draft.endDate,
    }),
    [draft]
  );

  const {
    chartData,
    isLoading,
    isRefreshing: isDataRefreshing,
    error,
    refresh,
  } = useAnalyticsChartData(
    filters,
    draft.chartType === 'Bar' ? 'bar' : 'line',
    draft.siteIds,
    draft.siteIds.length > 0
  );

  const forecastUsable =
    draft.pollutant === 'pm2_5' && draft.siteIds.length > 0;

  // ── Reference guideline ────────────────────────────────────────────────────
  const guidelinePeriod = draft.frequency === 'monthly' ? 'annual' : '24hr';
  const guidelineValue = useMemo(() => {
    const keys = PERIOD_KEYS[draft.pollutant];
    const table = REFERENCE_LINES[referenceStandard];
    if (!keys || !table) return null;
    const value = table[keys[guidelinePeriod] as keyof typeof table];
    return typeof value === 'number' ? value : null;
  }, [draft.pollutant, guidelinePeriod, referenceStandard]);

  const handleStandardChange = useCallback(
    (next: StandardsType) => {
      setReferenceStandard(next);
      writeChartSidecar(groupId, draft.id, { referenceStandard: next });
    },
    [groupId, draft.id]
  );

  // ── Forecast overlay ────────────────────────────────────────────────────────
  // The forecast API accepts ONE site per request, so a chart spanning N
  // locations fires N parallel queries (deduped against the summary card and
  // the airqo-map forecast UI via the shared query key).
  const forecastQueries = useQueries({
    queries: draft.siteIds.map(siteId => ({
      queryKey: ['map', 'forecast', 'daily', siteId],
      queryFn: async ({ signal }) =>
        deviceService.getDailyForecast(siteId, signal),
      enabled: forecastEnabled && forecastUsable,
      networkMode: 'online',
      retry: false,
      staleTime: 1000 * 60 * 30,
      gcTime: 1000 * 60 * 60 * 12,
    })),
  });

  const forecastItemsBySite = useMemo(
    () =>
      draft.siteIds.map((siteId, index) => ({
        siteId,
        items:
          forecastQueries[index]?.data?.data?.forecasts?.[0]?.forecasts ?? [],
      })),
    [draft.siteIds, forecastQueries]
  );

  // Per-location series color: explicit locationColors entry wins, then the
  // chart color, then the shared palette (matches DynamicChart's resolution).
  const siteColorFor = useCallback(
    (siteId: string, index: number): string =>
      draft.locationColors.find(location => location.id === siteId)?.color ??
      draft.color ??
      getPrimaryColor(index),
    [draft.color, draft.locationColors]
  );

  // Device-selected charts label their series with the DEVICE name (the
  // underlying series is still keyed by site, which the data API returns).
  // Falls back to the forecast API's own site name so raw ids never leak
  // into forecast series labels.
  const forecastSiteNames = useMemo(() => {
    const names = new Map<string, string>();
    draft.siteIds.forEach((siteId, index) => {
      const siteName =
        forecastQueries[index]?.data?.data?.forecasts?.[0]?.site_details
          ?.site_name;
      if (siteName) names.set(siteId, siteName);
    });
    return names;
  }, [draft.siteIds, forecastQueries]);

  const seriesDisplayName = useCallback(
    (siteId: string) =>
      deviceNames?.get(siteId) ??
      siteNames.get(siteId) ??
      forecastSiteNames.get(siteId) ??
      siteId,
    [deviceNames, siteNames, forecastSiteNames]
  );

  const forecastSeries = useMemo<ForecastSeries[]>(() => {
    if (!forecastEnabled || !forecastUsable || chartData.length === 0) {
      return [];
    }
    const observedTimes = chartData
      .map(point => String(point.time ?? ''))
      .filter(Boolean)
      .sort();
    const lastObservedTime = observedTimes[observedTimes.length - 1];
    if (!lastObservedTime) return [];

    const lastObservedDay = lastObservedTime.slice(0, 10);
    const dayToObservedTime = new Map<string, string>();
    observedTimes.forEach(time => {
      const day = time.slice(0, 10);
      if (!dayToObservedTime.has(day)) dayToObservedTime.set(day, time);
    });

    const series: ForecastSeries[] = [];
    forecastItemsBySite.forEach(({ siteId, items }, siteIndex) => {
      if (items.length === 0) return;
      const seriesName = seriesDisplayName(siteId);
      const points: NormalizedChartData[] = [];
      items.forEach(item => {
        const day = String(item.date ?? '').slice(0, 10);
        // Skip the current (observed) day — the projection starts after NOW.
        if (!day || day <= lastObservedDay) return;
        const pm25 = resolveParsedNumber(item.forecast?.pm2_5_mean);
        if (pm25 === undefined || !Number.isFinite(pm25)) return;
        points.push({
          time: dayToObservedTime.get(day) ?? `${day}T00:00:00.000Z`,
          value: Math.round(pm25 * 100) / 100,
          site: `${FORECAST_SERIES_PREFIX}${seriesName}`,
          device_id: '',
        });
      });
      if (points.length > 0) {
        series.push({
          siteId,
          siteIndex,
          key: `${FORECAST_SERIES_PREFIX}${seriesName}`,
          points,
        });
      }
    });
    return series;
  }, [
    chartData,
    forecastEnabled,
    forecastItemsBySite,
    forecastUsable,
    seriesDisplayName,
  ]);

  const nowLine = useMemo(() => {
    if (!forecastEnabled || !forecastUsable || chartData.length === 0) {
      return undefined;
    }
    const times = chartData
      .map(point => String(point.time ?? ''))
      .filter(Boolean)
      .sort();
    const lastObservedTime = times[times.length - 1];
    return lastObservedTime
      ? [
          {
            x: lastObservedTime,
            label: 'Now',
            stroke: 'rgb(100, 116, 139)',
            strokeDasharray: '4 4',
          },
        ]
      : undefined;
  }, [chartData, forecastEnabled, forecastUsable]);

  const mergedData = useMemo(
    () =>
      forecastSeries.length > 0
        ? [...chartData, ...forecastSeries.flatMap(series => series.points)]
        : chartData,
    [chartData, forecastSeries]
  );

  // Series colors: observed sites from locationColors/draft color, forecast
  // projections inherit their site's color (rendered dashed). Keyed by the
  // rendered series key (the chart-data name) so explicit picks apply even
  // without the sidecar.
  const dataKeyBySiteId = useMemo(
    () => buildDataKeyBySiteId(chartData),
    [chartData]
  );

  const seriesColors = useMemo(() => {
    const colors: Record<string, string> = {};
    draft.siteIds.forEach((siteId, index) => {
      const seriesKey = dataKeyBySiteId.get(siteId) ?? siteNames.get(siteId);
      if (seriesKey) colors[seriesKey] = siteColorFor(siteId, index);
    });
    forecastSeries.forEach(series => {
      colors[series.key] = siteColorFor(series.siteId, series.siteIndex);
    });
    return Object.keys(colors).length > 0 ? colors : undefined;
  }, [draft.siteIds, forecastSeries, siteColorFor, siteNames, dataKeyBySiteId]);

  const dashedSeries = useMemo(
    () => forecastSeries.map(series => series.key),
    [forecastSeries]
  );

  // siteId → display name as the USER selected it: the device name when the
  // site was picked via the Devices tab, otherwise the picker's site name
  // (search_name || location_name || name || formatted_name), falling back
  // to the chart-data name so raw ids never leak.
  const siteLabels = useMemo(
    () => buildSiteLabels(chartData, siteNames, deviceNames),
    [chartData, deviceNames, siteNames]
  );

  // Legend/tooltip label overrides keyed by series key (single-series charts
  // render under recharts' generic 'value' key, which gets the name too).
  const seriesLabels = useMemo(
    () => buildSeriesLabels(chartData, siteLabels),
    [chartData, siteLabels]
  );

  // ── Export / refresh ────────────────────────────────────────────────────────
  const exportFilename = useMemo(
    () =>
      `air-quality-${
        draft.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '') || 'chart'
      }`,
    [draft.title]
  );

  const handleExport = useCallback(
    async (format: 'pdf' | 'png') => {
      posthog?.capture('chart_export_clicked', {
        format,
        chart_title: draft.title,
      });
      setIsExporting(true);
      try {
        // Measure the live export region so the cloned capture renders at
        // full size (the export root is pinned to these pixels on clone).
        const exportWidth = exportRef.current?.offsetWidth;
        const exportHeight = exportRef.current?.offsetHeight;
        await exportChart({
          format,
          filename: `${exportFilename}-${Date.now()}`,
          quality: 0.9,
          ...(exportWidth ? { width: exportWidth } : {}),
          ...(exportHeight ? { height: exportHeight } : {}),
        });
        toast.success(`Chart exported as ${format.toUpperCase()} successfully`);
      } catch (exportError) {
        console.error(
          'Export failed:',
          exportError instanceof Error ? exportError.message : exportError
        );
        toast.error(`Failed to export chart as ${format.toUpperCase()}`);
      } finally {
        setIsExporting(false);
      }
    },
    [draft.title, exportChart, exportFilename, exportRef, posthog]
  );

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refresh?.();
      toast.success('Data refreshed');
    } catch (refreshError) {
      toast.error('Failed to refresh data');
      console.error(
        'Refresh error:',
        refreshError instanceof Error ? refreshError.message : refreshError
      );
    } finally {
      setIsRefreshing(false);
    }
  }, [refresh]);

  const handleStartEditTitle = useCallback(() => {
    setDraftTitle(draft.title);
    setDraftSubtitle(draft.subtitle);
    setEditingTitle(true);
  }, [draft.title, draft.subtitle]);

  const handleSaveTitle = useCallback(async () => {
    const nextTitle = draftTitle.trim();
    if (!nextTitle) {
      toast.error('Chart title cannot be empty');
      return;
    }
    setIsSavingTitle(true);
    try {
      await onEditTitle(draft.id, nextTitle, draftSubtitle.trim());
      setEditingTitle(false);
      toast.success('Chart title updated');
    } catch (titleError) {
      console.error(
        'Failed to update chart title:',
        titleError instanceof Error ? titleError.message : titleError
      );
      toast.error('Failed to update chart title');
    } finally {
      setIsSavingTitle(false);
    }
  }, [draft.id, draftSubtitle, draftTitle, onEditTitle]);

  const handleDuplicate = useCallback(() => {
    void onDuplicate(draft);
  }, [draft, onDuplicate]);

  const metadataParts = [
    getPollutantLabel(draft.pollutant),
    `${FREQUENCY_LABELS[draft.frequency] ?? draft.frequency} average`,
    formatChartRangeLabel(draft.startDate, draft.endDate),
    `${draft.siteIds.length} location${draft.siteIds.length === 1 ? '' : 's'}`,
  ].filter(Boolean);

  return (
    <Card className={cn('w-full min-w-0', className)}>
      {/* flex-col-reverse keeps the chart controls visually ABOVE the chart
          while the export region (header + chart) stays contiguous in the
          DOM — exports capture the title/subtitle/chart/legend only. */}
      <div className="flex flex-col-reverse">
        {/* Export region: header + chart */}
        <div ref={exportRef} data-export-root className="min-w-0">
          {/* Header */}
          <CardContent className="px-4 pb-0 pt-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                {editingTitle ? (
                  <div className="max-w-md space-y-2" data-export-ignore>
                    <Input
                      label="Title"
                      aria-label="Chart title"
                      value={draftTitle}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        setDraftTitle(event.target.value)
                      }
                      maxLength={80}
                    />
                    <Input
                      label="Subtitle"
                      aria-label="Chart subtitle"
                      value={draftSubtitle}
                      onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                        setDraftSubtitle(event.target.value)
                      }
                      maxLength={120}
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        variant="filled"
                        size="sm"
                        Icon={AqCheck}
                        onClick={() => void handleSaveTitle()}
                        loading={isSavingTitle}
                        disabled={isSavingTitle}
                      >
                        Save
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        Icon={AqXClose}
                        onClick={() => setEditingTitle(false)}
                        disabled={isSavingTitle}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3 className="truncate text-lg font-semibold text-foreground">
                      {draft.title}
                    </h3>
                    {draft.subtitle ? (
                      <p className="mt-0.5 truncate text-sm text-muted-foreground">
                        {draft.subtitle}
                      </p>
                    ) : (
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {metadataParts.join(' • ')}
                      </p>
                    )}
                  </>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-2" data-export-ignore>
                <Button
                  variant="outlined"
                  size="sm"
                  Icon={AqEdit02}
                  onClick={() => onEdit(draft)}
                  aria-label="Edit chart configuration"
                >
                  Edit
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label="Chart actions"
                      className="rounded-md border border-border p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
                    >
                      <AqDotsVertical className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <DropdownMenuItem onClick={handleStartEditTitle}>
                      <AqEdit02 className="mr-2 h-4 w-4" />
                      Rename
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleDuplicate}>
                      <AqCopy01 className="mr-2 h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => void handleRefresh()}>
                      <AqRefreshCcw01 className="mr-2 h-4 w-4" />
                      Refresh data
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => onRequestDelete(draft)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <AqTrash01 className="mr-2 h-4 w-4" />
                      Delete chart
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>

          {/* Chart */}
          <CardContent className="relative px-2 pb-1.5">
            <div className="relative min-h-[380px] min-w-0">
              {error ? (
                <div className="flex h-[380px] flex-col items-center justify-center text-destructive">
                  <p className="text-lg font-medium">Error loading chart</p>
                  <p className="mt-1 text-sm text-muted-foreground">{error}</p>
                  <Button
                    variant="filled"
                    size="sm"
                    className="mt-4"
                    onClick={() => void handleRefresh()}
                  >
                    Try Again
                  </Button>
                </div>
              ) : (
                <DynamicChart
                  data={mergedData}
                  config={{
                    type: draft.chartType.toLowerCase() as 'line' | 'area' | 'bar',
                    showGrid: draft.showGrid,
                    showTooltip: draft.showTooltip,
                    showLegend: draft.showLegend,
                    height: 380,
                    ...(draft.color ? { color: draft.color } : {}),
                    seriesColors,
                  }}
                  pollutant={draft.pollutant}
                  aqiConfig={aqiConfig}
                  frequency={draft.frequency}
                  autoSelectType={false}
                  showReferenceLines
                  standards={referenceStandard}
                  referenceLinePeriod={guidelinePeriod}
                  dashedSeries={dashedSeries.length > 0 ? dashedSeries : undefined}
                  additionalReferenceLines={nowLine}
                  seriesLabels={seriesLabels}
                  locationLabels={
                    Object.keys(siteLabels).length > 0 ? siteLabels : undefined
                  }
                  deviceNames={
                    deviceNames && deviceNames.size > 0
                      ? Object.fromEntries(deviceNames)
                      : undefined
                  }
                />
              )}

              {(isLoading || isDataRefreshing || isRefreshing || isExporting) &&
                !error && (
                  <div
                    className="absolute inset-0 z-40 flex items-center justify-center bg-background/60 backdrop-blur-[2px]"
                    role="status"
                    aria-live="polite"
                    data-export-ignore
                  >
                    <div className="flex flex-col items-center space-y-2">
                      <LoadingSpinner />
                      <p className="text-xs text-muted-foreground">
                        {isExporting
                          ? 'Exporting chart...'
                          : 'Loading chart data...'}
                      </p>
                    </div>
                  </div>
                )}
            </div>
          </CardContent>
        </div>

        {/* Chart controls — visually above the chart (flex-col-reverse) */}
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2.5 border-b border-border px-4 py-2.5">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <div>
            <label
              htmlFor="reference-standard"
              className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
            >
              Reference standard
            </label>
            <select
              id="reference-standard"
              value={referenceStandard}
              onChange={event =>
                handleStandardChange(event.target.value as StandardsType)
              }
              className="rounded-md border border-border bg-card px-3 py-1.5 text-sm text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20"
            >
              {STANDARDS_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
              {guidelinePeriod === '24hr'
                ? '24-hour guideline'
                : 'Annual guideline'}
            </span>
            <span className="flex items-center gap-1 text-sm font-semibold text-foreground">
              {guidelineValue !== null
                ? `${guidelineValue} ${getPollutantUnits(draft.pollutant)}`
                : '—'}
              <Tooltip
                content={
                  <div className="max-w-[240px] space-y-0.5 text-left">
                    <p className="text-xs font-semibold text-white">
                      {STANDARDS_TITLES[referenceStandard]}
                    </p>
                    <p className="text-xs text-gray-200">
                      {guidelinePeriod === '24hr' ? '24-hour' : 'Annual'}{' '}
                      {getPollutantLabel(draft.pollutant)} guideline:{' '}
                      <span className="font-semibold text-white">
                        {guidelineValue !== null
                          ? `${guidelineValue} ${getPollutantUnits(draft.pollutant)}`
                          : 'not available'}
                      </span>
                    </p>
                  </div>
                }
                placement="top"
              >
                <span className="inline-flex cursor-help">
                  <AqInfoCircle className="h-3.5 w-3.5 text-muted-foreground" />
                </span>
              </Tooltip>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {forecastUsable ? (
            <label className="flex cursor-pointer select-none items-center gap-2 text-sm font-medium text-foreground">
              Forecast
              <button
                type="button"
                role="switch"
                aria-checked={forecastEnabled}
                aria-label="Forecast"
                onClick={onForecastToggle}
                className={cn(
                  'relative h-5 w-9 rounded-full transition-colors duration-200 motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                  forecastEnabled ? 'bg-primary' : 'bg-muted'
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 motion-reduce:transition-none',
                    forecastEnabled && 'translate-x-4'
                  )}
                />
              </button>
            </label>
          ) : (
            <span className="text-xs text-muted-foreground">
              Forecast is available for PM₂.₅ charts
            </span>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                disabled={isExporting}
                className="inline-flex items-center gap-1.5 rounded-md border border-primary px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <AqDownload01 className="h-4 w-4" />
                Export
                <HiChevronDown className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onClick={() => void handleExport('pdf')}
                disabled={isExporting}
              >
                <AqDownload01 className="mr-2 h-4 w-4" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => void handleExport('png')}
                disabled={isExporting}
              >
                <AqDownload01 className="mr-2 h-4 w-4" />
                Export as PNG
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      </div>

      {/* Manage locations — the chart's own legend (below the graph) handles
          per-series toggling; this action opens the location picker. */}
      <div className="flex items-center justify-end px-4 pt-1.5 pb-2">
        <button
          type="button"
          onClick={() => onEdit(draft)}
          className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        >
          <AqEdit02 className="h-3.5 w-3.5" />
          Manage locations
        </button>
      </div>
      {/* Inline delete confirmation — visible on the card, not hidden in a menu */}
      {deleteConfirming && (
        <div
          className="flex flex-wrap items-center justify-between gap-2 border-t border-destructive/30 bg-destructive/10 px-4 py-2.5"
          role="alert"
        >
          <span className="text-sm font-medium text-destructive">
            Delete this chart?
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onConfirmDelete(draft)}
              className="rounded-md bg-destructive px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-destructive/90"
            >
              Yes, delete
            </button>
            <button
              type="button"
              onClick={onCancelDelete}
              className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              Keep chart
            </button>
          </div>
        </div>
      )}
    </Card>
  );
};

export default AnalyticsChartCard;
