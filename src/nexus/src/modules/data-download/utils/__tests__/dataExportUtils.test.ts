import { processSitesData } from '../dataExportUtils';

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
