'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useQueries } from '@tanstack/react-query';
import { usePostHog } from 'posthog-js/react';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { EmptyState } from '@/shared/components/ui/empty-state';
import { ErrorState } from '@/shared/components/ui/error-state';
import { LoadingState } from '@/shared/components/ui/loading-state';
import { Banner } from '@/shared/components/ui/banner';
import ReusableDialog from '@/shared/components/ui/dialog';
import { SegmentedTabs } from '@/shared/components/ui/segmented-tabs';
import { AqTrash01 } from '@airqo/icons-react';
import { AqPlus, AqLayoutGrid01, AqList } from '@airqo/icons-react';
import { useUser } from '@/shared/hooks/useUser';
import { useOrgGroup } from '@/shared/hooks/useOrgGroup';
import { analyticsService } from '@/shared/services/analyticsService';
import {
  buildChartDataQueryKey,
  transformChartData,
  type ChartDataFilters,
} from '../hooks';
import { useChartManagement } from '../hooks/useChartManagement';
import { AnalyticsChartCard } from './explorer/AnalyticsChartCard';
import { ChartsOverviewView } from './explorer/ChartsOverviewView';
import { ChartConfigDialog } from './explorer/ChartConfigDialog';
import { AiDrawerTrigger } from '@/modules/ai/components/AiDrawerTrigger';
import { AiPageContextProvider } from '@/modules/ai/context/ai-page-context';
import { enrichChartDataSiteIds } from '../utils/chartLabels';
import { toBackendChartType, normalizePollutant } from '../utils/chartConfig';

interface AnalyticsExplorerPageProps {
  className?: string;
  isOrganizationFlow?: boolean;
  organizationSlug?: string;
}

type TrendsLayout = 'list' | 'grid';

const TRENDS_LAYOUT_STORAGE_KEY = 'nexus:analytics:overview-layout';

const TRENDS_LAYOUT_OPTIONS: {
  value: TrendsLayout;
  label: string;
  icon: React.ReactNode;
}[] = [
  {
    value: 'list',
    label: 'List',
    icon: <AqList className="h-3.5 w-3.5" />,
  },
  {
    value: 'grid',
    label: 'Grid',
    icon: <AqLayoutGrid01 className="h-3.5 w-3.5" />,
  },
];

// The Trends layout (list vs grid) survives reloads too.
const readStoredTrendsLayout = (): TrendsLayout => {
  if (typeof window === 'undefined') return 'list';
  try {
    const stored = window.localStorage.getItem(TRENDS_LAYOUT_STORAGE_KEY);
    return stored === 'list' || stored === 'grid' ? stored : 'list';
  } catch {
    return 'list';
  }
};

/**
 * Air Quality Analytics — the chart workspace. Every configured chart is
 * rendered in a list (each as the full focused workspace) or a grid, plus
 * the page-level AQI legend. Location details are opened from the data
 * export tables so there is one location-discovery experience.
 */
