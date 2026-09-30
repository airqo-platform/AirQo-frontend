'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useUser } from '@/shared/hooks/useUser';
import { useGroupCharts } from '@/shared/hooks/useGroupCharts';
import { useAnalyticsPreferences } from '@/modules/analytics/hooks';
import { useSavedComparisons } from '@/modules/analytics/hooks/useSavedComparisons';
import { useRecentReadings } from '@/modules/analytics/hooks/useRecentReadings';
import { loadWorkspaceDraft } from '@/modules/data-visualizer/utils/workspaceStorage';
import type { VisualizerWorkspaceDraft } from '@/modules/data-visualizer/types';
import { getSiteDisplayName } from '@/shared/utils/siteUtils';
import { toSiteSlug } from '@/modules/data-download/utils/siteDetails';
import { buildContinueItems, getHomeExperienceMode } from '../utils';
import { getHomeDemoData } from '../demoData';
import type { HomeDemoMode, HomeExperienceData } from '../types';

export const useHomeExperience = (
  demoMode?: HomeDemoMode
): HomeExperienceData => {
  const { user, activeGroup, isLoading: userLoading } = useUser();
  const groupId = activeGroup?.id ?? '';
  const userId = user?.id ?? '';
  const enabled = !demoMode && !!groupId && !!userId;

  const preferences = useAnalyticsPreferences({
    groupId,
    userId,
    enabled,
  });
  const charts = useGroupCharts(groupId, enabled);
  const savedComparisons = useSavedComparisons({ groupId, enabled });
  const [draft, setDraft] = useState<VisualizerWorkspaceDraft | null>(null);
  const [draftLoading, setDraftLoading] = useState(enabled);
  const [draftError, setDraftError] = useState(false);
  const draftRequestRef = useRef(0);

  useEffect(() => {
    const requestId = ++draftRequestRef.current;
    setDraft(null);
    setDraftError(false);
    if (!enabled) {
      setDraftLoading(false);
      return;
    }

    setDraftLoading(true);
    void loadWorkspaceDraft()
      .then(result => {
        if (draftRequestRef.current === requestId) setDraft(result);
      })
      .catch(() => {
        if (draftRequestRef.current !== requestId) return;
        setDraft(null);
        setDraftError(true);
      })
      .finally(() => {
        if (draftRequestRef.current === requestId) setDraftLoading(false);
      });
  }, [enabled, groupId]);

  const selectedSiteIds = useMemo(
    () => preferences.selectedSiteIds.slice(0, 3),
    [preferences.selectedSiteIds]
  );
  const recentReadings = useRecentReadings({
    userId,
    groupId,
    siteIds: selectedSiteIds,
    enabled,
    measurementsOnly: true,
    keepPreviousData: false,
  });

  const realData = useMemo<HomeExperienceData>(() => {
    const chartItems = charts.data ?? [];
    const selectedSitesById = new Map(
      preferences.selectedSites.map(site => [site._id, site])
    );
    const readingsBySiteId = new Map(
      recentReadings.readings
        .filter(reading => selectedSiteIds.includes(reading.site_id))
        .map(reading => [reading.site_id, reading])
    );
    const updatesLoading =
      enabled && selectedSiteIds.length > 0 && recentReadings.isLoading;
    const locationUpdates = updatesLoading
      ? []
      : selectedSiteIds.map(siteId => {
          const site = selectedSitesById.get(siteId);
          const reading = readingsBySiteId.get(siteId);
          return {
            name: site ? getSiteDisplayName(site) : 'Saved location',
            href: site
              ? `/user/air-quality/analytics/sites/${toSiteSlug(getSiteDisplayName(site))}?site_id=${encodeURIComponent(siteId)}`
              : '/user/air-quality/analytics?view=comparison',
            aqiIndex: reading?.aqi_index ?? null,
            aqiCategory: reading?.aqi_category ?? null,
            measuredAt: reading?.time,
          };
        });

    const counts = {
      savedLocations: preferences.selectedSiteIds.length,
      charts: chartItems.length,
      comparisons: savedComparisons.comparisons.length,
      drafts: draft ? 1 : 0,
    };

    return {
      mode: getHomeExperienceMode({
        savedLocationCount: counts.savedLocations,
        chartCount: counts.charts,
        comparisonCount: counts.comparisons,
        hasDraft: !!draft,
      }),
      continueItems: buildContinueItems({
        comparisons: savedComparisons.comparisons,
        draft,
        preference: preferences.preferences,
        charts: chartItems,
        savedLocationCount: counts.savedLocations,
      }),
      locationUpdates,
      counts,
      isLoading:
        userLoading ||
        preferences.isLoading ||
        charts.isLoading ||
        savedComparisons.isLoading ||
        draftLoading,
      updatesLoading,
      hasPartialError: Boolean(
        preferences.error ||
        charts.error ||
        savedComparisons.error ||
        recentReadings.error ||
        draftError
      ),
    };
  }, [
    charts.data,
    charts.error,
    charts.isLoading,
    draft,
    draftError,
    draftLoading,
    enabled,
    preferences.error,
    preferences.isLoading,
    preferences.preferences,
    preferences.selectedSiteIds,
    preferences.selectedSites,
    recentReadings.error,
    recentReadings.isLoading,
    recentReadings.readings,
    savedComparisons.comparisons,
    savedComparisons.error,
    savedComparisons.isLoading,
    selectedSiteIds,
    userLoading,
  ]);

  return demoMode ? getHomeDemoData(demoMode) : realData;
};
