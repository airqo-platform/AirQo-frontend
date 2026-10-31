import {
  filterNetworkCoverageCountries,
  getNetworkCoverageSearchMatches,
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

  it('filters out countries with no city, station, network, or country match', () => {
    expect(filterNetworkCoverageCountries([kenya], 'Kampala')).toEqual([]);
    expect(filterNetworkCoverageCountries([kenya], 'Nairobi')).toEqual([kenya]);
  });
});
