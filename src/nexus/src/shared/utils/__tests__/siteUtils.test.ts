import {
  getSiteDisplayName,
  normalizeSiteData,
  normalizeSitesData,
  getSiteDisplayValue,
  isValidSiteData,
  type RawSiteData,
} from '../siteUtils';

const makeSite = (overrides: Partial<RawSiteData> = {}): RawSiteData => ({
  _id: 'site-1',
  ...overrides,
});

describe('getSiteDisplayName', () => {
  describe('priority levels', () => {
    it('prioritizes search_name over all others', () => {
      expect(
        getSiteDisplayName(
          makeSite({
            search_name: 'Search',
            location_name: 'Location',
            name: 'Name',
            formatted_name: 'Formatted',
          })
        )
      ).toBe('Search');
    });

    it('falls back to location_name when search_name is missing', () => {
      expect(
        getSiteDisplayName(
          makeSite({
            location_name: 'Location',
            name: 'Name',
            formatted_name: 'Formatted',
          })
        )
      ).toBe('Location');
    });

    it('falls back to name when search_name and location_name are missing', () => {
      expect(
        getSiteDisplayName(
          makeSite({ name: 'Name', formatted_name: 'Formatted' })
        )
      ).toBe('Name');
    });

    it('falls back to formatted_name when higher priority fields are missing', () => {
      expect(
        getSiteDisplayName(makeSite({ formatted_name: 'Formatted' }))
      ).toBe('Formatted');
    });

    it('returns "Unknown Location" when all fields are missing', () => {
      expect(getSiteDisplayName(makeSite())).toBe('Unknown Location');
    });
  });

  describe('whitespace handling', () => {
    it('trims search_name', () => {
      expect(getSiteDisplayName(makeSite({ search_name: '  trimmed  ' }))).toBe(
        'trimmed'
      );
    });

    it('whitespace-only search_name falls through to next field', () => {
      expect(
        getSiteDisplayName(
          makeSite({ search_name: '   ', location_name: 'Location' })
        )
      ).toBe('Location');
    });

    it('whitespace-only location_name falls through to next field', () => {
      expect(
        getSiteDisplayName(makeSite({ location_name: '   ', name: 'Name' }))
      ).toBe('Name');
    });

    it('whitespace-only name falls through to next field', () => {
      expect(
        getSiteDisplayName(
          makeSite({ name: '   ', formatted_name: 'Formatted' })
        )
      ).toBe('Formatted');
    });

    it('whitespace-only formatted_name falls through to default', () => {
      expect(getSiteDisplayName(makeSite({ formatted_name: '   ' }))).toBe(
        'Unknown Location'
      );
    });

    it('empty string search_name falls through to next field', () => {
      expect(
        getSiteDisplayName(
          makeSite({ search_name: '', location_name: 'Location' })
        )
      ).toBe('Location');
    });
  });
});

describe('normalizeSiteData', () => {
  it('creates normalized object with all fields', () => {
    const raw = makeSite({
      search_name: 'Test Site',
      city: 'Kampala',
      country: 'Uganda',
      data_provider: 'AirQo',
    });
    const result = normalizeSiteData(raw);
    expect(result.id).toBe('site-1');
    expect(result.location).toBe('Test Site');
    expect(result.city).toBe('Kampala');
    expect(result.country).toBe('Uganda');
    expect(result.owner).toBe('AirQo');
  });

  it('uses fallbacks for missing fields', () => {
    const result = normalizeSiteData(makeSite());
    expect(result.location).toBe('Unknown Location');
    expect(result.city).toBe('Unknown City');
    expect(result.country).toBe('Unknown Country');
    expect(result.owner).toBe('Unknown Owner');
  });

  it('preserves _raw reference', () => {
    const raw = makeSite({ search_name: 'Test' });
    const result = normalizeSiteData(raw);
    expect(result._raw).toBe(raw);
  });
});

describe('normalizeSitesData', () => {
  it('maps array of raw sites', () => {
    const raw = [
      makeSite({
        _id: '1',
        search_name: 'A',
        city: 'C1',
        country: 'Co1',
        data_provider: 'O1',
      }),
      makeSite({
        _id: '2',
        search_name: 'B',
        city: 'C2',
        country: 'Co2',
        data_provider: 'O2',
      }),
    ];
    const result = normalizeSitesData(raw);
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('1');
    expect(result[1].id).toBe('2');
  });

  it('returns empty array for empty input', () => {
    expect(normalizeSitesData([])).toEqual([]);
  });
});

describe('getSiteDisplayValue', () => {
  const site = makeSite({
    search_name: 'Site A',
    city: 'Kampala',
    country: 'Uganda',
    data_provider: 'AirQo',
  });

  it('returns location', () => {
    expect(getSiteDisplayValue(site, 'location')).toBe('Site A');
  });

  it('returns city', () => {
    expect(getSiteDisplayValue(site, 'city')).toBe('Kampala');
  });

  it('returns country', () => {
    expect(getSiteDisplayValue(site, 'country')).toBe('Uganda');
  });

  it('returns owner', () => {
    expect(getSiteDisplayValue(site, 'owner')).toBe('AirQo');
  });

  it('returns fallbacks for missing fields', () => {
    const empty = makeSite();
    expect(getSiteDisplayValue(empty, 'location')).toBe('Unknown Location');
    expect(getSiteDisplayValue(empty, 'city')).toBe('Unknown City');
    expect(getSiteDisplayValue(empty, 'country')).toBe('Unknown Country');
    expect(getSiteDisplayValue(empty, 'owner')).toBe('Unknown Owner');
  });
});

describe('isValidSiteData', () => {
  it('returns true for valid objects', () => {
    expect(isValidSiteData({ _id: 'abc' })).toBe(true);
  });

  it('returns false for null', () => {
    expect(isValidSiteData(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isValidSiteData(undefined)).toBe(false);
  });

  it('returns false for non-object (number)', () => {
    expect(isValidSiteData(42)).toBe(false);
  });

  it('returns false for non-object (string)', () => {
    expect(isValidSiteData('string')).toBe(false);
  });

  it('returns false for missing _id', () => {
    expect(isValidSiteData({ name: 'test' })).toBe(false);
  });

  it('returns false for non-string _id', () => {
    expect(isValidSiteData({ _id: 123 })).toBe(false);
  });

  it('returns true for empty string _id because typeof "" === "string"', () => {
    expect(isValidSiteData({ _id: '' })).toBe(true);
  });
});
