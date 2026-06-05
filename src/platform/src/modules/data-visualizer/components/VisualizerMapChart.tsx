'use client';

import React from 'react';
import type { ExpressionSpecification } from 'mapbox-gl';
import { useSelector } from 'react-redux';
import MapboxMap, { Layer, Popup, Source } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import type { UploadedDataRow, VisualizerChartConfig } from '../types';
import { buildMapPoints, type VisualizerMapPoint } from '../utils/geospatial';
import { formatMeasurementLabel } from '../utils/measurementLabels';
import { cn } from '@/shared/lib/utils';
import { selectMapStyle } from '@/shared/store/selectors';
import {
  AIR_QUALITY_COLORS,
  getAirQualityIcon,
  getAirQualityInfo,
  type AirQualityLevel,
  type PollutantType,
} from '@/shared/utils/airQuality';

interface VisualizerMapChartProps {
  rows: UploadedDataRow[];
  config: VisualizerChartConfig;
  className?: string;
}

type FeatureGeometry =
  | { type: 'Point'; coordinates: [number, number] }
  | { type: 'Polygon'; coordinates: Array<Array<[number, number]>> };

type FeatureProperties = {
  id: string;
  label: string;
  value: number | null;
  displayValue: string;
  pointCount?: number;
  dataset?: string;
  aqLevel?: AirQualityLevel;
  aqLabel?: string;
};

type FeatureCollection = {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: FeatureGeometry;
    properties: FeatureProperties;
  }>;
};

const DEFAULT_MAPBOX_STYLE = 'mapbox://styles/mapbox/streets-v12';
const DEFAULT_VIEW = { longitude: 15, latitude: 2, zoom: 1.8 };
const COLOR_SCALE = [
  '#145fff',
  '#22c55e',
  '#eab308',
  '#f97316',
  '#dc2626',
] as const;
const AQI_LEGEND_SAMPLES: Record<PollutantType, number[]> = {
  pm2_5: [3, 12, 20, 30, 60, 120],
  pm10: [10, 30, 60, 100, 200, 400],
};

const formatNumber = (value: number | null) =>
  value === null
    ? 'No value'
    : new Intl.NumberFormat(undefined, {
        maximumFractionDigits: 2,
      }).format(value);

const getPollutantType = (metricColumn: string): PollutantType | null => {
  const normalized = metricColumn.toLowerCase().replace(/[^a-z0-9]/g, '');

  if (normalized.includes('pm25') || normalized.includes('pm2')) {
    return 'pm2_5';
  }

  if (normalized.includes('pm10')) {
    return 'pm10';
  }

  return null;
};

const getMapBounds = (points: VisualizerMapPoint[]) => {
  if (points.length === 0) {
    return null;
  }

  const longitudes = points.map(point => point.longitude);
  const latitudes = points.map(point => point.latitude);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);

  return {
    minLongitude,
    maxLongitude,
    minLatitude,
    maxLatitude,
    centerLongitude: (minLongitude + maxLongitude) / 2,
    centerLatitude: (minLatitude + maxLatitude) / 2,
    span: Math.max(maxLongitude - minLongitude, maxLatitude - minLatitude),
  };
};

const getInitialView = (points: VisualizerMapPoint[]) => {
  const bounds = getMapBounds(points);

  if (!bounds) {
    return DEFAULT_VIEW;
  }

  const zoom =
    bounds.span < 0.03
      ? 12
      : bounds.span < 0.15
        ? 10
        : bounds.span < 0.7
          ? 8
          : bounds.span < 3
            ? 6
            : bounds.span < 15
              ? 4
              : 2;

  return {
    longitude: bounds.centerLongitude,
    latitude: bounds.centerLatitude,
    zoom,
  };
};

const getGridSize = (points: VisualizerMapPoint[]) => {
  const bounds = getMapBounds(points);
  const span = bounds?.span ?? 1;

  if (span < 0.05) return 0.0025;
  if (span < 0.2) return 0.01;
  if (span < 1) return 0.025;
  if (span < 5) return 0.1;
  if (span < 20) return 0.25;
  return 1;
};

const buildPointFeatures = (
  points: VisualizerMapPoint[],
  pollutantType: PollutantType | null
): FeatureCollection => ({
  type: 'FeatureCollection',
  features: points.map(point => {
    const airQualityInfo =
      pollutantType && typeof point.value === 'number'
        ? getAirQualityInfo(point.value, pollutantType)
        : null;

    return {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [point.longitude, point.latitude],
      },
      properties: {
        id: point.id,
        label: point.label,
        value: point.value,
        displayValue: formatNumber(point.value),
        dataset: point.dataset,
        aqLevel: airQualityInfo?.level,
        aqLabel: airQualityInfo?.label,
      },
    };
  }),
});

