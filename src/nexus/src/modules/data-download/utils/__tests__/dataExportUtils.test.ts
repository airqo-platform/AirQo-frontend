import {
  getSiteNavigationData,
  getTableItemSelectionLabel,
  processSitesData,
} from '../dataExportUtils';

describe('getTableItemSelectionLabel', () => {
  it('prefers a usable name over the other candidates', () => {
    expect(
      getTableItemSelectionLabel({
        name: 'Kawempe Division',
        site_name: 'Something else',
      })
    ).toBe('Kawempe Division');
  });

  it('skips the "--" placeholder in favor of site_name', () => {
    expect(
      getTableItemSelectionLabel({ name: '--', site_name: 'Siavonga' })
    ).toBe('Siavonga');
  });

  it('skips blank and whitespace-only values', () => {
    expect(
      getTableItemSelectionLabel({
        name: '   ',
        site_name: '',
        device_name: '  Device 1  ',
      })
    ).toBe('Device 1');
  });

  it('skips raw 24-hex identifiers', () => {
    expect(
      getTableItemSelectionLabel({
        name: '64f1a2b3c4d5e6f7a8b9c0d1',
        site_name: 'Nakawa',
      })
    ).toBe('Nakawa');
  });

  it('falls back to "location" when every candidate is invalid', () => {
    expect(getTableItemSelectionLabel({ name: '--', site_name: null })).toBe(
      'location'
    );
    expect(
      getTableItemSelectionLabel({
        name: '',
        site_name: '   ',
        device_name: '5f8d2a1b9c0e3d4f6a7b8c9d',
      })
    ).toBe('location');
    expect(getTableItemSelectionLabel({})).toBe('location');
  });
});

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
