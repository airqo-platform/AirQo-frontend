import { useMemo } from 'react';
import { parseAndValidateISODate } from '@/core/utils/dateUtils';

export function useNormalizedData(data, selectedSites, visibleSiteIds) {
  return useMemo(() => {
    if (!Array.isArray(data) || !selectedSites?.length)
      return { chartData: [], siteIdToName: {} };

    const normalizedSelectedIds = Array.isArray(selectedSites[0])
      ? selectedSites.map((s) => s._id || s.id || s.site_id).filter(Boolean)
      : selectedSites;

    const combined = {};
    const names = {};

    data.forEach(({ site_id, name, value, time }) => {
      if (value == null || !normalizedSelectedIds.includes(site_id)) return;

      names[site_id] = name;
      const date = parseAndValidateISODate(time);
      if (!date) return;
      const iso = date.toISOString();
      combined[iso] = { time: iso, ...(combined[iso] || {}), [site_id]: value };
    });

    const chartData = Object.values(combined).sort(
      (a, b) => new Date(a.time) - new Date(b.time),
    );

    const activeIds = visibleSiteIds?.length
      ? visibleSiteIds
      : normalizedSelectedIds;

    const seriesKeys = Object.keys(chartData[0] || {}).filter(
      (k) => k !== 'time' && activeIds.includes(k),
    );

    return { chartData, siteIdToName: names, seriesKeys };
  }, [data, selectedSites, visibleSiteIds]);
}