const buildGridFeatures = (
  points: VisualizerMapPoint[],
  pollutantType: PollutantType | null
): FeatureCollection => {
  const gridSize = getGridSize(points);
  const cells = new Map<
    string,
    { longitude: number; latitude: number; values: number[]; count: number }
  >();

  points.forEach(point => {
    const longitude = Math.floor(point.longitude / gridSize) * gridSize;
    const latitude = Math.floor(point.latitude / gridSize) * gridSize;
    const key = `${longitude}:${latitude}`;
    const cell = cells.get(key) ?? {
      longitude,
      latitude,
      values: [],
      count: 0,
    };

    cell.count += 1;

    if (typeof point.value === 'number') {
      cell.values.push(point.value);
    }

    cells.set(key, cell);
  });

  return {
    type: 'FeatureCollection',
    features: Array.from(cells.values()).map((cell, index) => {
      const value =
        cell.values.length > 0
          ? cell.values.reduce((sum, item) => sum + item, 0) /
            cell.values.length
          : null;
      const airQualityInfo =
        pollutantType && typeof value === 'number'
          ? getAirQualityInfo(value, pollutantType)
          : null;
      const west = cell.longitude;
      const south = cell.latitude;
      const east = west + gridSize;
      const north = south + gridSize;

      return {
        type: 'Feature',
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [west, south],
              [east, south],
              [east, north],
              [west, north],
              [west, south],
            ],
          ],
        },
        properties: {
          id: `grid-${index}`,
          label: `${cell.count.toLocaleString()} record${cell.count === 1 ? '' : 's'}`,
          value,
          displayValue: formatNumber(value),
          pointCount: cell.count,
          aqLevel: airQualityInfo?.level,
          aqLabel: airQualityInfo?.label,
        },
      };
    }),
  };
};

const getValueDomain = (points: VisualizerMapPoint[]) => {
  const values = points
    .map(point => point.value)
    .filter((value): value is number => typeof value === 'number');

  if (values.length === 0) {
    return { min: 0, max: 1 };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);

  return min === max ? { min: Math.max(0, min - 1), max: max + 1 } : { min, max };
};

const buildAqiColorExpression = (): ExpressionSpecification =>
  [
    'match',
    ['get', 'aqLevel'],
    'good',
    AIR_QUALITY_COLORS.good,
    'moderate',
    AIR_QUALITY_COLORS.moderate,
    'unhealthy-sensitive-groups',
    AIR_QUALITY_COLORS['unhealthy-sensitive-groups'],
    'unhealthy',
    AIR_QUALITY_COLORS.unhealthy,
    'very-unhealthy',
    AIR_QUALITY_COLORS['very-unhealthy'],
    'hazardous',
    AIR_QUALITY_COLORS.hazardous,
    AIR_QUALITY_COLORS['no-value'],
  ] as ExpressionSpecification;

const buildContinuousColorExpression = (
  valueDomain: { min: number; max: number }
): ExpressionSpecification =>
  [
    'interpolate',
    ['linear'],
    ['coalesce', ['get', 'value'], valueDomain.min],
    valueDomain.min,
    COLOR_SCALE[0],
    (valueDomain.min + valueDomain.max) / 2,
    COLOR_SCALE[2],
    valueDomain.max,
    COLOR_SCALE[4],
  ] as ExpressionSpecification;

