import type { RecentReading } from '@/shared/types/api';

const getReadingTimestamp = (reading: RecentReading): number | null => {
  const timestamp = Date.parse(reading.time);
  return Number.isFinite(timestamp) ? timestamp : null;
};

const isPreferredReading = (
  candidate: RecentReading,
  current: RecentReading
): boolean => {
  const candidateTimestamp = getReadingTimestamp(candidate);
  const currentTimestamp = getReadingTimestamp(current);

  if (candidateTimestamp !== currentTimestamp) {
    if (candidateTimestamp === null) return false;
    if (currentTimestamp === null) return true;
    return candidateTimestamp > currentTimestamp;
  }

  // When timestamps match (or are both absent), prefer the API-designated
  // primary device. The timestamp remains the deciding factor otherwise.
  if (candidate.is_reading_primary !== current.is_reading_primary) {
    return candidate.is_reading_primary;
  }

  const candidateAge = candidate.timeDifferenceHours;
  const currentAge = current.timeDifferenceHours;
  if (
    Number.isFinite(candidateAge) &&
    Number.isFinite(currentAge) &&
    candidateAge !== currentAge
  ) {
    return candidateAge < currentAge;
  }

  // Keep the API's first item for a complete tie so selection is stable.
  return false;
};

/**
 * Returns one unmodified API reading per site, choosing the newest reading
 * timestamp. This gives the home cards, site details, and comparison table a
 * shared rule when the endpoint returns readings from multiple devices.
 */
export const selectLatestRecentReadingsBySiteId = (
  readings: RecentReading[]
): Map<string, RecentReading> => {
  const latestBySiteId = new Map<string, RecentReading>();

  readings.forEach(reading => {
    const siteId = reading.site_id?.trim();
    if (!siteId) return;

    const current = latestBySiteId.get(siteId);
    if (!current || isPreferredReading(reading, current)) {
      latestBySiteId.set(siteId, reading);
    }
  });

  return latestBySiteId;
};

export const selectLatestRecentReading = (
  readings: RecentReading[],
  siteId: string
): RecentReading | null =>
  selectLatestRecentReadingsBySiteId(readings).get(siteId.trim()) ?? null;
