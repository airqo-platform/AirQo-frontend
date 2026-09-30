import type {
  SavedComparison,
  UserChartConfig,
  UserPreference,
} from '@/shared/types/api';
import type { VisualizerWorkspaceDraft } from '@/modules/data-visualizer/types';
import { buildContinueItems, getHomeExperienceMode } from '../utils';

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
    });

    expect(items).toHaveLength(1);
    expect(items[0]).toEqual(expect.objectContaining({ type: 'saved-charts' }));
    expect(items[0]).not.toHaveProperty('timestamp');
  });
});
