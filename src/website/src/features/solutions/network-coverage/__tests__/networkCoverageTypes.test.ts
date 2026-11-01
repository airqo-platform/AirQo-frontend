import { normalizeNetworkCoverageSummary } from '../networkCoverageTypes';

describe('normalizeNetworkCoverageSummary', () => {
  it('preserves and normalizes backend city matches', () => {
    const result = normalizeNetworkCoverageSummary({
      success: true,
      message: 'ok',
      countries: [],
      cityMatches: [
        {
          city: ' Nairobi ',
          country: 'Kenya',
          countryId: 'kenya',
          iso2: 'ke',
          total: '77',
          active: 3,
          inactive: 74,
          center: { latitude: '-1.2864', longitude: '36.8172' },
        },
      ],
      meta: {},
    });

    expect(result.cityMatches).toEqual([
      {
        city: 'Nairobi',
        country: 'Kenya',
        countryId: 'kenya',
        iso2: 'KE',
        total: 77,
        active: 3,
        inactive: 74,
        center: { latitude: -1.2864, longitude: 36.8172 },
      },
    ]);
  });

  it('does not manufacture city matches when the field is absent', () => {
    const result = normalizeNetworkCoverageSummary({
      countries: [],
      meta: {},
    });

    expect(result.cityMatches).toBeUndefined();
  });
});
