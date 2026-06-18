export type MonitorType = 'Reference' | 'LCS' | 'Inactive';

export type MonitorStatus = 'active' | 'inactive';

export type YesNo = 'Yes' | 'No';

export type ViewMode = 'monitors' | 'coverage';

export interface NetworkCoverageMonitor {
  id: string;
  name: string;
  city: string;
  country: string;
  countryId: string;
  iso2: string;
  latitude: number | null;
  longitude: number | null;
  type: MonitorType;
  status: MonitorStatus;
  lastActive: string;
  network: string;
  operator: string;
  equipment: string;
  manufacturer: string;
  pollutants: string[];
  resolution: string;
  transmission: string;
  site: string;
  landUse: string;
  deployed: string;
  calibrationLastDate: string;
  calibrationMethod: string;
  uptime30d: string;
  publicData: YesNo;
  organisation: string;
  coLocation: string;
  coLocationNote: string;
  viewDataUrl: string;
}

export interface NetworkCoverageCountryStats {
  total: number;
  Reference: number;
  LCS: number;
  Inactive: number;
  active: number;
  inactive: number;
}

export interface NetworkCoverageCountry {
  id: string;
  country: string;
  iso2: string;
  stats?: NetworkCoverageCountryStats;
  monitors: NetworkCoverageMonitor[];
}

export interface NetworkCoverageSummaryMeta {
  totalCountries: number;
  monitoredCountries: number;
  totalMonitors?: number;
  totalPopulationReached?: number | null;
  citiesWithPopulationData?: number;
  availableNetworks?: string[];
  generatedAt: string;
}

export interface NetworkCoverageSummaryResponse {
  success: boolean;
  message: string;
  countries: NetworkCoverageCountry[];
  meta: NetworkCoverageSummaryMeta;
}

export interface NetworkCoverageCountryResponse {
  success: boolean;
  message: string;
  countryId: string;
  country: string;
  iso2: string;
  monitors: NetworkCoverageMonitor[];
}

export interface NetworkCoverageMonitorResponse {
  success: boolean;
  message: string;
  monitor: NetworkCoverageMonitor;
}

export interface NetworkCoverageQueryParams {
  tenant?: string;
  search?: string;
  activeOnly?: boolean;
  types?: string;
  network?: string;
  countryId?: string;
}

export const AFRICAN_COUNTRY_LIST: Array<{ country: string; iso2: string }> = [
  { country: 'Algeria', iso2: 'DZ' },
  { country: 'Angola', iso2: 'AO' },
  { country: 'Benin', iso2: 'BJ' },
  { country: 'Botswana', iso2: 'BW' },
  { country: 'Burkina Faso', iso2: 'BF' },
  { country: 'Burundi', iso2: 'BI' },
  { country: 'Cabo Verde', iso2: 'CV' },
  { country: 'Cameroon', iso2: 'CM' },
  { country: 'Central African Republic', iso2: 'CF' },
  { country: 'Chad', iso2: 'TD' },
  { country: 'Comoros', iso2: 'KM' },
  { country: 'Congo', iso2: 'CG' },
  { country: 'Democratic Republic of the Congo', iso2: 'CD' },
  { country: "Cote d'Ivoire", iso2: 'CI' },
  { country: 'Djibouti', iso2: 'DJ' },
  { country: 'Egypt', iso2: 'EG' },
  { country: 'Equatorial Guinea', iso2: 'GQ' },
  { country: 'Eritrea', iso2: 'ER' },
  { country: 'Eswatini', iso2: 'SZ' },
  { country: 'Ethiopia', iso2: 'ET' },
  { country: 'Gabon', iso2: 'GA' },
  { country: 'Gambia', iso2: 'GM' },
  { country: 'Ghana', iso2: 'GH' },
  { country: 'Guinea', iso2: 'GN' },
  { country: 'Guinea-Bissau', iso2: 'GW' },
  { country: 'Kenya', iso2: 'KE' },
  { country: 'Lesotho', iso2: 'LS' },
  { country: 'Liberia', iso2: 'LR' },
  { country: 'Libya', iso2: 'LY' },
  { country: 'Madagascar', iso2: 'MG' },
  { country: 'Malawi', iso2: 'MW' },
  { country: 'Mali', iso2: 'ML' },
  { country: 'Mauritania', iso2: 'MR' },
  { country: 'Mauritius', iso2: 'MU' },
  { country: 'Morocco', iso2: 'MA' },
  { country: 'Mozambique', iso2: 'MZ' },
  { country: 'Namibia', iso2: 'NA' },
  { country: 'Niger', iso2: 'NE' },
  { country: 'Nigeria', iso2: 'NG' },
  { country: 'Rwanda', iso2: 'RW' },
  { country: 'Sao Tome and Principe', iso2: 'ST' },
  { country: 'Senegal', iso2: 'SN' },
  { country: 'Seychelles', iso2: 'SC' },
  { country: 'Sierra Leone', iso2: 'SL' },
  { country: 'Somalia', iso2: 'SO' },
  { country: 'South Africa', iso2: 'ZA' },
  { country: 'South Sudan', iso2: 'SS' },
  { country: 'Sudan', iso2: 'SD' },
  { country: 'Tanzania', iso2: 'TZ' },
  { country: 'Togo', iso2: 'TG' },
  { country: 'Tunisia', iso2: 'TN' },
  { country: 'Uganda', iso2: 'UG' },
  { country: 'Zambia', iso2: 'ZM' },
  { country: 'Zimbabwe', iso2: 'ZW' },
];

