'use client';

import React, { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { cn } from '@/shared/lib/utils';
import { AqSettings01 } from '@airqo/icons-react';
import { Button } from '@/shared/components/ui/button';
import { ChartContainer, DynamicChart } from '@/shared/components/charts';
import { useAqiConfig } from '@/shared/providers/aqi-config-provider';
import {
  useAnalyticsPreferences,
  useAnalyticsChartData,
} from '@/modules/analytics';
import { getGuidelinePeriod } from '@/modules/analytics/utils/chartConfig';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import AddSavedLocations from '@/modules/location-insights/add-favorites';

const isCancellationError = (error: unknown): boolean => {
  const candidate = error as {
    name?: string;
    code?: string;
    message?: string;
  } | null;

  return (
    candidate?.name === 'AbortError' ||
    candidate?.name === 'CanceledError' ||
    candidate?.code === 'ERR_CANCELED' ||
    candidate?.message === 'canceled'
  );
};

interface SavedPreferencesSectionProps {
  groupId: string;
  className?: string;
}

/**
 * Renders the org group's saved preference sites as a fixed analytics
 * chart in list mode. Hidden entirely when the org has no saved
 * preferences (backward compatibility for orgs that previously saved
 * preference sites).
 */
export const SavedPreferencesSection: React.FC<SavedPreferencesSectionProps> = ({
  groupId,
  className,
}) => {
  const [isManageLocationsOpen, setIsManageLocationsOpen] = useState(false);

  const {
    selectedSiteIds,
    isLoading: preferencesLoading,
  } = useAnalyticsPreferences({
    groupId: groupId || undefined,
    enabled: !!groupId,
  });

  const { config: aqiConfig } = useAqiConfig('pm2_5');

  const filters = useMemo(() => {
    const to = new Date();
    const from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
    return {
      frequency: 'daily',
      startDate: format(from, 'yyyy-MM-dd'),
      endDate: format(to, 'yyyy-MM-dd'),
      pollutant: 'pm2_5',
    };
  }, []);

  const { chartData, isLoading, error, refresh } = useAnalyticsChartData(
    filters,
    'line',
    selectedSiteIds,
    !!groupId && selectedSiteIds.length > 0
  );

  // Hide rule: return null while preferences are loading or when there are
  // no saved preference sites — the section only exists when the org has
  // saved preference sites.
  if (preferencesLoading || selectedSiteIds.length === 0) {
    return null;
  }

  const friendlyError = error
    ? isCancellationError(error)
      ? null
      : getUserFriendlyErrorMessage(error)
    : null;

  const siteCount = selectedSiteIds.length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">
          Saved locations
        </h2>
        <Button
          variant="filled"
          size="md"
          Icon={AqSettings01}
          onClick={() => setIsManageLocationsOpen(true)}
          disabled={!groupId}
          showTextOnMobile
        >
          Manage locations
        </Button>
      </div>

      {/* Fixed chart */}
      <ChartContainer
        title="Saved locations"
        subtitle={`${siteCount} saved location${siteCount === 1 ? '' : 's'}`}
        loading={isLoading}
        error={friendlyError}
        onRefresh={refresh}
        exportOptions={{
          enablePDF: true,
          enablePNG: true,
          filename: 'saved-preferences-trends',
        }}
      >
        {isLoading ? null : (
          <DynamicChart
            data={chartData}
            config={{
              type: 'line',
              height: 380,
            }}
            pollutant="pm2_5"
            aqiConfig={aqiConfig}
            frequency="daily"
            autoSelectType={false}
            referenceLinePeriod={getGuidelinePeriod('daily')}
          />
        )}
      </ChartContainer>

      {/* Manage locations modal */}
      <AddSavedLocations
        isOpen={isManageLocationsOpen}
        onClose={() => setIsManageLocationsOpen(false)}
      />
    </div>
  );
};