export const AnalyticsExplorerPage: React.FC<AnalyticsExplorerPageProps> = ({
  className,
  isOrganizationFlow = false,
  organizationSlug,
}) => {
  const posthog = usePostHog();
  const { user, activeGroup } = useUser();

  const { groupId, isInitialLoading } = useOrgGroup({
    organizationSlug,
    isOrganizationFlow,
  });

  const [trendsLayout, setTrendsLayout] = useState<TrendsLayout>(
    readStoredTrendsLayout
  );

  const {
    charts,
    chartsLoading,
    chartsError,
    refetchCharts,
    siteNames,
    forecastChartIds,
    dialogOpen,
    editingDraft,
    deleteDraft,
    saveError,
    isSaving,
    openCreate,
    openEdit,
    closeDialog,
    handleSaveDraft,
    handleRequestDelete,
    cancelDelete,
    confirmDelete,
    handleDuplicate,
    handleForecastToggle,
    handleEditTitle,
    handleNamesResolved,
  } = useChartManagement(groupId, !isInitialLoading);

  // Persist the Trends layout so a refresh returns to the same view.
  useEffect(() => {
    try {
      window.localStorage.setItem(TRENDS_LAYOUT_STORAGE_KEY, trendsLayout);
    } catch {
      // Storage unavailable — layout memory is best-effort.
    }
  }, [trendsLayout]);

  // Data-coverage warning: users can select many locations, but the chart
  // API only returns series for locations that actually have data. These
  // queries share the exact query keys the chart cards use, so no extra
  // requests fire — the coverage reads the same cached chart data. Gated to
  // the Trends view (where charts render).
  const coverageQueries = useQueries({
    queries: charts.map(draft => {
      const filters: ChartDataFilters = {
        frequency: draft.frequency,
        pollutant: draft.pollutant,
        startDateTime: draft.startDate,
        endDateTime: draft.endDate,
      };
      const chartType = toBackendChartType(draft.chartType);
      return {
        queryKey: buildChartDataQueryKey(
          user?.id,
          activeGroup?.id,
          chartType,
          draft.siteIds,
          filters
        ),
        queryFn: async ({ signal }) => {
          const response = await analyticsService.getChartData(
            {
              sites: draft.siteIds,
              startDateTime: filters.startDateTime,
              endDateTime: filters.endDateTime,
              chartType,
              frequency: filters.frequency,
              pollutant: normalizePollutant(filters.pollutant),
              organisation_name: '',
            },
            signal
          );
          return response?.data && response.data.length > 0
            ? transformChartData(response.data)
            : [];
        },
        enabled:
          !isInitialLoading && charts.length > 0 && draft.siteIds.length > 0,
        networkMode: 'online',
        retry: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 60 * 12,
      };
    }),
  });

  // Distinct locations that actually returned chart data across all charts.
  const coveredSiteIds = useMemo(() => {
    const withData = new Set<string>();
    coverageQueries.forEach(query => {
      const enriched = enrichChartDataSiteIds(query.data ?? [], siteNames);
      enriched.forEach(point => {
        if (point.site_id) withData.add(point.site_id);
      });
    });
    return withData;
  }, [coverageQueries, siteNames]);

  const allSiteIds = useMemo(
    () => Array.from(new Set(charts.flatMap(chart => chart.siteIds))),
    [charts]
  );

  const dataCoverage = useMemo(() => {
    if (allSiteIds.length === 0) return null;
    const withData = allSiteIds.filter(id => coveredSiteIds.has(id)).length;
    if (withData >= allSiteIds.length) return null;
    return { selected: allSiteIds.length, withData };
  }, [allSiteIds, coveredSiteIds]);

  useEffect(() => {
    posthog?.capture('analytics_trends_viewed', {
      layout: trendsLayout,
      chart_count: charts.length,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trendsLayout]);

  const renderTrendsView = () => {
    if (isInitialLoading || (chartsLoading && charts.length === 0)) {
      return (
        <div className="flex items-center justify-center min-h-[300px]">
          <LoadingState text="Loading analytics..." />
        </div>
      );
    }

    if (chartsError && charts.length === 0) {
      return (
        <ErrorState
          title="Unable to load chart configurations"
          description={
            chartsError instanceof Error
              ? chartsError.message
              : 'We could not load your saved charts.'
          }
          retryAction={{ label: 'Retry', onClick: () => void refetchCharts() }}
        />
      );
    }

    return (
      <div className="space-y-4">
        {charts.length === 0 ? (
          <EmptyState
            title="No charts yet"
            description="Create your first chart to explore air quality across locations and time periods."
            action={{ label: 'Create chart', onClick: openCreate }}
          />
        ) : (
          <>
            {/* Data-coverage warning — some selected locations have no
                readings for the current time period / frequency, so charts
                silently omit them. */}
            {dataCoverage && (
              <Banner
                severity="warning"
                dense
                title="Some locations have no data for the selected time period"
                message="A few of your selected locations don't have readings available for the current time period and frequency, so some charts may not show every location. Try adjusting the time period or frequency, or remove locations without data from your charts."
              />
            )}

            {/* Layout switcher and New chart button — right-aligned */}
            <div className="flex items-center justify-end gap-2">
              <Card className="w-fit">
                <CardContent className="p-1">
                  <SegmentedTabs
                    ariaLabel="Charts layout"
                    options={TRENDS_LAYOUT_OPTIONS}
                    value={trendsLayout}
                    onChange={setTrendsLayout}
                  />
                </CardContent>
              </Card>
              <Button
                variant="filled"
                size="md"
                Icon={AqPlus}
                onClick={openCreate}
                disabled={isInitialLoading || !groupId}
                showTextOnMobile
              >
                New chart
              </Button>
            </div>

            {trendsLayout === 'grid' ? (
              <ChartsOverviewView
                charts={charts}
                siteNames={siteNames}
                groupId={groupId}
                onEdit={openEdit}
                onRequestDelete={handleRequestDelete}
              />
            ) : (
              /* List view — chart cards span the full width */
              <div className="space-y-4">
                {charts.map(draft => (
                  <AnalyticsChartCard
                    key={draft.id}
                    draft={draft}
                    groupId={groupId}
                    siteNames={siteNames}
                    forecastEnabled={forecastChartIds.has(draft.id)}
                    onForecastToggle={() => handleForecastToggle(draft.id)}
                    onEdit={openEdit}
                    onRequestDelete={handleRequestDelete}
                    onEditTitle={handleEditTitle}
                    onDuplicate={handleDuplicate}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <AiPageContextProvider
      value={{
        pageTitle: 'Air Quality Analysis',
        pageDescription:
          'Compare and analyze air quality trends across locations.',
        data: {
          chartCount: charts.length,
          chartTitles: charts.map(c => c.title),
        },
      }}
    >
      <div className={cn('space-y-4', className)}>
        {/* Compact page header: title, description */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-2xl text-foreground">Air Quality Analysis</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Monitor current conditions, trends and forecasts for your
              configured locations.
            </p>
          </div>
          <AiDrawerTrigger />
        </div>

        {renderTrendsView()}

        <ChartConfigDialog
          isOpen={dialogOpen}
          onClose={closeDialog}
          groupId={groupId}
          draft={editingDraft}
          onSave={draft => void handleSaveDraft(draft)}
          onSelectionNamesChange={handleNamesResolved}
          siteNames={siteNames}
          isSaving={isSaving}
          saveError={saveError}
        />

        {/* Delete chart confirmation */}
        <ReusableDialog
          isOpen={!!deleteDraft}
          onClose={cancelDelete}
          title="Delete chart?"
          subtitle={
            deleteDraft
              ? `"${deleteDraft.title}" will be permanently removed from your saved charts. This action cannot be undone.`
              : undefined
          }
          icon={AqTrash01}
          iconColor="text-destructive"
          iconBgColor="bg-destructive/10"
          size="sm"
          primaryAction={{
            label: 'Delete chart',
            onClick: confirmDelete,
            variant: 'danger',
          }}
          secondaryAction={{ label: 'Cancel', onClick: cancelDelete }}
        >
          <p className="text-sm text-muted-foreground">
            Are you sure you want to continue? The chart configuration and its
            saved settings will be removed.
          </p>
        </ReusableDialog>
      </div>
    </AiPageContextProvider>
  );
};

export default AnalyticsExplorerPage;
