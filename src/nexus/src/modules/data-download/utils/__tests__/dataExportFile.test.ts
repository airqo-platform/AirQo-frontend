import {
  parseDownloadResponseRecords,
  parseDownloadCsvRows,
  buildDownloadFileContent,
  getPdfTableLayout,
} from '../dataExportFile';
import type { DataDownloadResponse } from '@/shared/types/api';

const asDownloadResponse = (response: unknown) =>
  response as DataDownloadResponse;

describe('parseDownloadResponseRecords', () => {
  it('parses CSV responses into normalized records', () => {
    const records = parseDownloadResponseRecords(
      'site_id,site_name,pm2_5\nsite-1,Siavonga,4.46'
    );

    expect(records).toEqual([
      { site_id: 'site-1', site_name: 'Siavonga', pm2_5: '4.46' },
    ]);
  });

  it('parses JSON responses returned as text', () => {
    const records = parseDownloadResponseRecords(
      JSON.stringify({
        status: 'success',
        data: [{ site_id: 'site-1', pm2_5: 4.46 }],
      })
    );

    expect(records).toEqual([{ site_id: 'site-1', pm2_5: 4.46 }]);
  });
});

describe('ID stripping in file builds', () => {
  const responseWithIds = asDownloadResponse({
    status: 'success',
    message: 'ok',
    data: [
      {
        site_id: 'abc123',
        device_id: 'def456',
        _id: 'mongo-id',
        __v: 2,
        site_name: 'Siavonga',
        pm2_5: 4.46,
      },
    ],
    metadata: { total_count: 1, has_more: false, next: null },
  });

  it('strips internal IDs from CSV output', () => {
    const { content } = buildDownloadFileContent(responseWithIds, 'csv');
    const csvText = content as string;

    expect(csvText).not.toContain('abc123');
    expect(csvText).not.toContain('def456');
    expect(csvText).not.toContain('mongo-id');
    expect(csvText).not.toContain('__v');
    // Headers are the non-ID columns only.
    expect(csvText).toContain('"site_name"');
    expect(csvText).toContain('pm2_5');
  });

  it('strips internal IDs from JSON output', () => {
    const { content } = buildDownloadFileContent(responseWithIds, 'json');
    const jsonText = content as string;

    expect(jsonText).not.toContain('abc123');
    expect(jsonText).not.toContain('def456');
    expect(jsonText).not.toContain('mongo-id');
    expect(jsonText).not.toContain('__v');
  });

  it('strips internal IDs from JSON string responses too', () => {
    const { content } = buildDownloadFileContent(
      JSON.stringify({
        status: 'success',
        data: [{ site_id: 'abc123', site_name: 'Siavonga', pm2_5: 4.46 }],
      }),
      'json'
    );
    const jsonText = content as string;

    expect(jsonText).not.toContain('abc123');
    expect(jsonText).toContain('Siavonga');
  });
});

describe('nested object flattening', () => {
  it('flattens nested site/siteDetails/device objects into names', () => {
    const records = parseDownloadResponseRecords(
      asDownloadResponse({
        status: 'success',
        data: [
          {
            site: { name: 'Nested Site', search_name: 'Nested Search' },
            device: { name: 'Nested Device' },
            pm2_5: 4.46,
          },
        ],
      })
    );

    expect(records).toEqual([
      {
        site_name: 'Nested Site',
        device_name: 'Nested Device',
        pm2_5: 4.46,
      },
    ]);
  });

  it('prefers top-level site_name over nested object names', () => {
    const records = parseDownloadResponseRecords(
      asDownloadResponse({
        status: 'success',
        data: [
          {
            site_name: 'Top Level',
            site: { name: 'Nested Site' },
            pm2_5: 4.46,
          },
        ],
      })
    );

    expect(records).toEqual([{ site_name: 'Top Level', pm2_5: 4.46 }]);
  });
});

