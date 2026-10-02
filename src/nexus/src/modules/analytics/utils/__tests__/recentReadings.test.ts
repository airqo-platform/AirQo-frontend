import type { RecentReading } from '@/shared/types/api';
import {
  selectLatestRecentReading,
  selectLatestRecentReadingsBySiteId,
} from '../recentReadings';

const makeReading = (overrides: Partial<RecentReading> = {}) =>
  ({
    site_id: 'site-1',
    time: '2026-10-02T12:00:00.000Z',
    is_reading_primary: false,
    aqi_index: 42,
    ...overrides,
  }) as RecentReading;

describe('recent readings selection', () => {
  it('selects the newest API reading for each site without changing its AQI', () => {
    const older = makeReading({
      time: '2026-10-02T10:00:00.000Z',
      aqi_index: 72,
    });
    const latest = makeReading({
      time: '2026-10-02T12:00:00.000Z',
      aqi_index: 49,
    });

    const readingsBySite = selectLatestRecentReadingsBySiteId([latest, older]);

    expect(readingsBySite.get('site-1')).toBe(latest);
    expect(readingsBySite.get('site-1')?.aqi_index).toBe(49);
  });

  it('prefers the primary API reading only when timestamps are tied', () => {
    const secondary = makeReading({ aqi_index: 49 });
    const primary = makeReading({
      aqi_index: 72,
      is_reading_primary: true,
    });

    expect(selectLatestRecentReading([secondary, primary], 'site-1')).toBe(
      primary
    );
  });

  it('ignores entries without a site id and preserves distinct sites', () => {
    const firstSite = makeReading({ site_id: 'site-1' });
    const secondSite = makeReading({ site_id: 'site-2' });
    const missingSite = makeReading({ site_id: '  ' });

    const readingsBySite = selectLatestRecentReadingsBySiteId([
      firstSite,
      secondSite,
      missingSite,
    ]);

    expect(Array.from(readingsBySite.keys())).toEqual(['site-1', 'site-2']);
  });
});
