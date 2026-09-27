'use client';

import * as React from 'react';
import { useMemo, useState } from 'react';
import { differenceInCalendarDays, format } from 'date-fns';
import { AqRefreshCcw01 } from '@airqo/icons-react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { SegmentedTabs } from '@/shared/components/ui/segmented-tabs';
import { DatePicker, type DateRange } from '@/shared/components/calendar';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { ErrorState } from '@/shared/components/ui/error-state';
import { ChartContainer, DynamicChart } from '@/shared/components/charts';
import { AqiLegend } from '@/modules/analytics';
import { getDefaultSiteColor } from '@/modules/analytics/utils/siteColors';
import {
  getAirQualityLevel,
  getAirQualityColor,
} from '@/shared/utils/airQuality';
import { useAqiConfig } from '@/shared/providers/aqi-config-provider';
import { useOrgCohortContextRequired } from '@/shared/providers/org-cohort-provider';
import type {
  NormalizedChartData,
  PollutantType,
} from '@/shared/components/charts/types';
import { useOrganizationReport } from '../hooks/useOrganizationReport';
import { OrgReportBodySkeleton } from './OrgDashboardSkeleton';
import {
  formatReportValue,
  getReportDailySeries,
  getReportDiurnalSeries,
  getReportPollutantLabel,
  getReportRequestRange,
  getReportSiteRows,
  getReportSummary,
  hasReportData,
  REPORT_POLLUTANT_OPTIONS,
  type ReportSiteRow,
} from '../utils/reportUtils';

interface OrganizationReportDashboardProps {
  organizationTitle: string;
  className?: string;
}

interface ReportMetricCardProps {
  label: string;
  value: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

interface ReportChartProps {
  title: string;
  subtitle: string;
  data: NormalizedChartData[];
  pollutant: PollutantType;
  aqiConfig: ReturnType<typeof useAqiConfig>['config'];
  isLoading: boolean;
  onRefresh: () => void;
  type?: 'line' | 'area' | 'bar';
  categorical?: boolean;
  className?: string;
}

// The backend rejects report windows wider than 27 calendar days
// (inclusive), so the default range is exactly that: the last 27 days.
const MAX_REPORT_WINDOW_DAYS = 27;

const getDefaultReportRange = (): DateRange => {
  const to = new Date();
  to.setHours(23, 59, 59, 999);
  const from = new Date(to);
  from.setDate(from.getDate() - (MAX_REPORT_WINDOW_DAYS - 1));
  from.setHours(0, 0, 0, 0);
  return { from, to };
};

const formatReportDate = (value: string): string => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : format(date, 'MMM d, yyyy');
};

