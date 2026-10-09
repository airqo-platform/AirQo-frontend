import {
  getSpatialHeatmapCoordinates,
  getSpatialHeatmapCenter,
  getSpatialHeatmapFitBounds,
  getSpatialHeatmapMapboxId,
  normalizeSpatialHeatmaps,
} from '../spatialHeatmaps';

describe('spatial heatmap helpers', () => {
  it('converts documented latitude/longitude bounds to Mapbox image coordinates', () => {
    expect(
      getSpatialHeatmapCoordinates([
        [-1.444, 36.65],
        [-1.163, 37.102],
      ])
    ).toEqual([
      [36.65, -1.163],
      [37.102, -1.163],
      [37.102, -1.444],
      [36.65, -1.444],
    ]);
  });

  it('returns a center point for a heatmap pointer', () => {
    expect(
      getSpatialHeatmapCenter([
        [-1.444, 36.65],
        [-1.163, 37.102],
      ])
    ).toEqual([36.876, -1.3035]);
  });

  it('rejects malformed bounds and non-PNG image data', () => {
    expect(
      getSpatialHeatmapCoordinates([
        [-1, 37],
        [-2, 38],
      ])
    ).toBeNull();

    expect(
      normalizeSpatialHeatmaps([
        {
          bounds: [
            [-1, 37],
            [0, 38],
          ],
          city: 'kampala',
          id: 'grid-1',
          image: 'https://example.com/heatmap.png',
          message: 'generated',
        },
      ])
    ).toEqual([]);
  });

  it('keeps only renderable documented records and creates safe Mapbox ids', () => {
    const heatmap = {
      bounds: [
        [-1, 32],
        [0, 33],
      ],
      city: 'kampala',
      id: 'grid/one',
      image: 'data:image/png;base64,AAAA',
      message: '✅ AQI image generated for kampala',
    };

    expect(normalizeSpatialHeatmaps([heatmap])).toEqual([heatmap]);
    expect(getSpatialHeatmapMapboxId(heatmap.id)).toBe(
      'spatial-heatmap-grid-one'
    );
  });

  it('builds one fit envelope around multiple city heatmaps', () => {
    expect(
      getSpatialHeatmapFitBounds([
        {
          bounds: [
            [-1, 32],
            [0, 33],
          ],
          city: 'kampala',
          id: 'grid-1',
          image: 'data:image/png;base64,AAAA',
          message: 'generated',
        },
        {
          bounds: [
            [-2, 30],
            [-1, 31],
          ],
          city: 'mbarara',
          id: 'grid-2',
          image: 'data:image/png;base64,AAAA',
          message: 'generated',
        },
      ])
    ).toEqual([
      [30, -2],
      [33, 0],
    ]);
  });
});