export const VisualizerMapChart: React.FC<VisualizerMapChartProps> = ({
  rows,
  config,
  className,
}) => {
  const [selectedFeature, setSelectedFeature] =
    React.useState<FeatureProperties | null>(null);
  const [selectedCoordinates, setSelectedCoordinates] = React.useState<
    [number, number] | null
  >(null);
  const currentMapStyle = useSelector(selectMapStyle);
  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
  const pollutantType = React.useMemo(
    () => getPollutantType(config.metricColumn),
    [config.metricColumn]
  );
  const points = React.useMemo(() => buildMapPoints(rows, config), [config, rows]);
  const initialViewState = React.useMemo(() => getInitialView(points), [points]);
  const pointCollection = React.useMemo(
    () => buildPointFeatures(points, pollutantType),
    [points, pollutantType]
  );
  const gridCollection = React.useMemo(
    () => buildGridFeatures(points, pollutantType),
    [points, pollutantType]
  );
  const valueDomain = React.useMemo(() => getValueDomain(points), [points]);
  const layerMode = config.mapLayer ?? 'points';
  const metricLabel = formatMeasurementLabel(config.metricColumn);
  const heatmapColors = React.useMemo(
    () =>
      pollutantType
        ? [
            AIR_QUALITY_COLORS.good,
            AIR_QUALITY_COLORS.moderate,
            AIR_QUALITY_COLORS['unhealthy-sensitive-groups'],
            AIR_QUALITY_COLORS.unhealthy,
            AIR_QUALITY_COLORS['very-unhealthy'],
            AIR_QUALITY_COLORS.hazardous,
          ]
        : COLOR_SCALE,
    [pollutantType]
  );
  const averageValue = React.useMemo(() => {
    const values = points
      .map(point => point.value)
      .filter((value): value is number => typeof value === 'number');

    if (values.length === 0) {
      return null;
    }

    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }, [points]);
  const averageAirQualityInfo = React.useMemo(
    () =>
      pollutantType && typeof averageValue === 'number'
        ? getAirQualityInfo(averageValue, pollutantType)
        : null,
    [averageValue, pollutantType]
  );
  const aqiLegendItems = React.useMemo(
    () =>
      pollutantType
        ? AQI_LEGEND_SAMPLES[pollutantType].map(sample =>
            getAirQualityInfo(sample, pollutantType)
          )
        : [],
    [pollutantType]
  );

  if (!config.latitudeColumn || !config.longitudeColumn) {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-center text-muted-foreground">
        <div>
          <p className="text-sm font-medium text-foreground">
            Coordinates needed
          </p>
          <p className="mt-1 text-sm">
            Select latitude and longitude fields to show this map.
          </p>
        </div>
      </div>
    );
  }

  if (points.length === 0) {
    return (
      <div className="flex min-h-[320px] items-center justify-center text-center text-muted-foreground">
        <div>
          <p className="text-sm font-medium text-foreground">No map data</p>
          <p className="mt-1 text-sm">
            The selected coordinate fields do not contain valid locations.
          </p>
        </div>
      </div>
    );
  }

  if (!mapboxAccessToken) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-md bg-muted/40 text-center text-muted-foreground">
        <div className="max-w-md px-4">
          <p className="text-sm font-medium text-foreground">
            Map view unavailable
          </p>
          <p className="mt-1 text-sm">
            Coordinates were detected, but map access is not enabled in this
            environment.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn('relative min-h-[320px] overflow-hidden rounded-md', className)}
      style={{ height: config.height }}
    >
      <MapboxMap
        initialViewState={initialViewState}
        mapboxAccessToken={mapboxAccessToken}
        mapStyle={currentMapStyle || DEFAULT_MAPBOX_STYLE}
        style={{ width: '100%', height: '100%' }}
        attributionControl={false}
        minZoom={0.5}
        maxZoom={18}
        interactiveLayerIds={
          layerMode === 'grid'
            ? ['uploaded-grid-layer']
            : layerMode === 'heatmap'
              ? []
              : ['uploaded-point-layer']
        }
        reuseMaps
        onClick={event => {
          const feature = event.features?.[0];

          if (!feature?.properties) {
            setSelectedFeature(null);
            setSelectedCoordinates(null);
            return;
          }

          const properties = feature.properties as FeatureProperties;
          const geometry = feature.geometry as FeatureGeometry;
          const coordinates =
            geometry.type === 'Point'
              ? geometry.coordinates
              : [event.lngLat.lng, event.lngLat.lat];

          setSelectedFeature(properties);
          setSelectedCoordinates(coordinates as [number, number]);
        }}
      >
        {layerMode === 'grid' ? (
          <Source id="uploaded-grid" type="geojson" data={gridCollection}>
            <Layer
              id="uploaded-grid-layer"
              type="fill"
              paint={{
                'fill-color': pollutantType
                  ? buildAqiColorExpression()
                  : buildContinuousColorExpression(valueDomain),
                'fill-opacity': 0.58,
                'fill-outline-color': '#ffffff',
              }}
            />
          </Source>
        ) : (
          <Source id="uploaded-points" type="geojson" data={pointCollection}>
            {layerMode === 'heatmap' && (
              <Layer
                id="uploaded-heatmap-layer"
                type="heatmap"
                paint={{
                  'heatmap-weight': [
                    'interpolate',
                    ['linear'],
                    ['coalesce', ['get', 'value'], valueDomain.min],
                    valueDomain.min,
                    0.1,
                    valueDomain.max,
                    1,
                  ],
                  'heatmap-intensity': 1.1,
                  'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 2, 10, 12, 28],
                  'heatmap-opacity': 0.72,
                  'heatmap-color': [
                    'interpolate',
                    ['linear'],
                    ['heatmap-density'],
                    0,
                    'rgba(20, 95, 255, 0)',
                    0.25,
                    heatmapColors[0],
                    0.45,
                    heatmapColors[1],
                    0.65,
                    heatmapColors[2],
                    0.85,
                    heatmapColors[3],
                    1,
                    heatmapColors[4],
                  ],
                }}
              />
            )}
            {layerMode !== 'heatmap' && (
              <Layer
                id="uploaded-point-layer"
                type="circle"
                paint={{
                  'circle-radius': ['interpolate', ['linear'], ['zoom'], 2, 4, 12, 9],
                  'circle-color': pollutantType
                    ? buildAqiColorExpression()
                    : buildContinuousColorExpression(valueDomain),
                  'circle-opacity': 0.88,
                  'circle-stroke-color': '#ffffff',
                  'circle-stroke-width': 1.5,
                }}
              />
            )}
          </Source>
        )}

        {selectedFeature && selectedCoordinates && (
          <Popup
            longitude={selectedCoordinates[0]}
            latitude={selectedCoordinates[1]}
            closeButton={false}
            closeOnClick={false}
            anchor="top"
            offset={12}
          >
            <div className="min-w-[170px] text-xs">
              <div className="flex items-center gap-2 font-medium text-foreground">
                {selectedFeature.aqLevel && (() => {
                  const Icon = getAirQualityIcon(selectedFeature.aqLevel);
                  return <Icon className="h-4 w-4" />;
                })()}
                <span>{selectedFeature.label}</span>
              </div>
              <div className="mt-1 text-muted-foreground">
                {metricLabel}: {selectedFeature.displayValue}
              </div>
              {selectedFeature.aqLabel && (
                <div className="text-muted-foreground">
                  Air quality: {selectedFeature.aqLabel}
                </div>
              )}
              {selectedFeature.dataset && (
                <div className="text-muted-foreground">
                  Dataset: {selectedFeature.dataset}
                </div>
              )}
              {selectedFeature.pointCount && (
                <div className="text-muted-foreground">
                  {selectedFeature.pointCount.toLocaleString()} records
                </div>
              )}
            </div>
          </Popup>
        )}
      </MapboxMap>

      <div className="absolute left-3 top-3 rounded-md border border-border bg-card/95 px-3 py-2 text-xs shadow-sm">
        <div className="flex items-center gap-2 font-medium text-foreground">
          {averageAirQualityInfo && (() => {
            const Icon = averageAirQualityInfo.icon;
            return <Icon className="h-4 w-4" />;
          })()}
          <span>{metricLabel}</span>
        </div>
        <div className="mt-0.5 text-muted-foreground">
          {points.length.toLocaleString()} mapped record
          {points.length === 1 ? '' : 's'} / {layerMode}
        </div>
        {averageAirQualityInfo && (
          <div className="mt-1 text-muted-foreground">
            Typical condition: {averageAirQualityInfo.label}
          </div>
        )}
      </div>

      {pollutantType ? (
        <div className="absolute bottom-3 left-3 right-3 rounded-md border border-border bg-card/95 px-3 py-2 text-xs shadow-sm sm:left-auto sm:w-[280px]">
          <div className="mb-2 font-medium text-foreground">AQI guide</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            {aqiLegendItems.map(item => {
              const Icon = item.icon;

              return (
                <div
                  key={item.level}
                  className="flex items-center gap-2 text-muted-foreground"
                >
                  <Icon className="h-4 w-4" />
                  <span className="truncate">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 rounded-md border border-border bg-card/95 px-3 py-2 text-xs shadow-sm sm:right-auto">
          <span>{formatNumber(valueDomain.min)}</span>
          <div className="h-2 w-36 rounded-full bg-gradient-to-r from-[#145fff] via-[#eab308] to-[#dc2626]" />
          <span>{formatNumber(valueDomain.max)}</span>
        </div>
      )}
    </div>
  );
};
