'use client';

import React, {
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
} from 'react';
import MapboxMap, { MapRef, ViewState, Marker } from 'react-map-gl/mapbox';
import { useDispatch, useSelector } from 'react-redux';
import { cn } from '@/shared/lib/utils';
import 'mapbox-gl/dist/mapbox-gl.css';

// Enhanced map component with air quality monitoring features
import { MapStyleDialog } from './MapStyleDialog';
import { MapControls } from './MapControls';
import { MapLegend } from './MapLegend';
import { MapNodes } from './MapNodes';
import { MapLoadingOverlay } from './MapLoadingOverlay';
import { PollutantSelector } from './PollutantSelector';
import { getAirQualityLevel } from '@/shared/utils/airQuality';
import type { MapStyle } from './MapStyleDialog';
import type { AirQualityReading, ClusterData } from './MapNodes';
import { setMapSettings } from '@/shared/store/mapSettingsSlice';
import { selectMapStyle, selectNodeType } from '@/shared/store/selectors';
import type { PollutantType } from '@/shared/utils/airQuality';

const getNodeCrowdingDistanceKm = (zoom: number): number => {
  if (zoom >= 14) return 0.15;
  if (zoom >= 12) return 0.35;
  if (zoom >= 10) return 0.8;
  if (zoom >= 8) return 1.5;
  return 2.5;
};

const getApproxDistanceKm = (
  a: AirQualityReading,
  b: AirQualityReading
): number => {
  const avgLatRad = ((a.latitude + b.latitude) / 2) * (Math.PI / 180);
  const lonKm = (a.longitude - b.longitude) * 111.32 * Math.cos(avgLatRad);
  const latKm = (a.latitude - b.latitude) * 110.57;
  return Math.sqrt(lonKm * lonKm + latKm * latKm);
};

const DETAILED_NODE_ZOOM_THRESHOLD = 14.5;
const MAP_MARKER_Z_INDEX = 20;

const isClusterData = (
  item: AirQualityReading | ClusterData
): item is ClusterData => {
  return 'readings' in item && 'pointCount' in item;
};

interface EnhancedMapProps {
  className?: string;
  initialViewState?: Partial<ViewState>;
  airQualityData?: AirQualityReading[];
  onNodeClick?: (reading: AirQualityReading) => void;
  onClusterClick?: (cluster: ClusterData) => void;
  isLoading?: boolean;
  onRefreshData?: () => Promise<void>;
  flyToLocation?: { longitude: number; latitude: number; zoom?: number };
  selectedPollutant?: PollutantType;
  onPollutantChange?: (pollutant: PollutantType) => void;
}

