'use client';

import React, {
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
} from 'react';
import Map, { MapRef, ViewState, Marker } from 'react-map-gl/mapbox';
import { useDispatch, useSelector } from 'react-redux';
import { cn } from '@/shared/lib/utils';
import 'mapbox-gl/dist/mapbox-gl.css';

// Enhanced map component with air quality monitoring features
import { MapStyleDialog } from './MapStyleDialog';
import { MapControls } from './MapControls';
import { MapLegend } from './MapLegend';
import { MapNodes } from './MapNodes';
import { MapLoadingOverlay } from './MapLoadingOverlay';
import type { MapStyle } from './MapStyleDialog';
import type { AirQualityReading, ClusterData } from './MapNodes';
import { dummyAirQualityData } from './dummyData';
import { getAirQualityLevel } from '@/shared/utils/airQuality';
import { setMapSettings } from '@/shared/store/mapSettingsSlice';
import { selectMapStyle, selectNodeType } from '@/shared/store/selectors';

interface EnhancedMapProps {
  className?: string;
  initialViewState?: Partial<ViewState>;
  airQualityData?: AirQualityReading[];
  onNodeClick?: (reading: AirQualityReading) => void;
  onClusterClick?: (cluster: ClusterData) => void;
}

export const EnhancedMap: React.FC<EnhancedMapProps> = ({
  className,
  initialViewState = {
    longitude: 32.5825,
    latitude: 0.3476,
    zoom: 12,
  },
  airQualityData = dummyAirQualityData,
  onNodeClick,
  onClusterClick,
}) => {
  const dispatch = useDispatch();
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] =
    useState<Partial<ViewState>>(initialViewState);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isStyleDialogOpen, setIsStyleDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [debouncedZoom, setDebouncedZoom] = useState(viewState.zoom || 12);

  // Debounce zoom changes to prevent excessive clustering recalculations
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedZoom(viewState.zoom || 12);
    }, 150);
    return () => clearTimeout(timeoutId);
  }, [viewState.zoom]);

  const currentMapStyle = useSelector(selectMapStyle);
  const currentNodeType = useSelector(selectNodeType);
  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  const clusterThreshold = 9;

  // Create spatial grid for faster neighbor lookups (performance optimization)
  const spatialGrid = useMemo(() => {
    const grid: Record<string, AirQualityReading[]> = {};
    const cellSize = 0.1; // Degrees (~11km at equator)

    airQualityData.forEach(reading => {
      const cellX = Math.floor(reading.longitude / cellSize);
      const cellY = Math.floor(reading.latitude / cellSize);
      const key = `${cellX},${cellY}`;

      if (!grid[key]) {
        grid[key] = [];
      }
      grid[key].push(reading);
    });

    return grid;
  }, [airQualityData]);

  // Utility function to calculate distance between two points in kilometers
  const calculateDistance = useCallback(
    (lat1: number, lng1: number, lat2: number, lng2: number): number => {
      const R = 6371; // Earth's radius in kilometers
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLng = ((lng2 - lng1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLng / 2) *
          Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    },
    []
  );

  // Get clustering distance based on zoom level (in kilometers)
  const getClusteringDistance = useCallback((zoom: number): number => {
    if (zoom >= clusterThreshold) return 0;

    // Exponential decay for more natural clustering
    const scale = Math.pow(2, clusterThreshold - zoom);
    const baseDistance = 0.5 * scale; // 0.5km at zoom 9, doubles for each zoom level down

    return Math.max(baseDistance, 0.3); // Minimum 300m clustering
  }, []);

  // Improved clustering logic with density-based approach for stable clusters
  const clusters = useMemo(() => {
    if (airQualityData.length === 0) return [];

    const clusteringDistance = getClusteringDistance(debouncedZoom);

    // No clustering at high zoom
    if (clusteringDistance === 0) return [];

    const clusterList: Array<{
      id: string;
      longitude: number;
      latitude: number;
      pointCount: number;
      readings: AirQualityReading[];
      mostCommonLevel: string;
    }> = [];

    const processed = new Set<string>();

    // Calculate density for each point (number of neighbors within clustering distance)
    const readingsWithDensity = airQualityData.map(reading => {
      // Use spatial grid to find nearby cells for faster lookup
      const cellX = Math.floor(reading.longitude / 0.1);
      const cellY = Math.floor(reading.latitude / 0.1);
      let neighborCount = 0;

      // Check neighboring cells (3x3 grid around current cell)
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const key = `${cellX + dx},${cellY + dy}`;
          const cellReadings = spatialGrid[key] || [];

          cellReadings.forEach(other => {
            if (other.id === reading.id) return;
            const distance = calculateDistance(
              reading.latitude,
              reading.longitude,
              other.latitude,
              other.longitude
            );
            if (distance <= clusteringDistance) {
              neighborCount++;
            }
          });
        }
      }

      return { reading, density: neighborCount };
    });

    // Process highest density points first for better clustering stability
    readingsWithDensity
      .sort((a, b) => b.density - a.density)
      .forEach(({ reading }) => {
        if (processed.has(reading.id)) return;

        // Find all unprocessed points within clustering distance
        const nearbyPoints = airQualityData.filter(other => {
          if (processed.has(other.id) || other.id === reading.id) return false;

          const distance = calculateDistance(
            reading.latitude,
            reading.longitude,
            other.latitude,
            other.longitude
          );

          return distance <= clusteringDistance;
        });

        // Create cluster if we have at least 2 nearby points (3+ total for meaningful clusters)
        if (nearbyPoints.length >= 2) {
          const clusterReadings = [reading, ...nearbyPoints];

          // Calculate centroid with equal weighting for smoother positioning
          let totalWeight = 0;
          let weightedLng = 0;
          let weightedLat = 0;

          clusterReadings.forEach(r => {
            const weight = 1; // Equal weighting for simplicity and stability
            totalWeight += weight;
            weightedLng += r.longitude * weight;
            weightedLat += r.latitude * weight;
          });

          const centerLng = weightedLng / totalWeight;
          const centerLat = weightedLat / totalWeight;

          // Determine most severe air quality level (prioritize worse conditions)
          const levelSeverity: Record<string, number> = {
            good: 0,
            moderate: 1,
            'unhealthy-sensitive': 2,
            unhealthy: 3,
            'very-unhealthy': 4,
            hazardous: 5,
          };

          let mostSevereLevel = 'good';
          let maxSeverity = -1;

          clusterReadings.forEach(r => {
            const level = getAirQualityLevel(r.pm25Value, 'pm2_5');
            const severity = levelSeverity[level] ?? 0;
            if (severity > maxSeverity) {
              maxSeverity = severity;
              mostSevereLevel = level;
            }
          });

          // Create stable cluster ID based on sorted member IDs for consistent rendering
          const stableId = clusterReadings
            .map(r => r.id)
            .sort()
            .join('-');

          clusterList.push({
            id: `cluster-${stableId}`,
            longitude: centerLng,
            latitude: centerLat,
            pointCount: clusterReadings.length,
            readings: clusterReadings,
            mostCommonLevel: mostSevereLevel,
          });

          // Mark all readings in this cluster as processed
          clusterReadings.forEach(r => processed.add(r.id));
        } else {
          // Mark isolated point as processed
          processed.add(reading.id);
        }
      });

    return clusterList;
  }, [
    airQualityData,
    debouncedZoom,
    calculateDistance,
    getClusteringDistance,
    spatialGrid,
  ]);

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
    setIsRefreshing(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('Map data refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh map data:', error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

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
      onNodeClick?.(reading);
    },
    [onNodeClick]
  );

  const handleClusterClick = useCallback(
    (cluster: {
      id: string;
      longitude: number;
      latitude: number;
      pointCount: number;
      readings: AirQualityReading[];
    }) => {
      if (cluster.pointCount === 1) {
        handleNodeClick(cluster.readings[0]);
      } else {
        // Calculate optimal zoom to show cluster members
        const targetZoom = Math.min(clusterThreshold + 1, 18);

        mapRef.current?.flyTo({
          center: [cluster.longitude, cluster.latitude],
          zoom: targetZoom,
          duration: 1000,
        });
        onClusterClick?.(cluster);
      }
    },
    [handleNodeClick, onClusterClick, clusterThreshold]
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
      <Map
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapboxAccessToken={mapboxAccessToken}
        style={{ width: '100%', height: '100%' }}
        mapStyle={currentMapStyle}
        attributionControl={false}
        interactiveLayerIds={[]}
        reuseMaps
        projection="mercator"
        pitchWithRotate={false}
        touchZoomRotate={false}
      >
        {/* Render nodes and clusters based on zoom level and proximity */}
        <>
          {/* Show clusters when they exist (at lower zoom levels) */}
          {clusters.map(cluster => (
            <Marker
              key={`cluster-${cluster.id}`}
              longitude={cluster.longitude}
              latitude={cluster.latitude}
              anchor="center"
              style={{ zIndex: 1000 }}
            >
              <MapNodes
                cluster={cluster}
                nodeType={currentNodeType}
                onClick={data => handleClusterClick(data as ClusterData)}
              />
            </Marker>
          ))}

          {/* Show individual nodes that are not part of any cluster */}
          {airQualityData
            .filter(reading => {
              // Check if this reading is part of any cluster
              const isInCluster = clusters.some(cluster =>
                cluster.readings.some(
                  clusterReading => clusterReading.id === reading.id
                )
              );
              return !isInCluster;
            })
            .map(reading => (
              <Marker
                key={`node-${reading.id}`}
                longitude={reading.longitude}
                latitude={reading.latitude}
                anchor="center"
                style={{ zIndex: 1000 }}
              >
                <MapNodes
                  reading={reading}
                  nodeType={currentNodeType}
                  onClick={data => handleNodeClick(data as AirQualityReading)}
                  isSelected={selectedNode === reading.id}
                  size="lg"
                />
              </Marker>
            ))}
        </>
      </Map>

      <MapControls
        onGeolocation={handleGeolocation}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onRefreshMap={handleRefreshMap}
        onMapStyleToggle={handleMapStyleToggle}
        isRefreshing={isRefreshing}
      />

      <MapLegend />

      <MapStyleDialog
        isOpen={isStyleDialogOpen}
        onClose={() => setIsStyleDialogOpen(false)}
        onStyleChange={handleStyleChange}
        currentStyle={currentMapStyle}
      />

      <MapLoadingOverlay
        isVisible={isRefreshing}
        message="Refreshing air quality data..."
      />
    </div>
  );
};
