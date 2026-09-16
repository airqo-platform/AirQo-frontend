import {
  buildComparisonCsv,
  buildComparisonFilename,
} from '../comparisonExport';
import {
  buildComparisonRow,
  buildEmptyComparisonRow,
  type ComparisonRow,
} from '../../../utils/comparisonRows';
import type { RecentReading } from '@/shared/types/api';

const makeReading = (
  overrides: Partial<Record<string, unknown>> = {}
): RecentReading =>
  ({
    _id: 'reading-1',
    site_id: 'site-1',
    time: '2026-08-22T09:05:00Z',
    __v: 0,
    aqi_category: 'Moderate',
    aqi_color: 'ECAA06',
    aqi_color_name: 'yellow',
    aqi_index: 72,
    aqi_ranges: {},
    averages: {},
    createdAt: '2026-08-22T09:05:00Z',
    device: 'device-1',
    frequency: 'hourly',
    health_tips: [],
    is_reading_primary: true,
    no2: { value: 3 },
    pm10: { value: 15 },
    pm2_5: { value: 12.3 },
    siteDetails: {
      _id: 'site-1',
      formatted_name: 'Formatted Site',
      street: '',
      parish: '',
      village: '',
      sub_county: '',
      town: '',
      city: 'Kampala',
      district: '',
      county: '',
      region: '',
      country: 'Uganda',
      name: 'Kampala Site',
      description: '',
      location_name: 'Location Name',
      search_name: 'Kampala Site',
      approximate_latitude: 0.3,
      approximate_longitude: 32.6,
      data_provider: 'AirQo',
      site_category: { tags: [], category: 'Reference' },
    },
    timeDifferenceHours: 2,
    updatedAt: '2026-08-22T09:05:00Z',
    ...overrides,
  }) as unknown as RecentReading;

/** Strips the UTF-8 BOM and splits on CRLF to produce record lines. */
const csvLines = (csv: string): string[] =>
  csv.replace(/^\uFEFF/, '').split('\r\n');

describe('buildComparisonCsv', () => {
  it('writes the table headers and one cell per column', () => {
    const row = buildComparisonRow(makeReading());
    const csv = buildComparisonCsv([row]);

    const lines = csvLines(csv);
    expect(lines[0]).toBe('Site,AQI,PM2.5,PM10,NO2,Last reading,Freshness');
    // Time/freshness labels are local-time — take them from the row the same
    // way the table computes them so the export matches the table exactly.
    expect(lines[1]).toBe(
      `Kampala Site,72,12.3,15.0,3.0,${row.lastReadingLabel},${row.freshnessLabel}`
    );
    expect(lines).toHaveLength(2);
  });

  it('starts with a UTF-8 BOM so Excel picks the right encoding', () => {
    expect(buildComparisonCsv([])).toMatch(/^\uFEFF/);
    // ...and still parses the header line cleanly after stripping it.
    const csv = buildComparisonCsv([]);
    expect(csvLines(csv)[0]).toBe(
      'Site,AQI,PM2.5,PM10,NO2,Last reading,Freshness'
    );
  });

  it('renders no-reading rows the way the table does ("No reading" / "—")', () => {
    const row: ComparisonRow = buildEmptyComparisonRow('site-9', 'Nowhere');
    const csv = buildComparisonCsv([row]);

    const dataLine = csvLines(csv)[1];
    expect(dataLine).toBe('Nowhere,No reading,—,—,—,—,No reading');
  });

  it('emits a null-pollutant reading as "—" while keeping others', () => {
    const row = buildComparisonRow(
      makeReading({
        no2: { value: null },
        pm10: { value: null },
      })
    );
    const csv = buildComparisonCsv([row]);
    const cells = csvLines(csv)[1].split(',');
    expect(cells[1]).toBe('72');
    expect(cells[2]).toBe('12.3');
    expect(cells[3]).toBe('—');
    expect(cells[4]).toBe('—');
  });

  it('escapes commas and quotes in a site name per RFC 4180', () => {
    const base = makeReading();
    const row = buildComparisonRow({
      ...base,
      siteDetails: {
        ...base.siteDetails,
        search_name: 'Kampala, "Central"',
      } as RecentReading['siteDetails'],
    });
    const csv = buildComparisonCsv([row]);
    const dataLine = csvLines(csv)[1];

    // The field containing comma+quote is quoted, inner quotes doubled.
    expect(dataLine).toContain('"Kampala, ""Central""",72,');
  });

  it('joins multi-row exports with CRLF line endings', () => {
    const first = makeReading();
    const second = makeReading({
      _id: 'reading-2',
      site_id: 'site-2',
      aqi_index: 35,
      siteDetails: {
        ...first.siteDetails,
        search_name: 'Jinja',
      } as RecentReading['siteDetails'],
    });
    const csv = buildComparisonCsv([
      buildComparisonRow(first),
      buildComparisonRow(second),
    ]);

    // Verify CRLF separators are present in the raw CSV.
    const body = csv.replace(/^\uFEFF/, '');
    expect(body).toContain('\r\n');

    const lines = csvLines(csv);
    expect(lines).toHaveLength(3);
    expect(lines[1].startsWith('Kampala Site,72,')).toBe(true);
    expect(lines[2].startsWith('Jinja,35,')).toBe(true);
  });
});

