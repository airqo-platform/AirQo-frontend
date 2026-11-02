import {
  extractNetworkCoverageMonitorId,
  extractNetworkCoverageRegistration,
} from '../networkCoverageRegistry';

describe('extractNetworkCoverageMonitorId', () => {
  it.each([
    [{ registry: { _id: 'registry-id' } }, 'registry-id'],
    [{ registry: { id: 'registry-id' } }, 'registry-id'],
    [{ data: { monitor: { id: 'monitor-id' } } }, 'monitor-id'],
    [{ data: { _id: 'registry-id', monitorId: 'site-id' } }, 'site-id'],
    [{ _id: { $oid: 'mongo-id' } }, 'mongo-id'],
    [{ id: 'direct-id' }, 'direct-id'],
  ])('supports the API response envelope %j', (response, expected) => {
    expect(extractNetworkCoverageMonitorId(response)).toBe(expected);
  });

  it('extracts the backend registration contract', () => {
    expect(
      extractNetworkCoverageRegistration({
        data: {
          _id: 'registry-id',
          monitorId: 'site-id',
          countryId: 'kenya',
          iso2: 'KE',
          availability: 'pending',
        },
      }),
    ).toEqual({
      monitorId: 'site-id',
      countryId: 'kenya',
      iso2: 'KE',
      availability: 'pending',
    });
  });

  it('returns null when no stable identifier is present', () => {
    expect(
      extractNetworkCoverageMonitorId({ registry: { name: 'No id' } }),
    ).toBe(null);
  });
});