export const africanIso2Codes = AFRICAN_COUNTRY_LIST.map((item) => item.iso2);

const normalizeString = (value: unknown, fallback = ''): string => {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (value === null || value === undefined) {
    return fallback;
  }

  return String(value).trim();
};

const normalizeNumber = (
  value: unknown,
  fallback: number | null = null,
): number | null => {
  if (value === null || value === undefined || value === '') return fallback;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const normalizeIso2 = (value: unknown, fallback = ''): string =>
  normalizeString(value, fallback).toUpperCase().slice(0, 2);

export const normalizeCountryId = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

const normalizeMonitorType = (value: unknown): MonitorType => {
  const normalized = normalizeString(value).toLowerCase();

  if (normalized === 'reference') return 'Reference';
  if (normalized === 'inactive') return 'Inactive';
  return 'LCS';
};

const normalizeMonitorStatus = (
  value: unknown,
  monitorType: MonitorType,
): MonitorStatus => {
  const normalized = normalizeString(value).toLowerCase();

  if (normalized === 'inactive') return 'inactive';
  if (normalized === 'active') return 'active';
  return monitorType === 'Inactive' ? 'inactive' : 'active';
};

const normalizeYesNo = (value: unknown, fallback: YesNo = 'No'): YesNo => {
  const normalized = normalizeString(value).toLowerCase();

  if (normalized === 'yes') return 'Yes';
  if (normalized === 'no') return 'No';
  return fallback;
};

const normalizeArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map((item) => normalizeString(item)).filter(Boolean);
};

