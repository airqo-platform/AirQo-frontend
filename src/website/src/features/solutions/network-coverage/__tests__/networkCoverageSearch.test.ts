import {
  filterNetworkCoverageCountries,
  findNetworkCoverageCountryForCityMatch,
  getNetworkCoverageSearchMatches,
  getVisibleNetworkCoverageCityMatch,
} from '../networkCoverageSearch';
import type { NetworkCoverageCountry } from '../networkCoverageTypes';

const kenya: NetworkCoverageCountry = {
  id: 'kenya',
  country: 'Kenya',
  iso2: 'KE',
  monitors: [
    {
      id: 'nairobi-1',
      name: 'Nairobi Central',
      city: 'Nairobi',
      country: 'Kenya',
      countryId: 'kenya',
      iso2: 'KE',
      latitude: -1.28,
      longitude: 36.82,
      type: 'LCS',
      status: 'active',
      lastActive: '',
      network: 'Africa Network',
      operator: '',
      equipment: '',
      manufacturer: '',
      pollutants: [],
      resolution: '',
      transmission: '',
      site: '',
      landUse: '',
      deployed: '',
      calibrationLastDate: '',
      calibrationMethod: '',
      uptime30d: '',
      publicData: 'No',
      organisation: '',
      coLocation: '',
      coLocationNote: '',
      viewDataUrl: '',
    },
  ],
};

describe('network coverage search', () => {
  it('returns the matching monitor and city for a city query', () => {
    const result = getNetworkCoverageSearchMatches(kenya, ' Nairobi ');

    expect(result.countryMatches).toBe(false);
    expect(result.monitors.map((monitor) => monitor.id)).toEqual(['nairobi-1']);
    expect(result.cities).toEqual(['Nairobi']);
  });

  it('keeps country queries working', () => {
    const result = getNetworkCoverageSearchMatches(kenya, 'ken');

    expect(result.countryMatches).toBe(true);
    expect(result.monitors).toHaveLength(0);
  });

  it('matches exact ISO2 country codes, including countries without monitors', () => {
    const unmonitored = {
      ...kenya,
      id: 'gambia',
      country: 'The Gambia',
      iso2: 'GM',
      monitors: [],
    };

    expect(
      getNetworkCoverageSearchMatches(unmonitored, 'gm').countryMatches,
    ).toBe(true);
    expect(
      getNetworkCoverageSearchMatches(unmonitored, 'gma').countryMatches,
    ).toBe(false);
  });

  it('filters out countries with no city, station, network, or country match', () => {
    expect(filterNetworkCoverageCountries([kenya], 'Kampala')).toEqual([]);
    expect(filterNetworkCoverageCountries([kenya], 'Nairobi')).toEqual([kenya]);
  });

  it('does not label a network-only match as a city match', () => {
    const result = getNetworkCoverageSearchMatches(kenya, 'Africa Network');

    expect(result.monitors).toHaveLength(1);
    expect(result.cities).toEqual([]);
  });

  it('matches monitor ISO2 only by exact equality', () => {
    const eswatini = {
      ...kenya,
      id: 'eswatini',
      country: 'Eswatini',
      iso2: 'SZ',
      monitors: [
        {
          ...kenya.monitors[0],
          id: 'mbabane-1',
          name: 'Central Sensor',
          city: 'Mbabane',
          network: 'AirQo',
          iso2: 'SZ',
        },
      ],
    };

    expect(getNetworkCoverageSearchMatches(eswatini, 'z').monitors).toEqual([]);
    expect(
      getNetworkCoverageSearchMatches(eswatini, 'sz').monitors,
    ).toHaveLength(1);
  });

  it('deduplicates city matches case-insensitively while keeping first spelling', () => {
    const result = getNetworkCoverageSearchMatches(
      {
        ...kenya,
        monitors: [
          ...kenya.monitors,
          { ...kenya.monitors[0], id: 'nairobi-2', city: 'nairobi' },
        ],
      },
      'nairobi',
    );

    expect(result.cities).toEqual(['Nairobi']);
  });

  it('uses only visible monitors when building a city match', () => {
    const result = getVisibleNetworkCoverageCityMatch(
      {
        city: 'Nairobi',
        country: 'Kenya',
        countryId: 'kenya',
        iso2: 'KE',
        total: 3,
        active: 2,
        inactive: 1,
        center: { latitude: -1.28, longitude: 36.82 },
      },
      kenya,
    );

    expect(result).toEqual(
      expect.objectContaining({ total: 1, active: 1, inactive: 0 }),
    );
  });

  it('drops a city when no filtered monitor remains visible', () => {
    expect(
      getVisibleNetworkCoverageCityMatch(
        {
          city: 'Nairobi',
          country: 'Kenya',
          countryId: 'kenya',
          iso2: 'KE',
          total: 1,
          active: 1,
          inactive: 0,
          center: { latitude: -1.28, longitude: 36.82 },
        },
        { ...kenya, monitors: [] },
      ),
    ).toBeNull();
  });

  it('rejects city matches whose country identifiers conflict', () => {
    const uganda = {
      ...kenya,
      id: 'uganda',
      country: 'Uganda',
      iso2: 'UG',
    };

    expect(
      findNetworkCoverageCountryForCityMatch(
        {
          city: 'Kampala',
          country: 'Uganda',
          countryId: 'kenya',
          iso2: 'UG',
          total: 1,
          active: 1,
          inactive: 0,
          center: { latitude: 0.35, longitude: 32.58 },
        },
        [kenya, uganda],
      ),
    ).toBeUndefined();
  });
});