export const EnhancedMap: React.FC<EnhancedMapProps> = ({
  className,
  initialViewState = {
    longitude: 20,
    latitude: 0,
    zoom: 3,
  },
  airQualityData = [],
  onNodeClick,
  onClusterClick,
  isLoading = false,
  onRefreshData,
  flyToLocation,
  selectedPollutant = 'pm2_5',
  onPollutantChange,
}) => {
  const dispatch = useDispatch();
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] =
    useState<Partial<ViewState>>(initialViewState);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isStyleDialogOpen, setIsStyleDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [debouncedZoom, setDebouncedZoom] = useState(viewState.zoom || 12);
  const [hoveredItem, setHoveredItem] = useState<
    AirQualityReading | ClusterData | null
  >(null);
  const [forceTooltipNodeId, setForceTooltipNodeId] = useState<string | null>(
    null
  );
  const isMountedRef = useRef(true);

  const currentMapStyle = useSelector(selectMapStyle);
  const currentNodeType = useSelector(selectNodeType);
  // SECURITY NOTE: Mapbox access token must be client-side accessible
  // because react-map-gl requires it for map initialization and API calls.
  // Token security is managed through Mapbox dashboard restrictions.
  // See docs/MAPBOX_SECURITY.md for security best practices.
  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  const clusterThreshold = 14;

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const currentZoom = viewState.zoom || 12;
    const currentZoomLevel = Math.floor(currentZoom);
    const debouncedZoomLevel = Math.floor(debouncedZoom);

    if (
      Math.abs(currentZoomLevel - debouncedZoomLevel) >= 0.3 ||
      currentZoom >= clusterThreshold !== debouncedZoom >= clusterThreshold
    ) {
      const timeoutId = setTimeout(() => {
        setDebouncedZoom(currentZoom);
      }, 50); // Faster response for better UX
      return () => clearTimeout(timeoutId);
    }
  }, [viewState.zoom, debouncedZoom, clusterThreshold]);

  // Handle programmatic fly-to location
  useEffect(() => {
    if (flyToLocation && mapRef.current) {
      mapRef.current.flyTo({
        center: [flyToLocation.longitude, flyToLocation.latitude],
        zoom: flyToLocation.zoom || 14,
        duration: 1000,
        easing: t => t * (2 - t), // Ease-out quadratic for smooth animation
      });
    }
  }, [flyToLocation]);

  const clusters = useMemo(() => {
    if (airQualityData.length === 0) return [];

    // Aggressive cluster breakup - clusters should disappear at higher zoom levels
    if (debouncedZoom >= 14) {
      return []; // No clustering at high zoom levels
    }

    // PERFORMANCE OPTIMIZATION: Use spatial grid for O(n) clustering instead of O(n²)
    const createSpatialIndex = (
      data: AirQualityReading[],
      gridSize: number
    ) => {
      const grid: { [key: string]: AirQualityReading[] } = {};

      data.forEach(reading => {
        const gridX = Math.floor(reading.longitude / gridSize);
        const gridY = Math.floor(reading.latitude / gridSize);
        const key = `${gridX},${gridY}`;

        if (!grid[key]) grid[key] = [];
        grid[key].push(reading);
      });

      return grid;
    };

    // Adaptive grid size based on zoom level for better performance
    const getGridSize = (zoom: number) => {
      if (zoom < 6) return 2.0; // Large grid cells for low zoom
      if (zoom < 8) return 1.0;
      if (zoom < 10) return 0.5;
      if (zoom < 12) return 0.2;
      return 0.1; // Small grid cells for high zoom
    };

    const gridSize = getGridSize(debouncedZoom);
    const spatialIndex = createSpatialIndex(airQualityData, gridSize);

    const clusters: Array<{
      id: string;
      longitude: number;
      latitude: number;
      pointCount: number;
      readings: AirQualityReading[];
      mostCommonLevel: string;
    }> = [];

    const processed = new Set<string>();
    const minClusterSize = debouncedZoom < 8 ? 2 : debouncedZoom < 10 ? 3 : 4;

    // Process each grid cell efficiently
    Object.values(spatialIndex).forEach(cellReadings => {
      if (cellReadings.length < minClusterSize) return;

      // Check neighboring cells for clustering
      const processedInCell = new Set<string>();

      cellReadings.forEach(reading => {
        if (processed.has(reading.id) || processedInCell.has(reading.id))
          return;

        const cluster: AirQualityReading[] = [reading];
        processedInCell.add(reading.id);

        // Check nearby readings in same and adjacent cells
        cellReadings.forEach(other => {
          if (processed.has(other.id) || processedInCell.has(other.id)) return;

          const distance = Math.sqrt(
            Math.pow((other.longitude - reading.longitude) * 111, 2) +
              Math.pow((other.latitude - reading.latitude) * 111, 2)
          );

          const clusterDistance =
            debouncedZoom < 6
              ? 8.0
              : debouncedZoom < 8
                ? 5.0
                : debouncedZoom < 10
                  ? 3.0
                  : debouncedZoom < 12
                    ? 1.5
                    : 0.8;

          if (distance <= clusterDistance) {
            cluster.push(other);
            processedInCell.add(other.id);
          }
        });

        if (cluster.length >= minClusterSize) {
          cluster.forEach(r => processed.add(r.id));

          const avgLng =
            cluster.reduce((sum, r) => sum + r.longitude, 0) / cluster.length;
          const avgLat =
            cluster.reduce((sum, r) => sum + r.latitude, 0) / cluster.length;

          const pollutantValues = cluster
            .map(r =>
              selectedPollutant === 'pm2_5' ? r.pm25Value : r.pm10Value
            )
            .filter(v => v !== undefined && !isNaN(v));
          const avgValue =
            pollutantValues.length > 0
              ? pollutantValues.reduce((sum, v) => sum + v, 0) /
                pollutantValues.length
              : 0;

          const clusterId = cluster
            .map(r => r.id)
            .sort()
            .join('|');

          clusters.push({
            id: `cluster-${clusterId}`,
            longitude: avgLng,
            latitude: avgLat,
            pointCount: cluster.length,
            readings: cluster,
            mostCommonLevel: getAirQualityLevel(avgValue, selectedPollutant),
          });
        }
      });
    });

    return clusters;
  }, [airQualityData, debouncedZoom, selectedPollutant]);

  const clusterMemberIds = useMemo(() => {
    const ids = new Set<string>();
    clusters.forEach(cluster => {
      cluster.readings.forEach(reading => ids.add(reading.id));
    });
    return ids;
  }, [clusters]);

  const nonClusteredReadings = useMemo(
    () => airQualityData.filter(reading => !clusterMemberIds.has(reading.id)),
    [airQualityData, clusterMemberIds]
  );

  const crowdedNodeIds = useMemo(() => {
    const crowdedIds = new Set<string>();
    const crowdingDistanceKm = getNodeCrowdingDistanceKm(debouncedZoom);

    for (let i = 0; i < nonClusteredReadings.length; i += 1) {
      for (let j = i + 1; j < nonClusteredReadings.length; j += 1) {
        const distanceKm = getApproxDistanceKm(
          nonClusteredReadings[i],
          nonClusteredReadings[j]
        );

        if (distanceKm <= crowdingDistanceKm) {
          crowdedIds.add(nonClusteredReadings[i].id);
          crowdedIds.add(nonClusteredReadings[j].id);
        }
      }
    }

    return crowdedIds;
  }, [debouncedZoom, nonClusteredReadings]);

  const nonHoveredClusters = useMemo(
    () => clusters.filter(cluster => hoveredItem?.id !== cluster.id),
    [clusters, hoveredItem?.id]
  );

  const nonHoveredReadings = useMemo(
    () => nonClusteredReadings.filter(reading => hoveredItem?.id !== reading.id),
    [nonClusteredReadings, hoveredItem?.id]
  );

  const hasCrowdedNodes = crowdedNodeIds.size > 0;

  // Map control handlers
  const handleGeolocation = useCallback(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { longitude, latitude } = position.coords;
          mapRef.current?.flyTo({
            center: [longitude, latitude],
            zoom: 14,
            duration: 2000,
          });
        },
        error => {
          console.error('Geolocation error:', error);
        }
      );
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    mapRef.current?.zoomIn({ duration: 300 });
  }, []);

  const handleZoomOut = useCallback(() => {
    mapRef.current?.zoomOut({ duration: 300 });
  }, []);

  const handleRefreshMap = useCallback(async () => {
    if (!onRefreshData) return;

    setIsRefreshing(true);

    try {
      await onRefreshData();
      console.log('Map data refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh map data:', error);
    } finally {
      if (isMountedRef.current) {
        setIsRefreshing(false);
      }
    }
  }, [onRefreshData]);

  const handleMapStyleToggle = useCallback(() => {
    setIsStyleDialogOpen(true);
  }, []);

  const handleStyleChange = useCallback(
    (style: MapStyle) => {
      dispatch(
        setMapSettings({
          mapStyle: style.url,
          nodeType: style.nodeStyle,
        })
      );
      setIsStyleDialogOpen(false);
    },
    [dispatch]
  );

  const handleNodeClick = useCallback(
    (reading: AirQualityReading) => {
      setSelectedNode(reading.id);
      setHoveredItem(reading);
      setForceTooltipNodeId(reading.id);
      onNodeClick?.(reading);
    },
    [onNodeClick]
  );

  const handleReadingClick = useCallback(
    (reading: AirQualityReading) => {
      const currentZoom = viewState.zoom || 10;
      const shouldZoomForDetail = currentZoom < DETAILED_NODE_ZOOM_THRESHOLD;

      handleNodeClick(reading);

      if (shouldZoomForDetail) {
        const targetZoom = Math.min(
          16,
          Math.max(currentZoom + 1.2, DETAILED_NODE_ZOOM_THRESHOLD)
        );

        mapRef.current?.flyTo({
          center: [reading.longitude, reading.latitude],
          zoom: targetZoom,
          duration: 900,
          easing: t => 1 - Math.pow(1 - t, 3),
          padding: { top: 40, bottom: 40, left: 40, right: 40 },
        });
      }
    },
    [handleNodeClick, viewState.zoom]
  );

  const handleHover = useCallback(
    (item: AirQualityReading | ClusterData | null) => {
      if (item && forceTooltipNodeId && item.id !== forceTooltipNodeId) {
        setForceTooltipNodeId(null);
      }
      setHoveredItem(item);
    },
    [forceTooltipNodeId]
  );

  const handleClusterClick = useCallback(
    (cluster: {
      id: string;
      longitude: number;
      latitude: number;
      pointCount: number;
      readings: AirQualityReading[];
    }) => {
      setForceTooltipNodeId(null);

      if (cluster.pointCount === 1) {
        handleReadingClick(cluster.readings[0]);
        return;
      }

      const currentZoom = viewState.zoom || 10;

      // GRADUAL ZOOM STRATEGY - More reasonable zoom levels
      let targetZoom = Math.max(12, currentZoom + 1.5); // Start with moderate zoom increase

      // Calculate spread of cluster points
      const lons = cluster.readings.map(r => r.longitude);
      const lats = cluster.readings.map(r => r.latitude);
      const lonSpan = Math.max(...lons) - Math.min(...lons);
      const latSpan = Math.max(...lats) - Math.min(...lats);
      const maxSpan = Math.max(lonSpan, latSpan);

      // Adjust zoom based on cluster spread - more gradual
      if (maxSpan < 0.001) {
        targetZoom = Math.max(14, currentZoom + 2); // Very tight clusters
      } else if (maxSpan < 0.01) {
        targetZoom = Math.max(13, currentZoom + 1.5); // Moderate clusters
      } else if (maxSpan < 0.1) {
        targetZoom = Math.max(12, currentZoom + 1); // Spread out clusters
      }

      // Cap at reasonable max zoom to prevent excessive zoom
      targetZoom = Math.min(16, targetZoom);

      // Calculate center point of cluster
      const centerLon = lons.reduce((sum, lon) => sum + lon, 0) / lons.length;
      const centerLat = lats.reduce((sum, lat) => sum + lat, 0) / lats.length;

      // Smooth flyTo animation with enhanced easing for better UX
      mapRef.current?.flyTo({
        center: [centerLon, centerLat],
        zoom: targetZoom,
        duration: 1200, // Increased duration for smoother animation
        easing: t => {
          // Custom ease-out cubic for very smooth animation
          return 1 - Math.pow(1 - t, 3);
        },
        // Add padding to ensure cluster is fully visible
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      onClusterClick?.(cluster);
    },
    [handleReadingClick, onClusterClick, viewState.zoom]
  );

  const renderClusterMarker = useCallback(
    (cluster: ClusterData, hovered = false) => (
      <Marker
        key={`${cluster.id}-${hovered ? 'hovered' : 'base'}`}
        longitude={cluster.longitude}
        latitude={cluster.latitude}
        anchor="center"
        style={{ zIndex: MAP_MARKER_Z_INDEX, cursor: 'pointer' }}
      >
        <MapNodes
          cluster={cluster}
          nodeType={currentNodeType}
          onClick={data => handleClusterClick(data as ClusterData)}
          onHover={handleHover}
          isHovered={hovered}
          selectedPollutant={selectedPollutant}
          zoomLevel={debouncedZoom}
        />
      </Marker>
    ),
    [
      currentNodeType,
      debouncedZoom,
      handleClusterClick,
      handleHover,
      selectedPollutant,
    ]
  );

  const renderReadingMarker = useCallback(
    (reading: AirQualityReading, hovered = false) => {
      return (
        <Marker
          key={`${reading.id}-${hovered ? 'hovered' : 'base'}`}
          longitude={reading.longitude}
          latitude={reading.latitude}
          anchor="center"
          style={{ zIndex: MAP_MARKER_Z_INDEX, cursor: 'pointer' }}
        >
          <MapNodes
            reading={reading}
            nodeType={currentNodeType}
            onClick={data => handleReadingClick(data as AirQualityReading)}
            onHover={handleHover}
            isSelected={selectedNode === reading.id}
            isHovered={hovered}
            size="md"
            selectedPollutant={selectedPollutant}
            showZoomHint={crowdedNodeIds.has(reading.id)}
            isTooltipOpen={forceTooltipNodeId === reading.id}
          />
        </Marker>
      );
    },
    [
      crowdedNodeIds,
      currentNodeType,
      handleHover,
      handleReadingClick,
      forceTooltipNodeId,
      selectedNode,
      selectedPollutant,
    ]
  );

  if (!mapboxAccessToken) {
    return (
      <div
        className={cn(
          'flex items-center justify-center h-full bg-muted rounded-lg',
          className
        )}
      >
        <div className="text-center">
          <p className="text-muted-foreground">
            MapBox access token not configured
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Please set NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN in your environment
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('relative h-full w-full', className)}>
      <MapboxMap
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapboxAccessToken={mapboxAccessToken}
        style={{ width: '100%', height: '100%' }}
        mapStyle={currentMapStyle}
        attributionControl={false}
        interactiveLayerIds={[]}
        reuseMaps={true}
        projection="mercator"
        pitchWithRotate={false}
        touchZoomRotate={false}
        dragPan={true}
        doubleClickZoom={true}
        onClick={e => {
          if (!e.features || e.features.length === 0) {
            setSelectedNode(null);
            setHoveredItem(null);
            setForceTooltipNodeId(null);
          }
        }}
      >
        {/* Render nodes and clusters based on zoom level and proximity */}
        <>
          {nonHoveredClusters.map(cluster => renderClusterMarker(cluster))}
          {nonHoveredReadings.map(reading => renderReadingMarker(reading))}

          {/* Render hovered item last to keep hit-testing predictable */}
          {hoveredItem &&
            (isClusterData(hoveredItem)
              ? renderClusterMarker(hoveredItem, true)
              : renderReadingMarker(hoveredItem, true))}
        </>
      </MapboxMap>

      <MapControls
        onGeolocation={handleGeolocation}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onRefreshMap={handleRefreshMap}
        onMapStyleToggle={handleMapStyleToggle}
        isRefreshing={isRefreshing}
      />

      {hasCrowdedNodes &&
        (viewState.zoom || 10) < DETAILED_NODE_ZOOM_THRESHOLD && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-3">
            <div className="rounded-lg border border-amber-200 bg-amber-50/95 backdrop-blur-sm px-3 py-2 shadow-sm">
              <div className="flex items-center gap-3">
                <p className="text-xs md:text-sm text-amber-900 font-medium">
                  Some nodes are too close at this zoom. Zoom in to view exact
                  node details.
                </p>
                <button
                  type="button"
                  onClick={handleZoomIn}
                  className="text-xs md:text-sm text-primary font-semibold hover:underline whitespace-nowrap"
                >
                  Zoom in
                </button>
              </div>
            </div>
          </div>
        )}

      <div className="hidden md:block">
        <MapLegend pollutant={selectedPollutant} />
      </div>

      {onPollutantChange && (
        <div className="absolute top-4 left-4 z-20">
          <PollutantSelector
            selectedPollutant={selectedPollutant}
            onPollutantChange={onPollutantChange}
          />
        </div>
      )}

      <MapStyleDialog
        isOpen={isStyleDialogOpen}
        onClose={() => setIsStyleDialogOpen(false)}
        onStyleChange={handleStyleChange}
        currentStyle={currentMapStyle}
      />

      <MapLoadingOverlay
        isVisible={isLoading || isRefreshing}
        message={
          isLoading
            ? 'Loading air quality data...'
            : 'Refreshing air quality data...'
        }
      />
    </div>
  );
};