export const normalizeNetworkCoverageMonitor = (
  monitor: any,
): NetworkCoverageMonitor => {
  const source = monitor ?? {};
  const type = normalizeMonitorType(source.type);
  const country = normalizeString(source.country);
  const iso2 = normalizeIso2(source.iso2, '');

  const lookupIso2ForCountry = (name?: string) => {
    if (!name) return '';
    const found = AFRICAN_COUNTRY_LIST.find(
      (item) => item.country.toLowerCase() === name.toLowerCase(),
    );
    return found ? found.iso2 : '';
  };

  return {
    id: normalizeString(source.id || source._id || source.site_id),
    name: normalizeString(source.name),
    city: normalizeString(source.city),
    country,
    countryId: normalizeString(
      source.countryId || source.country_id || normalizeCountryId(country),
    ),
    iso2: iso2 || lookupIso2ForCountry(country) || normalizeIso2(country, ''),
    latitude: normalizeNumber(source.latitude ?? source.approximate_latitude),
    longitude: normalizeNumber(
      source.longitude ?? source.approximate_longitude,
    ),
    type,
    status: normalizeMonitorStatus(source.status, type),
    lastActive: normalizeString(
      source.lastActive || source.last_active || source.last_active_at,
    ),
    network: normalizeString(source.network),
    operator: normalizeString(source.operator),
    equipment: normalizeString(source.equipment),
    manufacturer: normalizeString(source.manufacturer),
    pollutants: normalizeArray(source.pollutants),
    resolution: normalizeString(source.resolution),
    transmission: normalizeString(source.transmission),
    site: normalizeString(source.site),
    landUse: normalizeString(source.landUse || source.land_use),
    deployed: normalizeString(source.deployed),
    calibrationLastDate: normalizeString(
      source.calibrationLastDate || source.calibration_last_date,
    ),
    calibrationMethod: normalizeString(
      source.calibrationMethod || source.calibration_method,
    ),
    uptime30d: normalizeString(source.uptime30d),
    publicData: normalizeYesNo(source.publicData),
    organisation: normalizeString(source.organisation),
    coLocation:
      normalizeString(
        source.coLocation || source.co_location,
        'Not available',
      ) || 'Not available',
    coLocationNote: normalizeString(
      source.coLocationNote || source.co_location_note,
    ),
    viewDataUrl: normalizeString(source.viewDataUrl || source.view_data_url),
  };
};

export const normalizeNetworkCoverageCountry = (
  country: any,
): NetworkCoverageCountry => {
  const source = country ?? {};
  const countryName = normalizeString(source.country);
  const rawMonitors = Array.isArray(source.monitors) ? source.monitors : [];

  const lookupIso2ForCountry = (name?: string) => {
    if (!name) return '';
    const found = AFRICAN_COUNTRY_LIST.find(
      (item) => item.country.toLowerCase() === name.toLowerCase(),
    );
    return found ? found.iso2 : '';
  };

  const iso2 =
    normalizeIso2(source.iso2, '') || lookupIso2ForCountry(countryName);

  const rawStats = source.stats;
  const stats: NetworkCoverageCountryStats | undefined =
    rawStats && typeof rawStats === 'object'
      ? {
          total: normalizeNumber(rawStats.total, 0) ?? 0,
          Reference: normalizeNumber(rawStats.Reference, 0) ?? 0,
          LCS: normalizeNumber(rawStats.LCS, 0) ?? 0,
          Inactive: normalizeNumber(rawStats.Inactive, 0) ?? 0,
          active: normalizeNumber(rawStats.active, 0) ?? 0,
          inactive: normalizeNumber(rawStats.inactive, 0) ?? 0,
        }
      : undefined;

  return {
    id: normalizeString(source.id || normalizeCountryId(countryName)),
    country: countryName,
    iso2,
    stats,
    monitors: rawMonitors.map((monitor: any) =>
      normalizeNetworkCoverageMonitor(monitor),
    ),
  };
};

export const normalizeNetworkCoverageSummary = (
  summary: any,
): NetworkCoverageSummaryResponse => {
  const source = summary ?? {};
  const countries = Array.isArray(source.countries)
    ? source.countries.map((country: any) =>
        normalizeNetworkCoverageCountry(country),
      )
    : [];

  const meta = source.meta ?? {};

  return {
    success: source.success !== false,
    message: normalizeString(
      source.message,
      'Network coverage data retrieved successfully',
    ),
    countries: countries.sort(
      (left: NetworkCoverageCountry, right: NetworkCoverageCountry) =>
        left.country.localeCompare(right.country),
    ),
    meta: {
      totalCountries:
        normalizeNumber(meta.totalCountries, countries.length) ??
        countries.length,
      monitoredCountries:
        normalizeNumber(
          meta.monitoredCountries,
          countries.filter(
            (country: NetworkCoverageCountry) =>
              country.monitors && country.monitors.length > 0,
          ).length,
        ) ??
        countries.filter(
          (country: NetworkCoverageCountry) =>
            country.monitors && country.monitors.length > 0,
        ).length,
      totalMonitors: normalizeNumber(meta.totalMonitors) ?? undefined,
      totalPopulationReached: normalizeNumber(meta.totalPopulationReached),
      citiesWithPopulationData:
        normalizeNumber(meta.citiesWithPopulationData) ?? undefined,
      availableNetworks: Array.isArray(meta.availableNetworks)
        ? meta.availableNetworks
            .map((n: unknown) => normalizeString(n))
            .filter(Boolean)
        : undefined,
      generatedAt: normalizeString(meta.generatedAt),
    },
  };
};

