import { getSiteNavigationData, processSitesData } from '../dataExportUtils';

describe('processSitesData', () => {
  it('uses the canonical site document ID before legacy site_id values', () => {
    const [site] = processSitesData([
      {
        _id: 'mongo-site-1',
        site_id: 'legacy-site-1',
        name: 'Kawempe Division',
      },
    ]);

    expect(site.id).toBe('mongo-site-1');
  });
});

describe('getSiteNavigationData', () => {
  it('uses the linked site id for device navigation', () => {
    expect(
      getSiteNavigationData(
        {
          id: 'device-1',
          site_id: 'site-1',
          site_name: 'Kawempe Division',
        },
        'device'
      )
    ).toMatchObject({
      siteId: 'site-1',
      displayName: 'Kawempe Division',
    });
  });

  it('prefers approximate coordinates used by the map marker', () => {
    expect(
      getSiteNavigationData({
        id: 'site-1',
        name: 'Kawempe Division',
        approximate_latitude: 0.3476,
        approximate_longitude: 32.5825,
        latitude: 0.348,
        longitude: 32.583,
      })
    ).toMatchObject({
      siteId: 'site-1',
      latitude: 0.3476,
      longitude: 32.5825,
    });
  });

  it('parses coordinate strings and skips invalid approximate values', () => {
    expect(
      getSiteNavigationData({
        id: 'site-1',
        name: 'Kawempe Division',
        approximate_latitude: 'not-a-coordinate',
        approximate_longitude: 300,
        latitude: '0.3476',
        longitude: '32.5825',
      })
    ).toMatchObject({
      latitude: 0.3476,
      longitude: 32.5825,
    });
  });

  it('does not use a device id when its site id is missing', () => {
    expect(
      getSiteNavigationData({ id: 'device-1', name: 'Device 1' }, 'device')
    ).toBeNull();
  });
});