describe('yearly frequency datetime normalization', () => {
  // The API omits datetime/date/time for frequency 'yearly' and returns only
  // `year` — the datetime cell must be derived from it, not left empty.
  const yearlyResponse = asDownloadResponse({
    status: 'success',
    message: 'ok',
    data: [
      {
        site_name: 'X',
        frequency: 'yearly',
        year: 2026,
        pm2_5: 12,
        site_id: 'site-abc123',
      },
    ],
    metadata: { total_count: 1, has_more: false, next: null },
  });

  it('exports datetime as the year while preserving pm2_5', () => {
    const { content } = buildDownloadFileContent(yearlyResponse, 'csv');
    const [headers, row = []] = parseDownloadCsvRows(content as string);

    expect(headers).toContain('datetime');
    expect(row[headers.indexOf('datetime')]).toBe('2026');
    expect(row[headers.indexOf('pm2_5')]).toBe('12');
  });

  it('strips internal IDs from the yearly export', () => {
    const { content } = buildDownloadFileContent(yearlyResponse, 'csv');
    const csvText = content as string;

    expect(csvText).not.toContain('site-abc123');
    expect(csvText).not.toContain('site_id');
  });
});

describe('exact column selection', () => {
  const response = asDownloadResponse({
    status: 'success',
    data: [{ site_name: 'Siavonga', pm2_5: 4.46, pm10: 8.1, latitude: -15.3 }],
    metadata: { total_count: 1, has_more: false, next: null },
  });

  it('returns only the configured columns in order', () => {
    const { content } = buildDownloadFileContent(response, 'csv', [
      'pm10',
      'site_name',
    ]);
    const csvText = content as string;

    expect(csvText).toContain('"pm10"');
    expect(csvText).toContain('"site_name"');
    // Unselected columns must not appear as headers.
    expect(csvText).not.toMatch(/"pm2_5"/);
    expect(csvText).not.toMatch(/"latitude"/);
  });

  it('keeps an unavailable configured column as an empty column', () => {
    const { content } = buildDownloadFileContent(response, 'csv', [
      'site_name',
      'nonexistent_column',
    ]);
    const csvText = content as string;
    const lines = csvText.replace(/^\uFEFF/, '').split('\n');

    expect(lines[0]).toContain('nonexistent_column');
    // The missing column renders as an empty quoted cell.
    expect(lines[1]).toContain('""');
  });

  it('expands sensor aliases when the bare key is absent', () => {
    const aliasResponse = asDownloadResponse({
      status: 'success',
      data: [{ s1_pm2_5: 4.46, s2_pm2_5: 4.5 }],
      metadata: { total_count: 1, has_more: false, next: null },
    });
    const { content } = buildDownloadFileContent(aliasResponse, 'csv', [
      'pm2_5',
    ]);
    const csvText = content as string;

    expect(csvText).toContain('s1_pm2_5');
    expect(csvText).toContain('s2_pm2_5');
    // The bare key must not appear as a header when only aliases exist.
    expect(csvText).not.toMatch(/"pm2_5",/);
  });
});

describe('duplicate-header prevention (alias expansion)', () => {
  it('does not emit duplicate headers when a selected bare key and its alias are both selected', () => {
    const aliasResponse = asDownloadResponse({
      status: 'success',
      data: [{ s1_pm2_5: 4.46, s2_pm2_5: 4.5 }],
      metadata: { total_count: 1, has_more: false, next: null },
    });
    // Selecting both the bare key 'pm2_5' (expands to s1/s2) and 's1_pm2_5'
    // directly must not produce a duplicate 's1_pm2_5' header.
    const { content } = buildDownloadFileContent(aliasResponse, 'csv', [
      'pm2_5',
      's1_pm2_5',
    ]);
    const csvText = content as string;
    const headerLine = csvText.replace(/^\uFEFF/, '').split('\n')[0];
    const headers = headerLine.split(',').map(h => h.replace(/^"|"$/g, ''));

    const s1Count = headers.filter(h => h === 's1_pm2_5').length;
    expect(s1Count).toBe(1);
    // Both aliases should be present exactly once, in configured order.
    expect(headers).toEqual(['s1_pm2_5', 's2_pm2_5']);
  });

  it('dedupes a directly-selected alias that appears twice in selection', () => {
    const aliasResponse = asDownloadResponse({
      status: 'success',
      data: [{ s1_pm2_5: 4.46, s2_pm2_5: 4.5 }],
      metadata: { total_count: 1, has_more: false, next: null },
    });
    const { content } = buildDownloadFileContent(aliasResponse, 'csv', [
      's1_pm2_5',
      's1_pm2_5',
    ]);
    const csvText = content as string;
    const headerLine = csvText.replace(/^\uFEFF/, '').split('\n')[0];
    const headers = headerLine.split(',').map(h => h.replace(/^"|"$/g, ''));

    expect(headers.filter(h => h === 's1_pm2_5').length).toBe(1);
    expect(headers).toEqual(['s1_pm2_5']);
  });
});