// ── /impact endpoint types ────────────────────────────────────────────────

export interface ImpactCountryEntry {
  country: string;
  iso2: string;
  population: number | null;
  total: number;
  Reference: number;
  LCS: number;
  active: number;
  inactive: number;
}

export interface ImpactCityEntry {
  city: string;
  country: string;
  iso2: string;
  population: number | null;
  total: number;
  Reference: number;
  LCS: number;
  active: number;
  inactive: number;
}

export interface ImpactManufacturerEntry {
  sensorManufacturer: string;
  totalMonitors: number;
  byType: { Reference: number; LCS: number; Inactive: number };
  byStatus: { active: number; inactive: number };
  totalCities: number;
  totalCountries: number;
  totalPopulationReached: number | null;
  citiesWithPopulationData: number;
  byCountry: ImpactCountryEntry[];
  byCity: ImpactCityEntry[];
}

export interface NetworkCoverageImpact {
  totalMonitors: number;
  byType: { Reference: number; LCS: number; Inactive: number };
  byStatus: { active: number; inactive: number };
  totalCities: number;
  totalCountries: number;
  totalPopulationReached: number | null;
  citiesWithPopulationData: number;
  byCountry: ImpactCountryEntry[];
  byCity: ImpactCityEntry[];
  bySensorManufacturer: ImpactManufacturerEntry[];
  generatedAt: string;
}

export interface NetworkCoverageImpactResponse {
  success: boolean;
  message: string;
  impact: NetworkCoverageImpact;
}

// ── /cities endpoint types ────────────────────────────────────────────────

export interface CityPopulationEntry {
  _id: string;
  city: string;
  displayCity: string;
  country: string;
  displayCountry: string;
  iso2: string;
  population: number;
  year: number;
  source: string;
  notes?: string;
}

export interface NetworkCoverageCitiesResponse {
  success: boolean;
  cities: CityPopulationEntry[];
}

// ── Normalizers for /impact ───────────────────────────────────────────────

export const normalizeImpactCountryEntry = (
  entry: any,
): ImpactCountryEntry => ({
  country: normalizeString(entry?.country),
  iso2: normalizeIso2(entry?.iso2),
  population:
    entry?.population === null || entry?.population === undefined
      ? null
      : normalizeNumber(entry.population),
  total: normalizeNumber(entry?.total, 0) ?? 0,
  Reference: normalizeNumber(entry?.Reference, 0) ?? 0,
  LCS: normalizeNumber(entry?.LCS, 0) ?? 0,
  active: normalizeNumber(entry?.active, 0) ?? 0,
  inactive: normalizeNumber(entry?.inactive, 0) ?? 0,
});

export const normalizeImpactCityEntry = (entry: any): ImpactCityEntry => ({
  city: normalizeString(entry?.city),
  country: normalizeString(entry?.country),
  iso2: normalizeIso2(entry?.iso2),
  population:
    entry?.population === null || entry?.population === undefined
      ? null
      : normalizeNumber(entry.population),
  total: normalizeNumber(entry?.total, 0) ?? 0,
  Reference: normalizeNumber(entry?.Reference, 0) ?? 0,
  LCS: normalizeNumber(entry?.LCS, 0) ?? 0,
  active: normalizeNumber(entry?.active, 0) ?? 0,
  inactive: normalizeNumber(entry?.inactive, 0) ?? 0,
});

