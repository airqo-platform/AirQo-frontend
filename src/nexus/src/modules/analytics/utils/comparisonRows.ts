import type {
  ComparisonSiteReading,
  RecentReading,
  SiteDetails,
} from '@/shared/types/api';

/**
 * One row of the "Compare locations" table. Rows exist for EVERY selected
 * location — a location whose reading is missing renders an honest
 * "No reading" row (hasReading: false), never a silently-omitted line.
 */
export interface ComparisonRow {
  siteId: string;
  siteName: string;
  hasReading: boolean;
  /** Numeric AQI index (e.g. 72); null when there is no reading. */
  aqiIndex: number | null;
  /** CSS-ready hex color ('#ECAA06'); null when there is no reading. */
  aqiColor: string | null;
  pm2_5: number | null;
  pm10: number | null;
  no2: number | null;
  /** ISO timestamp of the reading; null when there is no reading. */
  readingTime: string | null;
  /** Formatted local time, e.g. "14:05 · Aug 22". */
  lastReadingLabel: string;
  /** "<1h ago" / "3h ago" / "2d ago" / "No reading". */
  freshnessLabel: string;
}

export type ComparisonSortKey =
  'name' | 'aqi' | 'pm2_5' | 'pm10' | 'no2' | 'time';
export type ComparisonSortDir = 'asc' | 'desc';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/**
 * The backend sends `aqi_color` as hex WITHOUT a leading # ("ECAA06").
 * Normalize defensively: trim, return null for empty values and pass values
 * that already carry a # straight through.
 */
export const normalizeAqiColor = (
  color: string | null | undefined
): string | null => {
  const trimmed = color?.trim();
  if (!trimmed) return null;
  return trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
};

/** Rounds a pollutant value to 1 decimal; non-finite/null → null. */
export const roundPollutantValue = (
  value: number | null | undefined
): number | null => {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null;
  return Math.round(value * 10) / 10;
};

/**
 * Freshness bucket for the reading age in hours:
 * `<1h ago` / `Xh ago` / `Xd ago`, or "No reading" when absent/invalid.
 */
export const getFreshnessLabel = (hours: number | null | undefined): string => {
  if (typeof hours !== 'number' || !Number.isFinite(hours) || hours < 0) {
    return 'No reading';
  }
  if (hours < 1) return '<1h ago';
  if (hours < 24) return `${Math.floor(hours)}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

/**
 * Display name for the comparison table. Precedence: `search_name` (the
 * site-level alias, e.g. "3rd Street, Ibex Hill"), then `location_name`
 * (the city/area label, e.g. "Lusaka Central, Zambia") — user requirement.
 * Falls back to the site id.
 *
 * Unlike the shared `getSiteDisplayName`, this does NOT end in the generic
 * "Unknown Location" sentinel: an omitted name must never masquerade as a
 * real location in the comparison table, so we fall back to the site id.
 */
export const getComparisonSiteDisplayName = (
  siteDetails: SiteDetails | null | undefined
): string => {
  if (!siteDetails) return '';
  return (
    siteDetails.search_name?.trim() ||
    siteDetails.location_name?.trim() ||
    siteDetails.name?.trim() ||
    siteDetails.formatted_name?.trim() ||
    siteDetails._id ||
    ''
  );
};

/** Local-time label for a reading timestamp, e.g. "14:05 · Aug 22". */
export const formatLastReading = (
  isoTime: string | null | undefined
): string => {
  if (!isoTime) return '—';
  const date = new Date(isoTime);
  if (Number.isNaN(date.getTime())) return '—';
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())} · ${
    MONTHS[date.getMonth()]
  } ${date.getDate()}`;
};

const pollutantValue = (
  reading: RecentReading,
  key: 'pm2_5' | 'pm10' | 'no2'
): number | null => roundPollutantValue(reading[key]?.value);

/** Builds a display row from a recent-readings API measurement. */
export const buildComparisonRow = (reading: RecentReading): ComparisonRow => {
  // A reading is real only when the payload actually carried one: the mapped
  // no-reading row has an empty time and index 0, and must render as an
  // honest "No reading" row (aqi null, freshness "No reading"), never a fake
  // "0" AQI.
  const hasReading = !!reading.time || reading.aqi_index > 0;
  const time = hasReading && reading.time ? reading.time : null;

  return {
    siteId: reading?.site_id ?? '',
    siteName:
      getComparisonSiteDisplayName(reading?.siteDetails) ||
      (reading?.site_id ?? ''),
    hasReading,
    aqiIndex:
      hasReading && typeof reading.aqi_index === 'number'
        ? reading.aqi_index
        : null,
    aqiColor: hasReading ? normalizeAqiColor(reading.aqi_color) : null,
    pm2_5: hasReading ? pollutantValue(reading, 'pm2_5') : null,
    pm10: hasReading ? pollutantValue(reading, 'pm10') : null,
    no2: hasReading ? pollutantValue(reading, 'no2') : null,
    readingTime: time,
    lastReadingLabel: formatLastReading(time),
    freshnessLabel: hasReading
      ? getFreshnessLabel(reading.timeDifferenceHours)
      : 'No reading',
  };
};

/**
 * Honest placeholder row for a selected location the response did not cover
 * (valid-but-unknown site id, or no recent reading). Rendered with "—"
 * values and a muted "No reading" pill — never silently omitted.
 */
export const buildEmptyComparisonRow = (
  siteId: string,
  siteName: string
): ComparisonRow => ({
  siteId,
  siteName,
  hasReading: false,
  aqiIndex: null,
  aqiColor: null,
  pm2_5: null,
  pm10: null,
  no2: null,
  readingTime: null,
  lastReadingLabel: '—',
  freshnessLabel: 'No reading',
});

