import type {
  NetworkCoverageCityMatch,
  NetworkCoverageCountry,
  NetworkCoverageMonitor,
} from './networkCoverageTypes';

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
  monitor.iso2,
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
  const monitors = country.monitors.filter((monitor) =>
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