export const normalizeNetworkCoverageImpact = (
  data: any,
): NetworkCoverageImpactResponse => {
  const source = data ?? {};
  const impact = source.impact ?? {};

  return {
    success: source.success !== false,
    message: normalizeString(
      source.message,
      'Impact summary retrieved successfully',
    ),
    impact: {
      totalMonitors: normalizeNumber(impact.totalMonitors, 0) ?? 0,
      byType: {
        Reference: normalizeNumber(impact.byType?.Reference, 0) ?? 0,
        LCS: normalizeNumber(impact.byType?.LCS, 0) ?? 0,
        Inactive: normalizeNumber(impact.byType?.Inactive, 0) ?? 0,
      },
      byStatus: {
        active: normalizeNumber(impact.byStatus?.active, 0) ?? 0,
        inactive: normalizeNumber(impact.byStatus?.inactive, 0) ?? 0,
      },
      totalCities: normalizeNumber(impact.totalCities, 0) ?? 0,
      totalCountries: normalizeNumber(impact.totalCountries, 0) ?? 0,
      totalPopulationReached: normalizeNumber(impact.totalPopulationReached),
      citiesWithPopulationData:
        normalizeNumber(impact.citiesWithPopulationData, 0) ?? 0,
      byCountry: Array.isArray(impact.byCountry)
        ? impact.byCountry.map(normalizeImpactCountryEntry)
        : [],
      byCity: Array.isArray(impact.byCity)
        ? impact.byCity.map(normalizeImpactCityEntry)
        : [],
      bySensorManufacturer: Array.isArray(impact.bySensorManufacturer)
        ? impact.bySensorManufacturer.map((m: any) => ({
            sensorManufacturer: normalizeString(m?.sensorManufacturer),
            totalMonitors: normalizeNumber(m?.totalMonitors, 0) ?? 0,
            byType: {
              Reference: normalizeNumber(m?.byType?.Reference, 0) ?? 0,
              LCS: normalizeNumber(m?.byType?.LCS, 0) ?? 0,
              Inactive: normalizeNumber(m?.byType?.Inactive, 0) ?? 0,
            },
            byStatus: {
              active: normalizeNumber(m?.byStatus?.active, 0) ?? 0,
              inactive: normalizeNumber(m?.byStatus?.inactive, 0) ?? 0,
            },
            totalCities: normalizeNumber(m?.totalCities, 0) ?? 0,
            totalCountries: normalizeNumber(m?.totalCountries, 0) ?? 0,
            totalPopulationReached: normalizeNumber(m?.totalPopulationReached),
            citiesWithPopulationData:
              normalizeNumber(m?.citiesWithPopulationData, 0) ?? 0,
            byCountry: Array.isArray(m?.byCountry)
              ? m.byCountry.map(normalizeImpactCountryEntry)
              : [],
            byCity: Array.isArray(m?.byCity)
              ? m.byCity.map(normalizeImpactCityEntry)
              : [],
          }))
        : [],
      generatedAt: normalizeString(impact.generatedAt),
    },
  };
};

// ── Normalizers for /cities ───────────────────────────────────────────────

export const normalizeCityPopulationEntry = (
  entry: any,
): CityPopulationEntry => ({
  _id: normalizeString(entry?._id),
  city: normalizeString(entry?.city),
  displayCity: normalizeString(entry?.displayCity || entry?.city),
  country: normalizeString(entry?.country),
  displayCountry: normalizeString(entry?.displayCountry || entry?.country),
  iso2: normalizeIso2(entry?.iso2),
  population: normalizeNumber(entry?.population, 0) ?? 0,
  year: normalizeNumber(entry?.year, 0) ?? 0,
  source: normalizeString(entry?.source),
  notes: normalizeString(entry?.notes),
});

export const normalizeNetworkCoverageCities = (
  data: any,
): NetworkCoverageCitiesResponse => {
  const source = data ?? {};
  return {
    success: source.success !== false,
    cities: Array.isArray(source.cities)
      ? source.cities.map(normalizeCityPopulationEntry)
      : [],
  };
};
