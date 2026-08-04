import { parseDownloadResponseRecords } from '../dataExportFile';

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
