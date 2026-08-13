import {
  applySiteColorPick,
  getDefaultSiteColor,
  materializeSiteColors,
  normalizeColorKey,
  resolveSiteColor,
  toHexInputValue,
} from '../siteColors';
import type { ExplorerChartDraft } from '../chartConfig';

const draft = (
  overrides: Partial<ExplorerChartDraft> = {}
): ExplorerChartDraft => ({
  id: 'c1',
  fieldId: 1,
  title: 'Chart',
  subtitle: '',
  chartType: 'Line',
  pollutant: 'pm2_5',
  frequency: 'daily',
  startDate: '2026-01-01T00:00:00Z',
  endDate: '2026-01-07T23:59:59Z',
  siteIds: ['a', 'b', 'c'],
  color: null,
  locationColors: [],
  referenceStandard: 'WHO',
  showLegend: true,
  showGrid: true,
  showTooltip: true,
  referenceLines: [],
  ...overrides,
});

describe('getDefaultSiteColor', () => {
  it('returns distinct colors for consecutive sites', () => {
    const colors = new Set([0, 1, 2, 3, 4].map(getDefaultSiteColor));
    expect(colors.size).toBe(5);
  });

  it('keeps repeat cycles visually distinct (lightened, not identical)', () => {
    const first = getDefaultSiteColor(0);
    const repeated = getDefaultSiteColor(PRIMARY_CYCLE + 0);
    expect(repeated).toContain('color-mix');
    expect(repeated).not.toBe(first);
  });
});

const PRIMARY_CYCLE = 20;

describe('normalizeColorKey / toHexInputValue', () => {
  it('treats the theme primary var as its hex literal', () => {
    expect(normalizeColorKey('rgb(var(--primary))')).toBe('#145dff');
    expect(normalizeColorKey('#145DFF')).toBe('#145dff');
    expect(normalizeColorKey('hsl(var(--primary))')).toBe('#145dff');
  });

  it('converts rgb() to hex', () => {
    expect(normalizeColorKey('rgb(232, 99, 74)')).toBe('#e8634a');
  });

  it('keeps hex and color-mix strings as-is', () => {
    expect(normalizeColorKey('#E8634A')).toBe('#e8634a');
    const mix = 'color-mix(in srgb, #E8634A 80%, white)';
    expect(normalizeColorKey(mix)).toBe(mix.toLowerCase());
  });

  it('toHexInputValue returns a usable input value', () => {
    expect(toHexInputValue('#E8634A')).toBe('#E8634A');
    expect(toHexInputValue('rgb(232, 99, 74)')).toBe('#e8634a');
    expect(toHexInputValue('rgb(var(--primary))')).toBe('#145dff');
    expect(toHexInputValue('color-mix(in srgb, #E8634A 80%, white)')).toBe(
      '#145DFF'
    );
  });
});

describe('resolveSiteColor', () => {
  it('an explicit pick wins over the theme default', () => {
    const d = draft({
      locationColors: [{ id: 'b', color: '#ff0000' }],
    });
    expect(resolveSiteColor(d, 'b', 1)).toBe('#ff0000');
    expect(resolveSiteColor(d, 'a', 0)).toBe(getDefaultSiteColor(0));
  });

  it('never resolves two sites to the same color (distinct defaults by index)', () => {
    const d = draft();
    const colors = d.siteIds.map((id, index) => resolveSiteColor(d, id, index));
    expect(new Set(colors).size).toBe(colors.length);
  });

  it('ignores the legacy single chart color for unset sites', () => {
    const d = draft({ color: '#d62020' });
    expect(resolveSiteColor(d, 'a', 0)).toBe(getDefaultSiteColor(0));
    expect(resolveSiteColor(d, 'b', 1)).toBe(getDefaultSiteColor(1));
  });
});

describe('materializeSiteColors', () => {
  it('assigns one explicit entry per selected site, all distinct', () => {
    const out = materializeSiteColors(['a', 'b', 'c', 'd'], []);
    expect(out).toHaveLength(4);
    expect(out.map(entry => entry.id)).toEqual(['a', 'b', 'c', 'd']);
    expect(new Set(out.map(entry => entry.color)).size).toBe(4);
  });

  it('keeps explicit picks and resolves the rest to defaults', () => {
    const out = materializeSiteColors(
      ['a', 'b', 'c'],
      [{ id: 'b', color: '#ff0000' }]
    );
    expect(out.find(entry => entry.id === 'b')?.color).toBe('#ff0000');
    expect(out.find(entry => entry.id === 'a')?.color).toBe(
      getDefaultSiteColor(0)
    );
  });

  it('rolls a duplicate pick forward so no two sites share a color', () => {
    // Site b picks the hex of site a's theme-default primary.
    const out = materializeSiteColors(
      ['a', 'b'],
      [{ id: 'b', color: '#145DFF' }]
    );
    const colors = out.map(entry => entry.color);
    expect(colors[1]).not.toBe(colors[0]);
    expect(new Set(colors).size).toBe(2);
  });
});

describe('applySiteColorPick', () => {
  it('adds a pick and removes it when cleared', () => {
    const withPick = applySiteColorPick([], 'a', '#123456');
    expect(withPick).toEqual([{ id: 'a', color: '#123456' }]);
    expect(applySiteColorPick(withPick, 'a', null)).toEqual([]);
  });

  it('swaps colors when the picked color is already in use', () => {
    const current = [
      { id: 'a', color: '#123456' },
      { id: 'b', color: '#654321' },
    ];
    const out = applySiteColorPick(current, 'b', '#123456');
    const colorOfA = out.find(entry => entry.id === 'a')?.color;
    const colorOfB = out.find(entry => entry.id === 'b')?.color;
    expect(colorOfB).toBe('#123456');
    expect(colorOfA).toBe('#654321');
    expect(new Set(out.map(entry => entry.color)).size).toBe(2);
  });

  it('treats the theme primary var and its hex as the same color', () => {
    const current = [
      { id: 'a', color: 'rgb(var(--primary))' },
      { id: 'b', color: '#F5A623' },
    ];
    const out = applySiteColorPick(current, 'b', '#145DFF');
    // b takes the primary; a keeps a distinct color (b's old one).
    expect(out.find(entry => entry.id === 'a')?.color).toBe('#F5A623');
    expect(out.find(entry => entry.id === 'b')?.color).toBe('#145DFF');
    expect(new Set(out.map(entry => entry.color)).size).toBe(2);
  });
});