/**
 * Maps a ComparisonSiteReading (from POST /devices/readings/comparisons) to
 * the existing RecentReading shape the comparison table already renders.
 * Every field is defensively defaulted so a partial/null API payload never
 * throws at render time.
 */
export const mapComparisonSiteReadingToRecentReading = (
  reading: ComparisonSiteReading
): RecentReading => {
  const site = reading.site;
  return {
    _id: reading.site_id,
    site_id: reading.site_id,
    time: reading.time ?? '',
    __v: 0,
    aqi_category: reading.aqi?.category ?? '',
    aqi_color: reading.aqi?.color ?? '',
    aqi_color_name: reading.aqi?.color_name ?? '',
    aqi_index: reading.aqi?.index ?? 0,
    aqi_ranges: {} as RecentReading['aqi_ranges'],
    averages: {} as RecentReading['averages'],
    createdAt: '',
    device: '',
    device_id: '',
    frequency: '',
    health_tips: [],
    is_reading_primary: true,
    no2: { value: reading.pollutants?.no2?.value ?? null },
    pm10: { value: reading.pollutants?.pm10?.value ?? null },
    pm2_5: { value: reading.pollutants?.pm2_5?.value ?? null },
    // NaN sentinel: an omitted freshness must never masquerade as a fresh
    // '<1h ago' reading — getFreshnessLabel treats non-finite as unknown.
    timeDifferenceHours: reading.time_difference_hours ?? Number.NaN,
    updatedAt: '',
    siteDetails: {
      _id: reading.site_id,
      formatted_name: '',
      street: '',
      parish: '',
      village: '',
      sub_county: '',
      town: '',
      city: site?.city ?? '',
      district: '',
      county: '',
      region: '',
      country: site?.country ?? '',
      name: site?.name ?? '',
      description: '',
      location_name: site?.location_name ?? '',
      search_name: '',
      // NaN sentinel: a missing coordinate must never fabricate (0,0) —
      // downstream toFiniteNumber in ComparisonView treats non-finite as absent.
      approximate_latitude: site?.latitude ?? Number.NaN,
      approximate_longitude: site?.longitude ?? Number.NaN,
      data_provider: '',
      site_category: { tags: [], category: '' },
    } as RecentReading['siteDetails'],
  };
};

/**
 * Merges the two live-readings payloads into one RecentReading per selected
 * site:
 * - POST /devices/readings/comparisons provides the authoritative SITE
 *   METADATA (name/location_name/city/country/geo) and the has_reading flag —
 *   it carries no measurements.
 * - POST /devices/readings/recent provides the actual MEASUREMENTS (aqi,
 *   pm2_5/pm10/no2, time, freshness).
 *
 * For every comparison site: metadata comes from the comparison payload,
 * measurement fields from the recent reading when present (otherwise an
 * honest no-reading row is kept — never omitted). Recent readings whose site
 * id the comparison payload omitted are appended defensively.
 */
export const mergeComparisonReadings = (
  comparisonSites: ComparisonSiteReading[],
  recentReadings: RecentReading[]
): RecentReading[] => {
  const recentBySiteId = new Map<string, RecentReading>();
  recentReadings.forEach(reading => {
    if (!recentBySiteId.has(reading.site_id)) {
      recentBySiteId.set(reading.site_id, reading);
    }
  });
  const coveredSiteIds = new Set<string>();
  const merged = comparisonSites.map(comparisonSite => {
    coveredSiteIds.add(comparisonSite.site_id);
    const metadataRow = mapComparisonSiteReadingToRecentReading(comparisonSite);
    const recent = recentBySiteId.get(comparisonSite.site_id);
    if (!recent) return metadataRow;
    // The comparisons payload never carries search_name (only name/location_name/city/country/geo),
    // so preserve the recent reading's site-level alias for the display-name precedence
    // (search_name || location_name) instead of throwing it away.
    return {
      ...recent,
      siteDetails: {
        ...metadataRow.siteDetails,
        search_name:
          recent.siteDetails?.search_name ||
          metadataRow.siteDetails.search_name,
      },
    };
  });
  const extras = recentReadings.filter(
    reading => !coveredSiteIds.has(reading.site_id)
  );
  return [...merged, ...extras];
};

const sortValueFor = (
  row: ComparisonRow,
  key: ComparisonSortKey
): number | string | null => {
  switch (key) {
    case 'name':
      return row.siteName.toLowerCase();
    case 'aqi':
      return row.aqiIndex;
    case 'pm2_5':
      return row.pm2_5;
    case 'pm10':
      return row.pm10;
    case 'no2':
      return row.no2;
    case 'time':
      return row.readingTime;
  }
};

/**
 * Sorts comparison rows without mutating the input. The default
 * (`key: 'aqi'`, `dir: 'desc'`) is the specialist "league table": worst AQI
 * first, locations without readings last, ties broken alphabetically.
 * Null values always sink to the bottom regardless of direction.
 */
export const sortComparisonRows = (
  rows: ComparisonRow[],
  key: ComparisonSortKey = 'aqi',
  dir: ComparisonSortDir = 'desc'
): ComparisonRow[] =>
  [...rows].sort((a, b) => {
    const valueA = sortValueFor(a, key);
    const valueB = sortValueFor(b, key);

    if (valueA === null && valueB === null) {
      return a.siteName.localeCompare(b.siteName);
    }
    if (valueA === null) return 1;
    if (valueB === null) return -1;

    const result = valueA < valueB ? -1 : valueA > valueB ? 1 : 0;
    if (result !== 0) return dir === 'asc' ? result : -result;
    return a.siteName.localeCompare(b.siteName);
  });