const ReportMetricCard: React.FC<ReportMetricCardProps> = ({
  label,
  value,
  description,
  icon: Icon,
  className,
}) => (
  <Card className={cn('min-w-0', className)}>
    <CardContent className="p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        {Icon && <Icon className="h-4 w-4 shrink-0 text-primary" />}
      </div>
      <p className="mt-3 text-2xl font-semibold tabular-nums text-foreground">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const ReportChart: React.FC<ReportChartProps> = ({
  title,
  subtitle,
  data,
  pollutant,
  aqiConfig,
  isLoading,
  onRefresh,
  type = 'line',
  categorical = false,
  className,
}) => (
  <ChartContainer
    title={title}
    subtitle={subtitle}
    loading={isLoading}
    onRefresh={onRefresh}
    exportOptions={{
      enablePDF: true,
      enablePNG: true,
      filename: `organization-report-${pollutant}`,
    }}
    className={className}
    minContentHeight="320px"
  >
    {data.length > 0 ? (
      <DynamicChart
        data={data}
        config={{
          type,
          height: 320,
          color: getDefaultSiteColor(0),
          showGrid: true,
          showLegend: false,
          showTooltip: true,
          ...(categorical
            ? {
                xAxisTickFormatter: value => String(value),
                tooltipDateFormatter: label => String(label),
              }
            : {}),
        }}
        frequency="daily"
        pollutant={pollutant}
        aqiConfig={aqiConfig}
        autoSelectType={false}
        referenceLinePeriod="24hr"
      />
    ) : (
      <div className="flex h-[320px] items-center justify-center px-6 text-center text-sm text-muted-foreground">
        No {getReportPollutantLabel(pollutant)} readings are available for this
        view.
      </div>
    )}
  </ChartContainer>
);

const SiteBreakdown: React.FC<{
  rows: ReportSiteRow[];
  pollutant: PollutantType;
  aqiConfig: ReturnType<typeof useAqiConfig>['config'];
  className?: string;
}> = ({ rows, pollutant, aqiConfig, className }) => (
  <Card className={cn('min-w-0', className)}>
    <CardHeader className="pb-3">
      <CardTitle className="text-lg">Site comparison</CardTitle>
      <CardDescription>
        Mean {getReportPollutantLabel(pollutant)} concentration by site across
        the selected period.
      </CardDescription>
    </CardHeader>
    <CardContent className="p-0">
      {rows.length === 0 ? (
        <p className="px-6 pb-6 text-sm text-muted-foreground">
          No site-level readings are available for this period.
        </p>
      ) : (
        <div className="max-h-[420px] overflow-y-auto overflow-x-auto">
          <table className="w-full text-sm">
            <caption className="sr-only">
              Site comparison for {getReportPollutantLabel(pollutant)}
            </caption>
            <thead className="sticky top-0 z-10 border-y bg-muted text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th scope="col" className="px-6 py-3 font-medium">
                  Site
                </th>
                <th scope="col" className="px-6 py-3 text-right font-medium">
                  {getReportPollutantLabel(pollutant)}{' '}
                  <span className="normal-case">(µg/m³)</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((row, index) => {
                const level = getAirQualityLevel(
                  row.value,
                  pollutant,
                  aqiConfig
                );
                const color = getAirQualityColor(level, aqiConfig);
                return (
                  <tr key={`${row.name}-${index}`}>
                    <th scope="row" className="px-6 py-3 text-left font-normal">
                      <span className="block max-w-[240px] truncate font-medium text-foreground">
                        {row.name}
                      </span>
                      {row.latitude !== null && row.longitude !== null && (
                        <span className="mt-0.5 block text-xs text-muted-foreground">
                          {row.latitude.toFixed(3)}, {row.longitude.toFixed(3)}
                        </span>
                      )}
                    </th>
                    <td className="px-6 py-3 text-right font-semibold tabular-nums text-foreground">
                      {row.value === null ? (
                        <span className="text-muted-foreground">—</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 tabular-nums text-foreground">
                          <span
                            className="inline-block h-1.5 w-6 rounded-full"
                            style={{ backgroundColor: color || '#6B7280' }}
                            aria-hidden="true"
                          />
                          {formatReportValue(row.value)}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </CardContent>
  </Card>
);

export const OrganizationReportDashboard: React.FC<
  OrganizationReportDashboardProps
> = ({ organizationTitle, className }) => {
  const [pollutant, setPollutant] = useState<PollutantType>('pm2_5');
  const [dateRange, setDateRange] = useState<DateRange>(getDefaultReportRange);

  // The cohort selection lives in the org-wide context (set once in the
  // header). The bar surfaces its own error + retry, so this component only
  // consumes the resolved selection. Always rendered within the provider.
  const {
    organizationGroupId,
    cohortIds,
    selectedCohortId,
    selectedCohort,
    isLoading: cohortsLoading,
    error: cohortsError,
  } = useOrgCohortContextRequired();

  const effectiveCohortId = cohortIds.includes(selectedCohortId)
    ? selectedCohortId
    : '';
  const cohortName = effectiveCohortId
    ? selectedCohort?.name ||
      `Cohort ${cohortIds.indexOf(effectiveCohortId) + 1}`
    : 'No cohort selected';

  const backendRange = useMemo(() => {
    if (!dateRange.from || !dateRange.to) return null;
    try {
      return getReportRequestRange(dateRange);
    } catch {
      return null;
    }
  }, [dateRange]);
  const rangeDays =
    dateRange.from && dateRange.to
      ? differenceInCalendarDays(dateRange.to, dateRange.from) + 1
      : 0;
  const rangeError =
    !backendRange || rangeDays <= 0
      ? 'Choose a start and end date for the report.'
      : dateRange.from && dateRange.from.getTime() > Date.now()
        ? 'The report start date cannot be in the future.'
        : rangeDays > MAX_REPORT_WINDOW_DAYS
          ? `Reports can cover up to ${MAX_REPORT_WINDOW_DAYS} days. Choose a shorter range.`
          : null;
  const reportEnabled = !!effectiveCohortId && !rangeError;
  const {
    report,
    isLoading: reportLoading,
    isFetching: reportFetching,
    error: reportError,
    refetch: refetchReport,
  } = useOrganizationReport({
    groupId: organizationGroupId,
    cohortId: effectiveCohortId,
    startTime: backendRange?.startDateTime ?? '',
    endTime: backendRange?.endDateTime ?? '',
    enabled: reportEnabled,
  });
  const { config: aqiConfig } = useAqiConfig(pollutant);

  const summary = useMemo(
    () => (report ? getReportSummary(report) : null),
    [report]
  );
  const dailySeries = useMemo(
    () => (report ? getReportDailySeries(report, pollutant) : []),
    [report, pollutant]
  );
  const diurnalSeries = useMemo(
    () => (report ? getReportDiurnalSeries(report, pollutant) : []),
    [report, pollutant]
  );
  const siteRows = useMemo(
    () => (report ? getReportSiteRows(report, pollutant) : []),
    [report, pollutant]
  );
  const selectedAverage =
    pollutant === 'pm2_5' ? summary?.averagePm25 : summary?.averagePm10;
  const reportHasData = hasReportData(report);
  const periodLabel = report?.period
    ? `${formatReportDate(report.period.startTime)} – ${formatReportDate(
        report.period.endTime
      )}`
    : null;
  // The cohort selection is resolved once ids are known AND a valid cohort is
  // selected (the selector auto-selects the stored/first cohort).
  const selectionPending =
    cohortsLoading || (cohortIds.length > 0 && !effectiveCohortId);

  const handleDateRangeChange = (value: unknown) => {
    if (!value) return;
    if (value instanceof Date) {
      setDateRange({ from: value, to: value });
      return;
    }
    if (typeof value === 'string') {
      const date = new Date(value);
      if (!Number.isNaN(date.getTime())) {
        setDateRange({ from: date, to: date });
      }
      return;
    }
    if (typeof value === 'object' && 'from' in value && 'to' in value) {
      const fromValue = (value as { from: Date | string }).from;
      const toValue = (value as { to: Date | string }).to;
      const from =
        typeof fromValue === 'string' ? new Date(fromValue) : fromValue;
      const to = typeof toValue === 'string' ? new Date(toValue) : toValue;
      if (
        from &&
        to &&
        !Number.isNaN(from.getTime()) &&
        !Number.isNaN(to.getTime())
      ) {
        setDateRange({ from, to });
      }
    }
  };

  const handleRefresh = () => {
    void refetchReport();
  };

  const renderReport = () => {
    if (cohortsError && cohortIds.length === 0) {
      // The selector surfaces the cohort load error with its own retry
      // action; with ids available the report can still render using the
      // positional fallback name, so only bail when there is no id to key on.
      return null;
    }
    if (selectionPending || reportLoading) {
      return <OrgReportBodySkeleton />;
    }
    if (cohortIds.length === 0) {
      return (
        <EmptyState
          title="No cohorts assigned"
          description="Assign devices to a cohort before generating an organization air quality report."
        />
      );
    }
    if (rangeError) {
      return (
        <div
          role="alert"
          className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive"
        >
          {rangeError}
        </div>
      );
    }
    if (reportError) {
      return (
        <ErrorState
          title="Unable to load the report"
          description={reportError}
          retryAction={{ label: 'Retry', onClick: handleRefresh }}
        />
      );
    }
    if (!reportHasData) {
      return (
        <EmptyState
          title="No readings in this period"
          description="Try a different date range or cohort. The report service returns a successful empty result when the selected period has no measurements."
        />
      );
    }

    return (
      <div className="space-y-5">
        {reportFetching && (
          <p
            role="status"
            aria-live="polite"
            className="text-xs text-muted-foreground"
          >
            Updating report...
          </p>
        )}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <ReportMetricCard
            label="Average PM2.5"
            value={`${formatReportValue(summary?.averagePm25)} µg/m³`}
            description={
              summary?.peakPm25 === null || summary?.peakPm25 === undefined
                ? 'No calibrated daily values'
                : `Peak daily mean ${formatReportValue(summary.peakPm25)} µg/m³`
            }
          />
          <ReportMetricCard
            label="Average PM10"
            value={`${formatReportValue(summary?.averagePm10)} µg/m³`}
            description="Mean of daily calibrated values"
          />
          <ReportMetricCard
            label="Active days"
            value={String(summary?.activeDays ?? 0)}
            description="Days with returned measurements"
          />
          <ReportMetricCard
            label="Devices represented"
            value={String(summary?.deviceCount ?? 0)}
            description={`${summary?.siteCount ?? 0} site${
              summary?.siteCount === 1 ? '' : 's'
            } with readings`}
          />
        </div>

        <ReportChart
          title={`${getReportPollutantLabel(pollutant)} daily trend`}
          subtitle={`Mean calibrated concentration across the selected cohort · ${periodLabel ?? ''}`}
          data={dailySeries}
          pollutant={pollutant}
          aqiConfig={aqiConfig}
          isLoading={reportLoading}
          onRefresh={handleRefresh}
          type="area"
        />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <ReportChart
            title="Typical day profile"
            subtitle={`Mean ${getReportPollutantLabel(
              pollutant
            )} by UTC hour across the selected period`}
            data={diurnalSeries}
            pollutant={pollutant}
            aqiConfig={aqiConfig}
            isLoading={reportLoading}
            onRefresh={handleRefresh}
            type="bar"
            categorical
          />
          <SiteBreakdown
            rows={siteRows}
            pollutant={pollutant}
            aqiConfig={aqiConfig}
          />
        </div>

        {aqiConfig && (
          <AqiLegend
            aqiConfig={aqiConfig}
            markerValue={selectedAverage}
            ariaLabel={`${getReportPollutantLabel(pollutant)} concentration scale`}
          />
        )}
      </div>
    );
  };

  return (
    <div className={cn('space-y-5', className)}>
      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid min-w-0 flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <p className="mb-2 text-sm text-foreground">Reporting period</p>
                <DatePicker
                  value={dateRange}
                  onChange={handleDateRangeChange}
                  mode="range"
                  maxDate={new Date()}
                  minDate={
                    new Date(
                      Date.now() - (MAX_REPORT_WINDOW_DAYS - 1) * 86400000
                    )
                  }
                  placeholder="Select date range"
                  className="w-full"
                  contentClassName="z-[10010]"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 lg:pb-0">
              <SegmentedTabs
                ariaLabel="Report pollutant"
                options={REPORT_POLLUTANT_OPTIONS}
                value={pollutant}
                onChange={setPollutant}
              />
              <Button
                variant="outlined"
                size="md"
                Icon={AqRefreshCcw01}
                onClick={handleRefresh}
                disabled={!reportEnabled}
                loading={reportFetching}
                aria-label="Refresh organization report"
              >
                Refresh
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {organizationTitle}
            </span>
            <span aria-hidden="true">·</span>
            <span>{cohortName}</span>
            {periodLabel && (
              <>
                <span aria-hidden="true">·</span>
                <span>{periodLabel}</span>
              </>
            )}
            <span aria-hidden="true">·</span>
            <span>UTC hourly aggregates</span>
          </div>
        </CardContent>
      </Card>
      {renderReport()}
    </div>
  );
};

export default OrganizationReportDashboard;
