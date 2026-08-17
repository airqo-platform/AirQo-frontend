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

  it('does not use a device id when its site id is missing', () => {
    expect(
      getSiteNavigationData({ id: 'device-1', name: 'Device 1' }, 'device')
    ).toBeNull();
  });
});
