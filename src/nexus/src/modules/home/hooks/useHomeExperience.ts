'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useUser } from '@/shared/hooks/useUser';
import { useGroupCharts } from '@/shared/hooks/useGroupCharts';
import { useAnalyticsPreferences } from '@/modules/analytics/hooks';
import { useSavedComparisons } from '@/modules/analytics/hooks/useSavedComparisons';
import { useRecentReadings } from '@/modules/analytics/hooks/useRecentReadings';
import { selectLatestRecentReadingsBySiteId } from '@/modules/analytics/utils/recentReadings';
import { loadWorkspaceDraft } from '@/modules/data-visualizer/utils/workspaceStorage';
import type { VisualizerWorkspaceDraft } from '@/modules/data-visualizer/types';
import { toSiteSlug } from '@/modules/data-download/utils/siteDetails';
import { buildContinueItems, getHomeExperienceMode } from '../utils';
import { getHomeDemoData } from '../demoData';
import { READINGS_HREF } from '../constants';
import type { HomeDemoMode, HomeExperienceData } from '../types';

/** Number of comparison sites surfaced as update cards on the homepage. */
const MAX_UPDATE_CARDS = 3;

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

  // The saved-comparisons list is sorted by `updated_at desc`, so index 0 is
  // the comparison the comparison table itself auto-loads (ComparisonView).
  const activeComparison = savedComparisons.comparisons[0] ?? null;
  const siteIds = useMemo(
    () => activeComparison?.site_ids.slice(0, MAX_UPDATE_CARDS) ?? [],
    [activeComparison]
  );
  const recentReadings = useRecentReadings({
    userId,
    groupId,
    siteIds,
    enabled: enabled && siteIds.length > 0,
    measurementsOnly: true,
    keepPreviousData: false,
  });

  const realData = useMemo<HomeExperienceData>(() => {
    const chartItems = charts.data ?? [];
    const readingsBySiteId = selectLatestRecentReadingsBySiteId(
      recentReadings.readings.filter(reading =>
        siteIds.includes(reading.site_id)
      )
    );
    const updatesLoading =
      enabled && siteIds.length > 0 && recentReadings.isLoading;
    const locationUpdates = updatesLoading
      ? []
      : siteIds.map(siteId => {
          const site = activeComparison?.sites.find(item => item.id === siteId);
          const displayName = site?.location ?? site?.name ?? null;
          const reading = readingsBySiteId.get(siteId);
          return {
            name: displayName ?? 'Saved location',
            href: displayName
              ? `/user/air-quality/analytics/sites/${toSiteSlug(displayName)}?site_id=${encodeURIComponent(siteId)}`
              : READINGS_HREF,
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
      activeComparison: activeComparison
        ? { id: activeComparison.id, name: activeComparison.name }
        : null,
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
    activeComparison,
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
    recentReadings.error,
    recentReadings.isLoading,
    recentReadings.readings,
    savedComparisons.comparisons,
    savedComparisons.error,
    savedComparisons.isLoading,
    siteIds,
    userLoading,
  ]);

  return demoMode ? getHomeDemoData(demoMode) : realData;
};
