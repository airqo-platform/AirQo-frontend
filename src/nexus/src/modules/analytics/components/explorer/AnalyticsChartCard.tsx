'use client';

import React, { useCallback, useMemo, useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { useQueries } from '@tanstack/react-query';
import { Tooltip } from 'flowbite-react';
import {
  AqEdit02,
  AqCopy01,
  AqTrash01,
  AqInfoCircle,
} from '@airqo/icons-react';
import { ChartContainer, DynamicChart } from '@/shared/components/charts';
import {
  getPollutantLabel,
  getPollutantUnits,
} from '@/shared/components/charts/utils';
import { REFERENCE_LINES } from '@/shared/utils/airQuality';
import {
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/shared/components/ui/dropdown-menu';
import { useAqiConfig } from '@/shared/providers/aqi-config-provider';
import { deviceService } from '@/shared/services/deviceService';
import { useAnalyticsChartData } from '../../hooks';
import {
  buildChartMetadata,
  getGuidelinePeriod,
  readChartSidecar,
  writeChartSidecar,
  type ExplorerChartDraft,
} from '../../utils/chartConfig';
import { resolveParsedNumber } from '@/shared/types/api';
import { parseISO, format, addDays, addWeeks, addMonths } from 'date-fns';
import {
  buildDataKeyBySiteId,
  buildSiteLabels,
  buildSeriesLabels,
} from '../../utils/chartLabels';
import { getDefaultSiteColor } from '../../utils/siteColors';
import type { NormalizedChartData } from '@/shared/components/charts/types';
import type { StandardsType } from '@/shared/components/charts/types';

interface AnalyticsChartCardProps {
  draft: ExplorerChartDraft;
  groupId: string;
  /** Display names for sites (forecast series labels, location colors) */
  siteNames: Map<string, string>;
  forecastEnabled: boolean;
  onForecastToggle: () => void;
  onEdit: (draft: ExplorerChartDraft) => void;
  /** Opens the delete-confirmation dialog for this chart */
  onRequestDelete: (draft: ExplorerChartDraft) => void;
  onEditTitle: (
    draftId: string,
    title: string,
    subtitle?: string
  ) => Promise<void>;
  onDuplicate: (draft: ExplorerChartDraft) => Promise<void>;
  className?: string;
}

/** Forecast series prefix — each site's projection gets its own dashed line */
const FORECAST_SERIES_PREFIX = 'Forecast · ';

const STANDARDS_OPTIONS: { value: StandardsType; label: string }[] = [
  { value: 'WHO', label: 'WHO 2021' },
  { value: 'NEMA_UGANDA', label: 'NEMA (Uganda)' },
  { value: 'NEMA_KENYA', label: 'NEMA (Kenya)' },
  { value: 'SOUTH_AFRICA', label: 'South Africa (NEM:AQA)' },
  { value: 'NIGERIA', label: 'Nigeria (NESREA)' },
];

const STANDARDS_TITLES: Record<StandardsType, string> = {
  WHO: 'WHO (World Health Organization) 2021 air quality guidelines',
  NEMA_UGANDA: 'National Environment Management Authority (Uganda) limits',
  NEMA_KENYA: 'NEMA Kenya — Legal Notice 180 of 2024',
  SOUTH_AFRICA: 'South Africa National Ambient Air Quality Standards',
  NIGERIA:
    'Nigeria National Environmental (Air Quality Control) Regulations 2021',
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
 * The active chart workspace — the primary focus of the analytics page.
 *
 * Built on the SAME shared ChartContainer used by the favorites dashboard so
 * every chart looks and behaves alike: a header with the title, then a
 * toolbar section above the chart holding the reference standard selector
 * (left) and the forecast toggle + "More" menu (right), with separator
 * lines above and below the chart body. The More menu keeps the chart
 * actions (edit, duplicate, rename, refresh, exports, standards, reference
 * lines). The chart itself carries the per-site forecast overlay (dashed
 * projections + "Now" marker) and per-location colors. Deleting arms the
 * inline confirmation bar.
 */
export const AnalyticsChartCard: React.FC<AnalyticsChartCardProps> = ({
  draft,
  groupId,
  siteNames,
  forecastEnabled,
  onForecastToggle,
  onEdit,
  onRequestDelete,
  onEditTitle,
  onDuplicate,
  className,
}) => {
  const { config: aqiConfig } = useAqiConfig(draft.pollutant);

  const [referenceStandard, setReferenceStandard] = useState<StandardsType>(
    () => readChartSidecar(groupId, draft.id).referenceStandard ?? 'WHO'
  );

  // Theme-shade coloring preference — persisted in the sidecar (the backend
  // whitelist doesn't carry it), same pattern as referenceStandard. The
  // dialog path updates `draft.themeColors`; the More-menu toggle updates
  // local state + sidecar. Both feed the series resolution below.
  const [themeColors, setThemeColors] = useState<boolean>(
    () => readChartSidecar(groupId, draft.id).themeColors ?? false
  );

  React.useEffect(() => {
    setThemeColors(draft.themeColors ?? false);
  }, [draft.themeColors]);

  const filters = useMemo(
    () => ({
      frequency: draft.frequency,
      pollutant: draft.pollutant,
      startDate: draft.startDate,
      endDate: draft.endDate,
    }),
    [draft]
  );

  const { chartData, isLoading, isRefreshing, error, refresh } =
    useAnalyticsChartData(
      filters,
      draft.chartType === 'Bar' ? 'bar' : 'line',
      draft.siteIds,
      draft.siteIds.length > 0
    );

  const forecastUsable =
    draft.pollutant === 'pm2_5' && draft.siteIds.length > 0;

  // The guideline the chart compares against: annual for monthly data,
  // 24-hour for every other frequency (same rule as the overview cards).
  const guidelinePeriod = getGuidelinePeriod(draft.frequency);

  // The reference line value for the selected standard + averaging period,
  // shown in the toolbar next to the standard selector.
  const guidelineValue = useMemo(() => {
    const keys = PERIOD_KEYS[draft.pollutant];
    const table = REFERENCE_LINES[referenceStandard];
    if (!keys || !table) return null;
    const value = table[keys[guidelinePeriod] as keyof typeof table];
    return typeof value === 'number' ? value : null;
  }, [draft.pollutant, guidelinePeriod, referenceStandard]);

  // Persist the standards selection (chosen via the shared standards dialog
  // in the More menu) so it survives reloads.
  const handleStandardsChange = useCallback(
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

  // Per-location series color — shared resolution: explicit locationColors
  // entry wins, then a theme-default shade per position (same as the picker
  // preview, strip and overview cards). The mode comes from the LIVE toggle
  // state (not the memoized draft) so the More-menu toggle repaints the
  // chart instantly.
  const siteColorFor = useCallback(
    (siteId: string, index: number): string =>
      draft.locationColors.find(entry => entry.id === siteId)?.color ??
      getDefaultSiteColor(index, themeColors),
    [draft.locationColors, themeColors]
  );

  // Series display name: the picker's site name, falling back to the
  // forecast API's own site name so raw ids never leak into forecast
  // series labels.
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
      siteNames.get(siteId) ?? forecastSiteNames.get(siteId) ?? siteId,
    [siteNames, forecastSiteNames]
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

    // The projection starts strictly AFTER the last observed bucket. For
    // hourly/raw/daily data the last observed time IS a day; weekly/monthly
    // buckets anchor the bucket START, so the cutoff moves one full bucket
    // ahead — comparing raw day strings against week/month keys would
    // silently skip every forecast day at weekly frequency.
    const lastObservedDate = parseISO(lastObservedTime);
    if (Number.isNaN(lastObservedDate.getTime())) {
      // Unparseable observed time — there's no anchor for the projection.
      return [];
    }
    const forecastCutoff = format(
      draft.frequency === 'weekly'
        ? addWeeks(lastObservedDate, 1)
        : draft.frequency === 'monthly'
          ? addMonths(lastObservedDate, 1)
          : addDays(lastObservedDate, 1),
      'yyyy-MM-dd'
    );
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
        // Skip everything at or before the cutoff — the projection starts
        // after the last observed bucket.
        if (!day || day < forecastCutoff) return;
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
    draft.frequency,
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

  // Series colors: observed sites + forecast projections (dashed, inheriting
  // their site's color). Keyed by the rendered series key (the chart-data
  // name) so explicit picks apply even without the sidecar.
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

  // siteId → display name as the USER selected it: the picker's site name
  // (search_name || location_name || name || formatted_name), falling back
  // to the chart-data name so raw ids never leak.
  const siteLabels = useMemo(
    () => buildSiteLabels(chartData, siteNames),
    [chartData, siteNames]
  );

  // Legend/tooltip label overrides keyed by series key (single-series charts
  // render under recharts' generic 'value' key, which gets the name too).
  const seriesLabels = useMemo(
    () => buildSeriesLabels(chartData, siteLabels),
    [chartData, siteLabels]
  );

  const metadata = buildChartMetadata(draft);

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

  const handleContainerTitleEdit = useCallback(
    (title: string, subtitle?: string) =>
      onEditTitle(draft.id, title, subtitle ?? ''),
    [draft.id, onEditTitle]
  );

  const handleDuplicate = useCallback(() => {
    void onDuplicate(draft);
  }, [draft, onDuplicate]);

  // The toolbar select must not collide across chart cards on the same page.
  const standardSelectId = `reference-standard-${draft.id.replace(
    /[^a-zA-Z0-9_-]/g,
    '-'
  )}`;

  return (
    <div className={cn('w-full min-w-0 space-y-2', className)}>
      <ChartContainer
        title={draft.title}
        // Only the user-set subtitle lives in the header — the auto-generated
        // metadata line renders in the footer instead, so the inline editor
        // can never bake derived text into the saved subtitle.
        subtitle={draft.subtitle}
        loading={isLoading || isRefreshing}
        error={error ?? null}
        onRefresh={refresh}
        exportOptions={{
          enablePDF: true,
          enablePNG: true,
          filename: exportFilename,
        }}
        onEditTitle={handleContainerTitleEdit}
        selectedStandards={referenceStandard}
        onStandardsChange={handleStandardsChange}
        themeColors={themeColors}
        className="w-full"
        footerHint={
          <div className="flex items-center justify-between gap-3">
            <span className="min-w-0 truncate text-xs text-muted-foreground">
              {metadata}
            </span>
            <button
              type="button"
              onClick={() => onEdit(draft)}
              className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              <AqEdit02 className="h-3.5 w-3.5" />
              Manage locations
            </button>
          </div>
        }
        toolbar={
          <>
            {/* Reference standard selector */}
            <div>
              <label
                htmlFor={standardSelectId}
                className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-muted-foreground"
              >
                Reference standard
              </label>
              <select
                id={standardSelectId}
                value={referenceStandard}
                onChange={event =>
                  handleStandardsChange(event.target.value as StandardsType)
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

            {/* Guideline value for the selected standard */}
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
          </>
        }
        toolbarActions={
          forecastUsable ? (
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
                    'absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 motion-reduce:transition-none',
                    forecastEnabled && 'translate-x-4'
                  )}
                />
              </button>
            </label>
          ) : (
            <span className="text-xs text-muted-foreground">
              Forecast is available for PM₂.₅ charts
            </span>
          )
        }
        menuItems={
          <>
            <DropdownMenuItem onClick={() => onEdit(draft)}>
              <AqEdit02 className="mr-2 h-4 w-4" />
              Edit chart
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDuplicate}>
              <AqCopy01 className="mr-2 h-4 w-4" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onRequestDelete(draft)}
              className="text-destructive hover:bg-destructive/10"
            >
              <AqTrash01 className="mr-2 h-4 w-4" />
              Delete chart
            </DropdownMenuItem>
          </>
        }
      >
        <DynamicChart
          data={mergedData}
          config={{
            type: draft.chartType.toLowerCase() as 'line' | 'area' | 'bar',
            showGrid: draft.showGrid,
            showTooltip: draft.showTooltip,
            showLegend: draft.showLegend,
            height: 380,
            // Unset series render in theme-primary shades when the user
            // toggles "Theme colors" on (explicit picks still win).
            themeColors,
            // Single-series charts render under recharts' generic 'value' key,
            // which the site-keyed seriesColors map can't cover — pin the
            // resolved site color so a picked color actually renders.
            ...(draft.siteIds.length === 1
              ? { color: siteColorFor(draft.siteIds[0], 0) }
              : {}),
            seriesColors,
          }}
          pollutant={draft.pollutant}
          aqiConfig={aqiConfig}
          frequency={draft.frequency}
          autoSelectType={false}
          referenceLinePeriod={guidelinePeriod}
          dashedSeries={dashedSeries.length > 0 ? dashedSeries : undefined}
          additionalReferenceLines={nowLine}
          seriesLabels={seriesLabels}
          locationLabels={
            Object.keys(siteLabels).length > 0 ? siteLabels : undefined
          }
        />
      </ChartContainer>
    </div>
  );
};

export default AnalyticsChartCard;
