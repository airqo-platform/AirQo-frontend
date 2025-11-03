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
import { getAirQualityLevel } from '@/shared/utils/airQuality';
import type { MapStyle } from './MapStyleDialog';
import type { AirQualityReading, ClusterData } from './MapNodes';
import { setMapSettings } from '@/shared/store/mapSettingsSlice';
import { selectMapStyle, selectNodeType } from '@/shared/store/selectors';
import { DEFAULT_POLLUTANT } from '@/modules/airqo-map/utils/dataNormalization';

interface EnhancedMapProps {
  className?: string;
  initialViewState?: Partial<ViewState>;
  airQualityData?: AirQualityReading[];
  onNodeClick?: (reading: AirQualityReading) => void;
  onClusterClick?: (cluster: ClusterData) => void;
  isLoading?: boolean;
  onRefreshData?: () => Promise<void>;
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
}) => {
  const dispatch = useDispatch();
  const mapRef = useRef<MapRef>(null);
  const [viewState, setViewState] =
    useState<Partial<ViewState>>(initialViewState);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isStyleDialogOpen, setIsStyleDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [debouncedZoom, setDebouncedZoom] = useState(viewState.zoom || 12);

  const currentMapStyle = useSelector(selectMapStyle);
  const currentNodeType = useSelector(selectNodeType);
  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  const clusterThreshold = 14;

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

  const clusters = useMemo(() => {
    if (airQualityData.length === 0) return [];

    // Aggressive cluster breakup - clusters should disappear at higher zoom levels
    if (debouncedZoom >= 14) {
      return []; // No clustering at high zoom levels
    }

    const clusters: Array<{
      id: string;
      longitude: number;
      latitude: number;
      pointCount: number;
      readings: AirQualityReading[];
      mostCommonLevel: string;
    }> = [];

    const processed = new Set<string>();

    // Much more aggressive distance reduction based on zoom
    const getClusterDistance = (zoom: number) => {
      if (zoom < 6) return 8.0; // Very low zoom - large clusters
      if (zoom < 8) return 5.0; // Low zoom
      if (zoom < 10) return 3.0; // Medium zoom
      if (zoom < 12) return 1.5; // Higher zoom - smaller clusters
      if (zoom < 14) return 0.8; // Very high zoom - tiny clusters
      return 0; // No clustering above zoom 14
    };

    const clusterDistance = getClusterDistance(debouncedZoom);

    // Minimum nodes required for a cluster - more aggressive
    const getMinClusterSize = (zoom: number) => {
      if (zoom < 8) return 2; // Allow small clusters at low zoom
      if (zoom < 10) return 3; // Medium clusters
      if (zoom < 12) return 4; // Larger clusters required
      return 5; // High threshold for high zoom
    };

    const minClusterSize = getMinClusterSize(debouncedZoom);

    airQualityData.forEach((reading, index) => {
      if (processed.has(reading.id)) return;

      const nearby = airQualityData.filter((other, otherIndex) => {
        if (otherIndex <= index || processed.has(other.id)) return false;

        const distance = Math.sqrt(
          Math.pow((other.longitude - reading.longitude) * 111, 2) +
            Math.pow((other.latitude - reading.latitude) * 111, 2)
        );
        return distance <= clusterDistance;
      });

      if (nearby.length >= minClusterSize - 1) {
        const allReadings = [reading, ...nearby];
        allReadings.forEach(r => processed.add(r.id));

        const avgLng =
          allReadings.reduce((sum, r) => sum + r.longitude, 0) /
          allReadings.length;
        const avgLat =
          allReadings.reduce((sum, r) => sum + r.latitude, 0) /
          allReadings.length;

        const pm25Values = allReadings
          .map(r => r.pm25Value)
          .filter(v => !isNaN(v));
        const avgPm25 =
          pm25Values.reduce((sum, val) => sum + val, 0) / pm25Values.length;
        const mostCommonLevel = getAirQualityLevel(avgPm25, 'pm2_5');

        clusters.push({
          id: `cluster-${reading.id}-${index}`,
          longitude: avgLng,
          latitude: avgLat,
          pointCount: allReadings.length,
          readings: allReadings,
          mostCommonLevel,
        });
      }
    });

    return clusters;
  }, [airQualityData, debouncedZoom]);

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
      setIsRefreshing(false);
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
        return;
      }

      const currentZoom = viewState.zoom || 10;

      // AGGRESSIVE ZOOM STRATEGY
      // Always zoom to at least level 14 to ensure cluster breakup
      let targetZoom = Math.max(14, currentZoom + 2);

      // For very close points, zoom even higher
      const lons = cluster.readings.map(r => r.longitude);
      const lats = cluster.readings.map(r => r.latitude);
      const lonSpan = Math.max(...lons) - Math.min(...lons);
      const latSpan = Math.max(...lats) - Math.min(...lats);

      if (lonSpan < 0.001 && latSpan < 0.001) {
        targetZoom = Math.max(16, currentZoom + 4); // Very tight clusters
      } else if (lonSpan < 0.01 && latSpan < 0.01) {
        targetZoom = Math.max(15, currentZoom + 3); // Moderate clusters
      }

      // Cap at reasonable max zoom
      targetZoom = Math.min(18, targetZoom);

      // Calculate center point of cluster
      const centerLon = lons.reduce((sum, lon) => sum + lon, 0) / lons.length;
      const centerLat = lats.reduce((sum, lat) => sum + lat, 0) / lats.length;

      // Use flyTo instead of fitBounds for more predictable zoom behavior
      mapRef.current?.flyTo({
        center: [centerLon, centerLat],
        zoom: targetZoom,
        duration: 1200,
      });

      onClusterClick?.(cluster);
    },
    [handleNodeClick, onClusterClick, viewState.zoom]
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
        reuseMaps={true}
        projection="mercator"
        pitchWithRotate={false}
        touchZoomRotate={false}
        dragPan={true}
        doubleClickZoom={true}
        onClick={e => {
          if (!e.features || e.features.length === 0) {
            setSelectedNode(null);
          }
        }}
      >
        {/* Render nodes and clusters based on zoom level and proximity */}
        <>
          {/* Show clusters - always render for clickability, but style differently based on zoom */}
          {clusters.map(cluster => (
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
                selectedPollutant={DEFAULT_POLLUTANT}
                zoomLevel={debouncedZoom}
              />
            </Marker>
          ))}

          {/* Show individual nodes that are not part of any cluster */}
          {/* Render non-primary readings first (lower z-index) */}
          {airQualityData
            .filter(reading => {
              return (
                !clusters.some(cluster =>
                  cluster.readings.some(
                    clusterReading => clusterReading.id === reading.id
                  )
                ) && reading.isPrimary === false
              );
            })
            .map(reading => (
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
                  isSelected={selectedNode === reading.id}
                  size="md"
                  selectedPollutant={DEFAULT_POLLUTANT}
                />
              </Marker>
            ))}

          {/* Render primary readings last (higher z-index) */}
          {airQualityData
            .filter(reading => {
              return (
                !clusters.some(cluster =>
                  cluster.readings.some(
                    clusterReading => clusterReading.id === reading.id
                  )
                ) && reading.isPrimary !== false
              );
            })
            .map(reading => (
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
                  isSelected={selectedNode === reading.id}
                  size="md"
                  selectedPollutant={DEFAULT_POLLUTANT}
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

      <MapLegend pollutant={DEFAULT_POLLUTANT} />

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
