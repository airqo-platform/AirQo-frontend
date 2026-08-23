import { buildRecentReadingsKey } from '../useRecentReadings';

describe('buildRecentReadingsKey', () => {
  it('scopes the key to the analytics recent-readings namespace with user and group', () => {
    expect(buildRecentReadingsKey('user-1', 'group-1', ['site-1'])).toEqual([
      'analytics',
      'recent-readings',
      'user-1',
      'group-1',
      ['site-1'],
    ]);
  });

  it('sorts site ids so selection order never changes cache identity', () => {
    const keyA = buildRecentReadingsKey('u', 'g', ['b', 'a', 'c']);
    const keyB = buildRecentReadingsKey('u', 'g', ['c', 'b', 'a']);
    expect(keyA).toEqual(keyB);
  });

  it('falls back to anonymous/no-active-group sentinels when ids are missing', () => {
    expect(buildRecentReadingsKey(undefined, undefined, [])).toEqual([
      'analytics',
      'recent-readings',
      'anonymous',
      'no-active-group',
      [],
    ]);
  });

  it('produces different keys for different groups (no cross-group bleed)', () => {
    const groupA = buildRecentReadingsKey('user-1', 'group-a', ['site-1']);
    const groupB = buildRecentReadingsKey('user-1', 'group-b', ['site-1']);
    expect(groupA).not.toEqual(groupB);
  });
});
