import type { SpatialHeatmap } from '@/shared/types/api';

/** Mapbox image-source coordinates: top-left, top-right, bottom-right, bottom-left. */
export type MapboxImageCoordinates = [
  [number, number],
  [number, number],
  [number, number],
  [number, number],
];

/** Mapbox bounds: south-west and north-east corners in [lng, lat] order. */
export type MapboxBounds = [[number, number], [number, number]];
export type MapboxPoint = [number, number];

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

const isPngDataUrl = (value: unknown): value is string =>
  typeof value === 'string' && /^data:image\/png;base64,/i.test(value);

/**
 * Convert the API's [[swLat, swLng], [neLat, neLng]] bounds to Mapbox's
 * clockwise image-source coordinates. Invalid bounds are rejected so a bad
 * city response cannot break the whole map render.
 */
export const getSpatialHeatmapCoordinates = (
  bounds: SpatialHeatmap['bounds']
): MapboxImageCoordinates | null => {
  if (
    !Array.isArray(bounds) ||
    bounds.length !== 2 ||
    !Array.isArray(bounds[0]) ||
    !Array.isArray(bounds[1]) ||
    bounds[0].length !== 2 ||
    bounds[1].length !== 2
  ) {
    return null;
  }

  const [swLat, swLng] = bounds[0];
  const [neLat, neLng] = bounds[1];

  if (
    !isFiniteNumber(swLat) ||
    !isFiniteNumber(swLng) ||
    !isFiniteNumber(neLat) ||
    !isFiniteNumber(neLng) ||
    swLat >= neLat ||
    swLng >= neLng ||
    swLat < -90 ||
    neLat > 90 ||
    swLng < -180 ||
    neLng > 180
  ) {
    return null;
  }

  return [
    [swLng, neLat],
    [neLng, neLat],
    [neLng, swLat],
    [swLng, swLat],
  ];
};

/** Return the geographic center of one heatmap for its overview marker. */
export const getSpatialHeatmapCenter = (
  bounds: SpatialHeatmap['bounds']
): MapboxPoint | null => {
  const coordinates = getSpatialHeatmapCoordinates(bounds);
  if (!coordinates) return null;

  const longitudes = coordinates.map(([longitude]) => longitude);
  const latitudes = coordinates.map(([, latitude]) => latitude);

  return [
    (Math.min(...longitudes) + Math.max(...longitudes)) / 2,
    (Math.min(...latitudes) + Math.max(...latitudes)) / 2,
  ];
};

/**
 * Calculate one viewport envelope for all available city heatmaps. This lets
 * the map focus the coverage area instead of leaving city-sized rasters
 * hidden inside a country or continent-level view.
 */
export const getSpatialHeatmapFitBounds = (
  heatmaps: SpatialHeatmap[]
): MapboxBounds | null => {
  const points = heatmaps.flatMap(heatmap => {
    const coordinates = getSpatialHeatmapCoordinates(heatmap.bounds);
    return coordinates ?? [];
  });

  if (points.length === 0) return null;

  const longitudes = points.map(([longitude]) => longitude);
  const latitudes = points.map(([, latitude]) => latitude);

  return [
    [Math.min(...longitudes), Math.min(...latitudes)],
    [Math.max(...longitudes), Math.max(...latitudes)],
  ];
};

const isSpatialHeatmap = (value: unknown): value is SpatialHeatmap => {
  if (!value || typeof value !== 'object') return false;

  const candidate = value as Partial<SpatialHeatmap>;
  return (
    typeof candidate.id === 'string' &&
    candidate.id.length > 0 &&
    typeof candidate.city === 'string' &&
    typeof candidate.message === 'string' &&
    isPngDataUrl(candidate.image) &&
    getSpatialHeatmapCoordinates(
      candidate.bounds as SpatialHeatmap['bounds']
    ) !== null
  );
};

/**
 * Keep only documented, renderable records. The API is external to the map
 * module, so runtime validation protects Mapbox from malformed responses.
 */
export const normalizeSpatialHeatmaps = (payload: unknown): SpatialHeatmap[] =>
  Array.isArray(payload) ? payload.filter(isSpatialHeatmap) : [];

/** Mapbox layer/source IDs cannot safely contain arbitrary API identifiers. */
export const getSpatialHeatmapMapboxId = (id: string): string =>
  `spatial-heatmap-${id.replace(/[^a-zA-Z0-9_-]/g, '-')}`;
