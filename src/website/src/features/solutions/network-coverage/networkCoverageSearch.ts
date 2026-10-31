import type {
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

  const countryMatches = normalizeSearchValue(country.country).includes(
    normalizedQuery,
  );
  const monitors = country.monitors.filter((monitor) =>
    monitorSearchFields(monitor).some((field) =>
      normalizeSearchValue(field).includes(normalizedQuery),
    ),
  );
  const cities = Array.from(
    new Set(monitors.map((monitor) => monitor.city.trim()).filter(Boolean)),
  );

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
