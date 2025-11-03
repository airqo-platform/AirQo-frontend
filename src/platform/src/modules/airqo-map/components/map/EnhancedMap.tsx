'use client';

import React, { useState, useCallback, useRef } from 'react';
import Map, { MapRef, ViewState, Marker } from 'react-map-gl/mapbox';
import { useDispatch, useSelector } from 'react-redux';
import { cn } from '@/shared/lib/utils';
import 'mapbox-gl/dist/mapbox-gl.css';

// Enhanced map component with air quality monitoring features

// Import our custom components
import { MapStyleDialog } from './MapStyleDialog';
import { MapControls } from './MapControls';
import { MapLegend } from './MapLegend';
import { MapNodes } from './MapNodes';
import { MapLoadingOverlay } from './MapLoadingOverlay';
import { CustomTooltip } from './CustomTooltip';

// Import types and data
import type { MapStyle } from './MapStyleDialog';
import type { AirQualityReading, ClusterData } from './MapNodes';
import { dummyAirQualityData } from './dummyData';

// Import air quality utilities
import { getAirQualityLevel } from '@/shared/utils/airQuality';

// Import Redux actions and selectors
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
  const [hoveredNode, setHoveredNode] = useState<
    AirQualityReading | ClusterData | null
  >(null);
  const [isStyleDialogOpen, setIsStyleDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Get map settings from Redux store
  const currentMapStyle = useSelector(selectMapStyle);
  const currentNodeType = useSelector(selectNodeType);

  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  // Cluster threshold - show individual nodes above this zoom level
  const clusterThreshold = 11;
  const shouldShowClusters = (viewState.zoom || 12) < clusterThreshold;

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
    // At zoom 11, cluster points within ~2km
    // At lower zooms, cluster at larger distances
    const baseDistance = 2; // km at zoom 11
    const zoomDiff = clusterThreshold - zoom;
    return baseDistance * Math.pow(2, zoomDiff);
  }, []);

  // Improved clustering logic
  const getClusters = useCallback(() => {
    if (!shouldShowClusters || airQualityData.length === 0) return [];

    const clusters: Array<{
      id: string;
      longitude: number;
      latitude: number;
      pointCount: number;
      readings: AirQualityReading[];
      mostCommonLevel: string;
    }> = [];

    const processed = new Set<string>();
    const clusteringDistance = getClusteringDistance(viewState.zoom || 12);

    airQualityData.forEach(reading => {
      if (processed.has(reading.id)) return;

      const nearby: AirQualityReading[] = [];

      // Find all unprocessed readings within clustering distance
      airQualityData.forEach(other => {
        if (processed.has(other.id) || other.id === reading.id) return;

        const distance = calculateDistance(
          reading.latitude,
          reading.longitude,
          other.latitude,
          other.longitude
        );

        if (distance <= clusteringDistance) {
          nearby.push(other);
        }
      });

      // Create cluster with current reading and nearby readings
      const clusterReadings = [reading, ...nearby];

      // Calculate center point
      const centerLng =
        clusterReadings.reduce((sum, r) => sum + r.longitude, 0) /
        clusterReadings.length;
      const centerLat =
        clusterReadings.reduce((sum, r) => sum + r.latitude, 0) /
        clusterReadings.length;

      // Determine most common air quality level
      const levelCounts: Record<string, number> = {};
      clusterReadings.forEach(r => {
        const level = getAirQualityLevel(r.pm25Value, 'pm2_5');
        levelCounts[level] = (levelCounts[level] || 0) + 1;
      });

      let mostCommonLevel = 'good';
      let maxCount = 0;
      Object.entries(levelCounts).forEach(([level, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mostCommonLevel = level;
        }
      });

      clusters.push({
        id: `cluster-${reading.id}-${Date.now()}`,
        longitude: centerLng,
        latitude: centerLat,
        pointCount: clusterReadings.length,
        readings: clusterReadings,
        mostCommonLevel,
      });

      // Mark all readings in this cluster as processed
      clusterReadings.forEach(r => processed.add(r.id));
    });

    return clusters;
  }, [
    airQualityData,
    shouldShowClusters,
    viewState.zoom,
    calculateDistance,
    getClusteringDistance,
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
          // You can show a toast notification here
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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // In a real app, you'd refetch data from your API
      console.log('Map data refreshed successfully');

      // You could update the airQualityData state here if it's managed locally
      // setAirQualityData(newData);
    } catch (error) {
      console.error('Failed to refresh map data:', error);
      // Handle error - show toast notification
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
        // Zoom into cluster
        mapRef.current?.flyTo({
          center: [cluster.longitude, cluster.latitude],
          zoom: Math.min((viewState.zoom || 12) + 3, 18),
          duration: 1000,
        });
        onClusterClick?.(cluster);
      }
    },
    [handleNodeClick, onClusterClick, viewState.zoom]
  );

  const handleNodeHover = useCallback(
    (data: AirQualityReading | ClusterData | null) => {
      setHoveredNode(data);
    },
    []
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

  const clusters = getClusters();

  return (
    <div className={cn('relative h-full w-full overflow-hidden', className)}>
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
      >
        {/* Render clusters or individual nodes based on zoom level */}
        {shouldShowClusters
          ? clusters.map(cluster => (
              <Marker
                key={cluster.id}
                longitude={cluster.longitude}
                latitude={cluster.latitude}
                anchor="center"
              >
                <MapNodes
                  cluster={cluster}
                  nodeType={currentNodeType}
                  onClick={data => handleClusterClick(data as ClusterData)}
                  onHover={handleNodeHover}
                />
              </Marker>
            ))
          : airQualityData.map(reading => (
              <Marker
                key={reading.id}
                longitude={reading.longitude}
                latitude={reading.latitude}
                anchor="center"
              >
                <MapNodes
                  reading={reading}
                  nodeType={currentNodeType}
                  onClick={data => handleNodeClick(data as AirQualityReading)}
                  onHover={handleNodeHover}
                  isSelected={selectedNode === reading.id}
                  size="md"
                />
              </Marker>
            ))}
      </Map>

      {/* Map Controls */}
      <MapControls
        onGeolocation={handleGeolocation}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onRefreshMap={handleRefreshMap}
        onMapStyleToggle={handleMapStyleToggle}
        isRefreshing={isRefreshing}
      />

      {/* Map Legend */}
      <MapLegend />

      {/* Map Style Dialog */}
      <MapStyleDialog
        isOpen={isStyleDialogOpen}
        onClose={() => setIsStyleDialogOpen(false)}
        onStyleChange={handleStyleChange}
        currentStyle={currentMapStyle}
      />

      {/* Loading Overlay */}
      <MapLoadingOverlay
        isVisible={isRefreshing}
        message="Refreshing air quality data..."
      />

      {/* Hover tooltip */}
      {hoveredNode && (
        <div className="fixed inset-0 pointer-events-none z-50">
          <CustomTooltip data={hoveredNode}>
            <div className="w-0 h-0" />
          </CustomTooltip>
        </div>
      )}
    </div>
  );
};
