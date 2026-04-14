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

export interface NetworkCoverageCountry {
  id: string;
  country: string;
  iso2: string;
  monitors: NetworkCoverageMonitor[];
}

export interface NetworkCoverageSummaryMeta {
  totalCountries: number;
  monitoredCountries: number;
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

  return {
    id: normalizeString(source.id || normalizeCountryId(countryName)),
    country: countryName,
    iso2,
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
        normalizeNumber(source.meta?.totalCountries, countries.length) ??
        countries.length,
      monitoredCountries:
        normalizeNumber(
          source.meta?.monitoredCountries,
          countries.filter(
            (country: NetworkCoverageCountry) =>
              country.monitors && country.monitors.length > 0,
          ).length,
        ) ??
        countries.filter(
          (country: NetworkCoverageCountry) =>
            country.monitors && country.monitors.length > 0,
        ).length,
      generatedAt: normalizeString(source.meta?.generatedAt),
    },
  };
};
