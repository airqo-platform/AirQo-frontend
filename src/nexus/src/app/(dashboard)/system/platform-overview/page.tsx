'use client';

import React, { useCallback, useMemo } from 'react';
import Link from 'next/link';
import {
  Button,
  Card,
  LoadingState,
  PageHeading,
  MetricCard,
} from '@/shared/components/ui';
import { ErrorBanner } from '@/shared/components/ui/banner';
import { PermissionGuard } from '@/shared/components';
import { AccessDenied } from '@/shared/components/AccessDenied';
import { isForbiddenError } from '@/shared/utils/errorMessages';
import { toast } from '@/shared/components/ui';
import { refreshWithToast } from '@/shared/utils/refreshWithToast';
import { usePlatformOverview } from '@/shared/hooks/usePlatformOverview';
import { buildCsv, buildCsvFilename, downloadCsv } from '@/shared/utils/csv';
import { formatWithPattern } from '@/shared/utils/dateUtils';
import {
  AqMonitor05,
  AqGlobe05,
  AqKey01,
  AqUsers01,
  AqRefreshCw05,
  AqArrowRight,
  AqDownload01,
} from '@airqo/icons-react';

const PlatformOverviewPage: React.FC = () => {
  const { data: snapshot, isLoading, error, mutate } = usePlatformOverview();

  const isRefreshing = isLoading && Boolean(snapshot);
  const isInitialLoading = isLoading && !snapshot;
  const hasData = Boolean(snapshot);

  const handleRefresh = useCallback(async () => {
    try {
      await refreshWithToast(
        () => mutate(),
        'Platform overview refreshed successfully'
      );
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Unable to refresh platform overview'
      );
    }
  }, [mutate]);

  const handleExportCsv = useCallback(() => {
    if (!snapshot) return;

    const asOf = formatWithPattern(
      new Date(snapshot.fetchedAt),
      'yyyy-MM-dd HH:mm'
    );
    const headers = ['Metric', 'Value', 'As of'] as const;
    const rows = [
      [
        'Deployed low-cost monitors',
        String(snapshot.categories.lowcost.total_monitors),
        asOf,
      ],
      [
        'Deployed reference-grade monitors (BAM)',
        String(snapshot.categories.bam.total_monitors),
        asOf,
      ],
      [
        'Deployed gas monitors',
        String(snapshot.categories.gas.total_monitors),
        asOf,
      ],
      ['Operational now', String(snapshot.operational), asOf],
      ['Countries covered', String(snapshot.countries.length), asOf],
      ['Cities covered', String(snapshot.citiesCovered), asOf],
    ];

    const csv = buildCsv(headers, rows);
    const filename = buildCsvFilename('platform-overview-tiles');
    downloadCsv(filename, csv);
  }, [snapshot]);

  const countriesSorted = useMemo(() => {
    if (!snapshot) return [];
    return [...snapshot.countries].sort((a, b) => {
      const bySites = b.sites - a.sites;
      if (bySites !== 0) return bySites;
      return a.country.localeCompare(b.country);
    });
  }, [snapshot]);

  if (isForbiddenError(error)) {
    return (
      <AccessDenied
        title="Access Denied"
        message="You do not have the required permissions to view the platform overview."
      />
    );
  }

  if (isInitialLoading) {
    return (
      <LoadingState
        className="h-[calc(100vh-200px)]"
        text="Loading platform overview..."
      />
    );
  }

  if (error && !hasData) {
    return (
      <div className="p-6 space-y-4">
        <ErrorBanner
          title="Failed to load platform overview"
          message={error?.message || 'An error occurred while loading the data'}
        />
        <Button
          onClick={handleRefresh}
          Icon={AqRefreshCw05}
          loading={isRefreshing}
        >
          Retry
        </Button>
      </div>
    );
  }

  const lowcost = snapshot!.categories.lowcost;
  const bam = snapshot!.categories.bam;
  const gas = snapshot!.categories.gas;
  const asOfFormatted = formatWithPattern(
    new Date(snapshot!.fetchedAt),
    'yyyy-MM-dd HH:mm'
  );

  return (
    <div className="space-y-6">
      {error && hasData && (
        <div className="space-y-2">
          <ErrorBanner
            title="Failed to refresh platform overview"
            message={
              error?.message || 'Showing the last successfully loaded data'
            }
          />
          <Button
            variant="outlined"
            onClick={handleRefresh}
            Icon={AqRefreshCw05}
            loading={isRefreshing}
          >
            Retry
          </Button>
        </div>
      )}

      <PageHeading
        title="Platform Overview"
        subtitle="Headline platform totals across all deployed monitors and coverage"
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outlined"
              onClick={handleRefresh}
              Icon={AqRefreshCw05}
              loading={isRefreshing}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              onClick={handleExportCsv}
              Icon={AqDownload01}
              disabled={!hasData}
            >
              Export tiles CSV
            </Button>
          </div>
        }
      />

      {/* Headline metric tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <MetricCard
          label="Deployed low-cost monitors"
          value={lowcost.total_monitors}
          hint={
            <span className="text-xs text-muted-foreground mt-1 block">
              <AqMonitor05 className="inline w-3.5 h-3.5 mr-1" />
              {lowcost.operational} operational
            </span>
          }
        />
        <MetricCard
          label="Deployed reference-grade monitors (BAM)"
          value={bam.total_monitors}
          hint={
            <span className="text-xs text-muted-foreground mt-1 block">
              <AqMonitor05 className="inline w-3.5 h-3.5 mr-1" />
              {bam.operational} operational
            </span>
          }
        />
        <MetricCard
          label="Deployed gas monitors"
          value={gas.total_monitors}
          hint={
            <span className="text-xs text-muted-foreground mt-1 block">
              <AqMonitor05 className="inline w-3.5 h-3.5 mr-1" />
              {gas.operational} operational
            </span>
          }
        />
        <MetricCard
          label="Operational now"
          value={snapshot!.operational}
          hint={
            <span className="text-xs text-muted-foreground mt-1 block">
              {snapshot!.transmitting} transmitting now
            </span>
          }
        />
        <MetricCard
          label="Countries covered"
          value={snapshot!.countries.length}
          hint={
            <span className="text-xs text-muted-foreground mt-1 block">
              <AqGlobe05 className="inline w-3.5 h-3.5 mr-1" />
              unique countries
            </span>
          }
        />
        <MetricCard
          label="Cities covered"
          value={snapshot!.citiesCovered}
          hint={
            <span className="text-xs text-muted-foreground mt-1 block">
              <AqGlobe05 className="inline w-3.5 h-3.5 mr-1" />
              populated city grids
            </span>
          }
        />
      </div>

      {/* Countries covered */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">
            Countries covered ({snapshot!.countries.length})
          </h3>
          <span className="text-xs text-muted-foreground">
            <AqGlobe05 className="inline w-3.5 h-3.5 mr-1" />
            sorted by site count
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {countriesSorted.map(country => (
            <div
              key={country.country}
              className="flex items-center justify-between rounded-md border bg-muted/30 px-2.5 py-1.5 text-sm"
            >
              <span className="truncate mr-2" title={country.country}>
                {country.country}
              </span>
              <span className="text-xs font-medium tabular-nums text-muted-foreground">
                {country.sites}
              </span>
            </div>
          ))}
          {countriesSorted.length === 0 && (
            <p className="text-sm text-muted-foreground col-span-full">
              No country data available.
            </p>
          )}
        </div>
      </Card>

      {/* Related admin pages */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/system/user-statistics">
          <Card className="p-4 hover:bg-muted/40 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-full bg-blue-100 text-blue-700">
                  <AqUsers01 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">User Statistics</p>
                  <p className="text-xs text-muted-foreground">Total users</p>
                </div>
              </div>
              <AqArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </Card>
        </Link>
        <Link href="/system/clients">
          <Card className="p-4 hover:bg-muted/40 transition-colors cursor-pointer">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-full bg-amber-100 text-amber-700">
                  <AqKey01 className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">API Clients</p>
                  <p className="text-xs text-muted-foreground">
                    Registered apps
                  </p>
                </div>
              </div>
              <AqArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </Card>
        </Link>
      </div>

      {/* As of timestamp */}
      <p className="text-xs text-muted-foreground">As of {asOfFormatted}</p>
    </div>
  );
};

const ProtectedPlatformOverviewPage: React.FC = () => {
  return (
    <PermissionGuard
      requiredPermissions={['SYSTEM_ADMIN']}
      accessDeniedTitle="Access Denied"
      accessDeniedMessage="You need system administrator permissions to view the platform overview."
    >
      <PlatformOverviewPage />
    </PermissionGuard>
  );
};

export default ProtectedPlatformOverviewPage;
