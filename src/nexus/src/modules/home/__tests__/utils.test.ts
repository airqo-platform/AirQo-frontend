import type {
  SavedComparison,
  UserChartConfig,
  UserPreference,
} from '@/shared/types/api';
import type { VisualizerWorkspaceDraft } from '@/modules/data-visualizer/types';
import {
  buildContinueItems,
  formatHomeTimestamp,
  getHomeExperienceMode,
  parseDemoMode,
} from '../utils';

describe('home experience utilities', () => {
  it('classifies users with no saved work as new', () => {
    expect(
      getHomeExperienceMode({
        savedLocationCount: 0,
        chartCount: 0,
        comparisonCount: 0,
        hasDraft: false,
      })
    ).toBe('new');
  });

  it('classifies any saved artifact as returning', () => {
    expect(
      getHomeExperienceMode({
        savedLocationCount: 0,
        chartCount: 0,
        comparisonCount: 1,
        hasDraft: false,
      })
    ).toBe('returning');
  });

  it('prioritizes comparison, draft, and saved locations', () => {
    const comparisons = [
      {
        id: 'older',
        name: 'Older comparison',
        site_ids: ['one'],
        updated_at: '2026-01-01T00:00:00.000Z',
      },
      {
        id: 'latest',
        name: 'Latest comparison',
        site_ids: ['one', 'two'],
        updated_at: '2026-02-01T00:00:00.000Z',
      },
    ] as SavedComparison[];
    const draft = {
      savedAt: '2026-01-15T00:00:00.000Z',
      charts: [{ id: 'chart' }],
      datasets: [{ id: 'dataset' }],
    } as VisualizerWorkspaceDraft;
    const preference = {
      lastAccessed: '2026-01-10T00:00:00.000Z',
      selected_sites: [{ _id: 'one' }, { _id: 'two' }],
    } as UserPreference;
    const charts = [{ _id: 'chart-one' }] as UserChartConfig[];

    const items = buildContinueItems({
      comparisons,
      draft,
      preference,
      charts,
      savedLocationCount: 2,
    });

    expect(items).toHaveLength(3);
    expect(items.map(item => item.type)).toEqual([
      'comparison',
      'visualizer-draft',
      'saved-locations',
    ]);
    expect(items[0].title).toBe('Latest comparison');
  });

  it('uses a generic saved charts card without a recency timestamp', () => {
    const items = buildContinueItems({
      comparisons: [],
      draft: null,
      preference: null,
      charts: [{ _id: 'chart-one' }] as UserChartConfig[],
      savedLocationCount: 0,
    });

    expect(items).toHaveLength(1);
    expect(items[0]).toEqual(expect.objectContaining({ type: 'saved-charts' }));
    expect(items[0]).not.toHaveProperty('timestamp');
  });

  it('uses the normalized saved location count instead of selected site objects', () => {
    const items = buildContinueItems({
      comparisons: [],
      draft: null,
      preference: {
        selected_sites: [{ _id: 'one' }],
      } as UserPreference,
      charts: [],
      savedLocationCount: 3,
    });

    expect(items).toHaveLength(1);
    expect(items[0].description).toBe('Review readings for 3 saved locations.');
  });
});

describe('formatHomeTimestamp', () => {
  it('returns null instead of the shared fallbacks for unusable input', () => {
    expect(formatHomeTimestamp(undefined)).toBeNull();
    expect(formatHomeTimestamp(null)).toBeNull();
    expect(formatHomeTimestamp('')).toBeNull();
    expect(formatHomeTimestamp('not-a-date')).toBeNull();
  });

  it('formats a valid timestamp with the shared relative-time helper', () => {
    const formatted = formatHomeTimestamp(new Date().toISOString());

    expect(formatted).toBeTruthy();
    expect(formatted).not.toBe('N/A');
    expect(formatted).not.toBe('Invalid Date');
  });
});

describe('parseDemoMode', () => {
  it('never accepts unknown demo modes', () => {
    expect(parseDemoMode('nonsense')).toBeUndefined();
    expect(parseDemoMode(null)).toBeUndefined();
  });

  it('accepts known modes outside production builds only', () => {
    // process.env.NODE_ENV is typed read-only, so swap through a mutable view.
    const env = process.env as { NODE_ENV?: string };
    const originalNodeEnv = env.NODE_ENV;
    const isProductionBuild = originalNodeEnv === 'production';

    // Jest runs with NODE_ENV=test, so demo states are available here.
    expect(parseDemoMode('returning')).toBe('returning');

    env.NODE_ENV = isProductionBuild ? 'development' : 'production';
    try {
      expect(parseDemoMode('returning')).toBeUndefined();
    } finally {
      env.NODE_ENV = originalNodeEnv;
    }
  });
});
