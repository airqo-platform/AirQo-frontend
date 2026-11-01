import type {
  NetworkCoverageCityMatch,
  NetworkCoverageCountry,
  NetworkCoverageMonitor,
} from './networkCoverageTypes';
import { normalizeCountryId } from './networkCoverageTypes';

export interface NetworkCoverageSearchMatches {
  countryMatches: boolean;
  monitors: NetworkCoverageMonitor[];
  cities: string[];
}

const normalizeSearchValue = (value: unknown): string =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

const normalizeCountryIdentifier = (value: unknown): string => {
  if (typeof value !== 'string' || !value.trim()) return '';
  return normalizeCountryId(value);
};

const normalizeCountryIso2 = (value: unknown): string =>
  typeof value === 'string' ? value.trim().toUpperCase() : '';

const normalizeCountryName = (value: unknown): string =>
  normalizeSearchValue(value)
    .replace(/\([^)]*\)/g, '')
    .replace(/^the\s+/, '')
    .replace(/\s+/g, ' ')
    .trim();

const getCountryIdentity = (country: NetworkCoverageCountry): string =>
  normalizeCountryIdentifier(country.id) ||
  normalizeCountryIso2(country.iso2) ||
  normalizeCountryName(country.country);

export const findNetworkCoverageCountryForCityMatch = (
  cityMatch: NetworkCoverageCityMatch,
  countries: NetworkCoverageCountry[],
): NetworkCoverageCountry | undefined => {
  const countryId = normalizeCountryIdentifier(cityMatch.countryId);
  const iso2 = normalizeCountryIso2(cityMatch.iso2);
  const countryName = normalizeCountryName(cityMatch.country);

  const matches = [
    countryId
      ? countries.find(
          (country) => normalizeCountryIdentifier(country.id) === countryId,
        )
      : undefined,
    iso2
      ? countries.find((country) => normalizeCountryIso2(country.iso2) === iso2)
      : undefined,
    countryName
      ? countries.find(
          (country) => normalizeCountryName(country.country) === countryName,
        )
      : undefined,
  ].filter((country): country is NetworkCoverageCountry => Boolean(country));

  if (matches.length === 0) return undefined;

  const identity = getCountryIdentity(matches[0]);
  return matches.every((country) => getCountryIdentity(country) === identity)
    ? matches[0]
    : undefined;
};

export const getVisibleNetworkCoverageCityMatch = (
  cityMatch: NetworkCoverageCityMatch,
  country?: NetworkCoverageCountry,
): NetworkCoverageCityMatch | null => {
  if (!country) return null;

  const normalizedCity = normalizeSearchValue(cityMatch.city);
  const visibleMonitors = country.monitors.filter(
    (monitor) => normalizeSearchValue(monitor.city) === normalizedCity,
  );

  if (visibleMonitors.length === 0) return null;

  return {
    ...cityMatch,
    total: visibleMonitors.length,
    active: visibleMonitors.filter((monitor) => monitor.status === 'active')
      .length,
    inactive: visibleMonitors.filter((monitor) => monitor.status === 'inactive')
      .length,
  };
};

const monitorSearchFields = (monitor: NetworkCoverageMonitor): string[] => [
  monitor.name,
  monitor.city,
  monitor.network,
];

export const getNetworkCoverageSearchMatches = (
  country: NetworkCoverageCountry,
  query: string,
): NetworkCoverageSearchMatches => {
  const normalizedQuery = normalizeSearchValue(query);
  if (!normalizedQuery) {
    return { countryMatches: false, monitors: [], cities: [] };
  }

  const countryMatches =
    normalizeSearchValue(country.country).includes(normalizedQuery) ||
    normalizeSearchValue(country.iso2) === normalizedQuery;
  const monitors = country.monitors.filter(
    (monitor) =>
      normalizeSearchValue(monitor.iso2) === normalizedQuery ||
      monitorSearchFields(monitor).some((field) =>
        normalizeSearchValue(field).includes(normalizedQuery),
      ),
  );
  const cityByKey = new Map<string, string>();
  for (const monitor of monitors) {
    const city = monitor.city.trim();
    const key = normalizeSearchValue(city);
    if (city && key.includes(normalizedQuery) && !cityByKey.has(key)) {
      cityByKey.set(key, city);
    }
  }
  const cities = Array.from(cityByKey.values());

  return { countryMatches, monitors, cities };
};

export const filterNetworkCoverageCountries = (
  countries: NetworkCoverageCountry[],
  query: string,
): NetworkCoverageCountry[] => {
  const normalizedQuery = normalizeSearchValue(query);
  if (!normalizedQuery) return countries;

  return countries.filter((country) => {
    const matches = getNetworkCoverageSearchMatches(country, normalizedQuery);
    return matches.countryMatches || matches.monitors.length > 0;
  });
};