describe('plain id stripping in file builds', () => {
  it('strips the plain "id" key from CSV and JSON output', () => {
    const responseWithId = asDownloadResponse({
      status: 'success',
      message: 'ok',
      data: [
        {
          id: 'plain-id-value',
          site_id: 'abc123',
          site_name: 'Siavonga',
          pm2_5: 4.46,
        },
      ],
      metadata: { total_count: 1, has_more: false, next: null },
    });

    const { content: csvContent } = buildDownloadFileContent(
      responseWithId,
      'csv'
    );
    expect(csvContent as string).not.toContain('plain-id-value');

    const { content: jsonContent } = buildDownloadFileContent(
      responseWithId,
      'json'
    );
    expect(jsonContent as string).not.toContain('plain-id-value');
  });
});

describe('grid_id / cohort_id stripping in file builds', () => {
  const responseWithGridAndCohortIds = asDownloadResponse({
    status: 'success',
    message: 'ok',
    data: [
      {
        grid_id: '64f1c2e3a4b5c6d7e8f90123',
        cohort_id: 'cohort-abc-789',
        site_name: 'Siavonga',
        country_name: 'Zambia',
        latitude: -16.5,
        pm2_5: 4.46,
      },
    ],
    metadata: { total_count: 1, has_more: false, next: null },
  });

  it('strips grid_id and cohort_id from CSV output', () => {
    const { content } = buildDownloadFileContent(
      responseWithGridAndCohortIds,
      'csv'
    );
    const csvText = content as string;

    expect(csvText).not.toContain('grid_id');
    expect(csvText).not.toContain('cohort_id');
    expect(csvText).not.toContain('64f1c2e3a4b5c6d7e8f90123');
    expect(csvText).not.toContain('cohort-abc-789');
    // Real fields must survive the strip.
    expect(csvText).toContain('site_name');
    expect(csvText).toContain('Siavonga');
    expect(csvText).toContain('country_name');
    expect(csvText).toContain('pm2_5');
  });

  it('strips grid_id and cohort_id from JSON output', () => {
    const { content } = buildDownloadFileContent(
      responseWithGridAndCohortIds,
      'json'
    );
    const jsonText = content as string;
    const parsed = JSON.parse(jsonText) as {
      data?: Array<Record<string, unknown>>;
    };

    expect(jsonText).not.toContain('grid_id');
    expect(jsonText).not.toContain('cohort_id');
    expect(jsonText).not.toContain('64f1c2e3a4b5c6d7e8f90123');
    expect(jsonText).not.toContain('cohort-abc-789');

    const row = parsed.data?.[0];
    expect(row).toBeDefined();
    expect(row).toHaveProperty('site_name', 'Siavonga');
    expect(row).toHaveProperty('country_name', 'Zambia');
    expect(row).toHaveProperty('pm2_5', 4.46);
    expect(row).not.toHaveProperty('grid_id');
    expect(row).not.toHaveProperty('cohort_id');
  });
});

describe('getPdfTableLayout', () => {
  it('uses 8pt/4 padding for up to 8 columns', () => {
    expect(getPdfTableLayout(8)).toEqual({ fontSize: 8, cellPadding: 4 });
    expect(getPdfTableLayout(5)).toEqual({ fontSize: 8, cellPadding: 4 });
  });

  it('uses 7pt/3 padding for 9-11 columns', () => {
    expect(getPdfTableLayout(9)).toEqual({ fontSize: 7, cellPadding: 3 });
    expect(getPdfTableLayout(11)).toEqual({ fontSize: 7, cellPadding: 3 });
  });

  it('uses 6pt/2.5 padding for 12-14 columns', () => {
    expect(getPdfTableLayout(12)).toEqual({ fontSize: 6, cellPadding: 2.5 });
    expect(getPdfTableLayout(14)).toEqual({ fontSize: 6, cellPadding: 2.5 });
  });

  it('uses 5.5pt/2 padding for more than 14 columns', () => {
    expect(getPdfTableLayout(15)).toEqual({ fontSize: 5.5, cellPadding: 2 });
    expect(getPdfTableLayout(20)).toEqual({ fontSize: 5.5, cellPadding: 2 });
  });
});
