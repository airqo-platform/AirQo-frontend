'use client';

import React, { useMemo, useState } from 'react';
import { cn } from '@/shared/lib/utils';
import { AqSettings01 } from '@airqo/icons-react';
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
export const SavedPreferencesSection: React.FC<
  SavedPreferencesSectionProps
> = ({ groupId, className }) => {
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
      siteNames: {},
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
        footerAction={
          <button
            type="button"
            onClick={() => setIsManageLocationsOpen(true)}
            className="flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
          >
            <AqSettings01 className="h-3.5 w-3.5" />
            Manage locations
          </button>
        }
      />

      {/* Manage locations modal */}
      <AddSavedLocations
        isOpen={isManageLocationsOpen}
        onClose={() => setIsManageLocationsOpen(false)}
      />
    </div>
  );
};
