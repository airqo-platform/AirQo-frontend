'use client';

import React, { useMemo, useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { AqSettings01 } from '@airqo/icons-react';
import { Button } from '@/shared/components/ui/button';
import { useAnalyticsPreferences } from '@/modules/analytics';
import {
  deriveRangeFromDays,
  type ExplorerChartDraft,
} from '@/modules/analytics/utils/chartConfig';
import AddSavedLocations from '@/modules/location-insights/add-favorites';
import { AnalyticsChartCard } from '@/modules/analytics/components/explorer/AnalyticsChartCard';
import { getSiteDisplayName } from '@/shared/utils/siteUtils';

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
  const [forecastEnabled, setForecastEnabled] = useState(false);

  const {
    selectedSiteIds,
    selectedSites,
    isLoading: preferencesLoading,
  } = useAnalyticsPreferences({
    groupId: groupId || undefined,
    enabled: !!groupId,
  });

  const siteCount = selectedSiteIds.length;

  // Build the synthetic draft — stable data shape for AnalyticsChartCard.
  const range = useMemo(() => deriveRangeFromDays(7), []);
  const syntheticDraft: ExplorerChartDraft = useMemo(
    () => ({
      id: 'saved-preferences',
      fieldId: 1,
      title: 'Air pollution trend',
      subtitle: `Daily PM2.5 levels across ${siteCount} saved location${siteCount === 1 ? '' : 's'}`,
      chartType: 'Line',
      pollutant: 'pm2_5',
      frequency: 'daily',
      startDate: range.startDate,
      endDate: range.endDate,
      siteIds: selectedSiteIds,
      color: null,
      locationColors: [],
      themeColors: false,
      referenceStandard: 'WHO',
      showLegend: true,
      showGrid: true,
      showTooltip: true,
      referenceLines: [],
    }),
    [siteCount, selectedSiteIds, range.startDate, range.endDate]
  );

  // Build siteNames Map (siteId → display name) from selectedSites.
  const siteNames = useMemo(() => {
    const map = new Map<string, string>();
    for (const site of selectedSites) {
      map.set(site._id, getSiteDisplayName(site));
    }
    return map;
  }, [selectedSites]);

  // Hide rule: return null while preferences are loading or when there are
  // no saved preference sites — the section only exists when the org has
  // saved preference sites.
  if (preferencesLoading || selectedSiteIds.length === 0) {
    return null;
  }

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
      <AnalyticsChartCard
        draft={syntheticDraft}
        groupId={groupId}
        siteNames={siteNames}
        forecastEnabled={forecastEnabled}
        onForecastToggle={() => setForecastEnabled(v => !v)}
        onEdit={() => {}}
        onRequestDelete={() => {}}
        onDuplicate={async () => {}}
        isFixed
      />

      {/* Manage locations modal */}
      <AddSavedLocations
        isOpen={isManageLocationsOpen}
        onClose={() => setIsManageLocationsOpen(false)}
      />
    </div>
  );
};
