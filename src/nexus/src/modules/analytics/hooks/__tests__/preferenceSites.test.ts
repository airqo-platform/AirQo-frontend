import {
  normalizePreferenceSelectedSites,
  resolvePreferenceSiteName,
} from '../index';

describe('resolvePreferenceSiteName', () => {
  it('prefers search_name', () => {
    expect(
      resolvePreferenceSiteName({
        search_name: 'Nakawa',
        location_name: 'Nakawa Market',
        name: 'nak',
        formatted_name: 'Formatted',
      })
    ).toBe('Nakawa');
  });

  it('falls back to location_name when search_name is absent', () => {
    expect(resolvePreferenceSiteName({ location_name: 'Nakawa Market' })).toBe(
      'Nakawa Market'
    );
  });

  it('skips empty-string fields in the chain', () => {
    expect(
      resolvePreferenceSiteName({
        search_name: '',
        location_name: '  ',
        name: 'Makindye',
        formatted_name: 'Formatted',
      })
    ).toBe('Makindye');
  });

  it('falls through name to formatted_name', () => {
    expect(
      resolvePreferenceSiteName({ formatted_name: 'Formatted Only' })
    ).toBe('Formatted Only');
  });

  it("returns '' when no name field exists — never fabricates an id", () => {
    expect(resolvePreferenceSiteName({ _id: '647f095449596a0012c34f6e' })).toBe(
      ''
    );
    expect(resolvePreferenceSiteName(null)).toBe('');
    expect(resolvePreferenceSiteName(undefined)).toBe('');
  });
});

describe('normalizePreferenceSelectedSites', () => {
  it('resolves the canonical display name into search_name', () => {
    const [site] = normalizePreferenceSelectedSites(
      ['site-1'],
      [
        {
          _id: 'site-1',
          name: 'Nakawa',
          city: 'Kampala',
          country: 'Uganda',
        },
      ]
    );

    expect(site._id).toBe('site-1');
    expect(site.search_name).toBe('Nakawa');
    expect(site.city).toBe('Kampala');
    expect(site.country).toBe('Uganda');
  });

  it('uses location_name when search_name is absent (renders instead of raw id)', () => {
    const [site] = normalizePreferenceSelectedSites(
      ['site-1'],
      [{ _id: 'site-1', location_name: 'Nakawa Market' }]
    );

    expect(site.search_name).toBe('Nakawa Market');
  });

  it('never fabricates the raw site id as a name for nameless payload entries', () => {
    const rawId = '647f095449596a0012c34f6e';
    const [site] = normalizePreferenceSelectedSites(
      [rawId],
      [{ _id: rawId, city: 'Kampala' }]
    );

    expect(site.search_name).toBe('');
    expect(site.name).toBeUndefined();
  });

  it('keeps ids selectable without fabricating names when the payload has no entry', () => {
    const sites = normalizePreferenceSelectedSites(
      ['known-site', 'orphan-id'],
      [{ _id: 'known-site', search_name: 'Known' }]
    );

    expect(sites).toHaveLength(2);
    expect(sites[0]).toMatchObject({ _id: 'known-site', search_name: 'Known' });
    expect(sites[1]._id).toBe('orphan-id');
    expect(sites[1].search_name).toBe('');
    expect(sites[1].name).toBeUndefined();
  });

  it('orders output by selectedSiteIds and skips entries without resolvable ids', () => {
    const sites = normalizePreferenceSelectedSites(
      ['b', 'a'],
      [
        { _id: 'a', search_name: 'Alpha' },
        { id: 'b', search_name: 'Bravo' },
        { search_name: 'No id — dropped' },
      ]
    );

    expect(sites.map(site => site._id)).toEqual(['b', 'a']);
    expect(sites.map(site => site.search_name)).toEqual(['Bravo', 'Alpha']);
  });
});