describe('CSV formula injection (sanitizeCsvCell)', () => {
  it('prefixes a single quote when site name starts with "="', () => {
    const base = makeReading();
    const row = buildComparisonRow({
      ...base,
      siteDetails: {
        ...base.siteDetails,
        search_name: '=SUM(1)',
      } as RecentReading['siteDetails'],
    });
    const csv = buildComparisonCsv([row]);
    const firstCell = csvLines(csv)[1].split(',')[0];
    expect(firstCell).toBe("'=SUM(1)");
  });

  it('prefixes a single quote when site name starts with "+"', () => {
    const base = makeReading();
    const row = buildComparisonRow({
      ...base,
      siteDetails: {
        ...base.siteDetails,
        search_name: '+cmd',
      } as RecentReading['siteDetails'],
    });
    const csv = buildComparisonCsv([row]);
    const firstCell = csvLines(csv)[1].split(',')[0];
    expect(firstCell).toBe("'+cmd");
  });

  it('prefixes a single quote when site name starts with "-"', () => {
    const base = makeReading();
    const row = buildComparisonRow({
      ...base,
      siteDetails: {
        ...base.siteDetails,
        search_name: '-2+3',
      } as RecentReading['siteDetails'],
    });
    const csv = buildComparisonCsv([row]);
    const firstCell = csvLines(csv)[1].split(',')[0];
    expect(firstCell).toBe("'-2+3");
  });

  it('prefixes a single quote when site name starts with "@"', () => {
    const base = makeReading();
    const row = buildComparisonRow({
      ...base,
      siteDetails: {
        ...base.siteDetails,
        search_name: '@CMD',
      } as RecentReading['siteDetails'],
    });
    const csv = buildComparisonCsv([row]);
    const firstCell = csvLines(csv)[1].split(',')[0];
    expect(firstCell).toBe("'@CMD");
  });

  it('prefixes a single quote when site name has a leading tab', () => {
    // Build the row directly (bypassing getComparisonSiteDisplayName which
    // trims tabs) to verify the sanitizer handles raw tab-prefixed input.
    const row: ComparisonRow = {
      siteId: 'site-tab',
      siteName: '\tTabSite',
      hasReading: true,
      aqiIndex: 50,
      aqiColor: '#000',
      pm2_5: 10,
      pm10: 10,
      no2: 5,
      readingTime: '2026-08-22T09:05:00Z',
      lastReadingLabel: '09:05',
      freshnessLabel: '2h ago',
    };
    const csv = buildComparisonCsv([row]);
    const firstCell = csvLines(csv)[1].split(',')[0];
    expect(firstCell).toBe("'\tTabSite");
  });

  it('does not sanitise site names that are safe', () => {
    const base = makeReading();
    const row = buildComparisonRow({
      ...base,
      siteDetails: {
        ...base.siteDetails,
        search_name: 'Kampala Site',
      } as RecentReading['siteDetails'],
    });
    const csv = buildComparisonCsv([row]);
    const firstCell = csvLines(csv)[1].split(',')[0];
    expect(firstCell).toBe('Kampala Site');
  });

  it('sanitises string cells but leaves numeric values untouched', () => {
    const base = makeReading();
    const row = buildComparisonRow({
      ...base,
      siteDetails: {
        ...base.siteDetails,
        search_name: '=evil',
      } as RecentReading['siteDetails'],
    });
    const csv = buildComparisonCsv([row]);
    const cells = csvLines(csv)[1].split(',');
    // Site name is sanitised.
    expect(cells[0]).toBe("'=evil");
    // AQI is numeric, not sanitised.
    expect(cells[1]).toBe('72');
  });
});

describe('buildComparisonFilename', () => {
  it('uses the air-quality-comparison-<yyyy-MM-dd> shape', () => {
    const date = new Date(2026, 0, 5); // 2026-01-05 local time
    expect(buildComparisonFilename(date)).toBe(
      'air-quality-comparison-2026-01-05.csv'
    );
  });

  it('zero-pads month and day', () => {
    const date = new Date(2026, 8, 9); // 2026-09-09 local time
    expect(buildComparisonFilename(date)).toBe(
      'air-quality-comparison-2026-09-09.csv'
    );
  });
});
