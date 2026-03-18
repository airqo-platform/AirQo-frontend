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

// ─── Constants ────────────────────────────────────────────────────────────────

const MAP_MARKER_Z_INDEX = 20;

// The zoom level above which we stop clustering and show individual nodes
const CLUSTER_ZOOM_THRESHOLD = 14;

// The zoom level we animate to when a user clicks an individual node
const NODE_DETAIL_ZOOM = 14.5;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const isClusterData = (
  item: AirQualityReading | ClusterData
): item is ClusterData =>
  (item as ClusterData).pointCount !== undefined;

// Build a spatial grid index for O(n) clustering, keyed by grid cell
const buildSpatialIndex = (
  data: AirQualityReading[],
  gridSize: number
): Record<string, AirQualityReading[]> => {
  const grid: Record<string, AirQualityReading[]> = {};
  for (const reading of data) {
    const key = `${Math.floor(reading.longitude / gridSize)},${Math.floor(reading.latitude / gridSize)}`;
    (grid[key] ??= []).push(reading);
  }
  return grid;
};

// Grid size and clustering distance both shrink as user zooms in
const getClusterParams = (zoom: number) => {
  if (zoom < 4)  return { gridSize: 4.0, distanceKm: 15.0, minSize: 2 };
  if (zoom < 6)  return { gridSize: 2.0, distanceKm: 8.0,  minSize: 2 };
  if (zoom < 8)  return { gridSize: 1.0, distanceKm: 5.0,  minSize: 2 };
  if (zoom < 10) return { gridSize: 0.5, distanceKm: 3.0,  minSize: 3 };
  if (zoom < 12) return { gridSize: 0.2, distanceKm: 1.5,  minSize: 3 };
  return         { gridSize: 0.1, distanceKm: 0.8,  minSize: 4 };
};

// ─── Component ────────────────────────────────────────────────────────────────

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
  initialViewState = { longitude: 20, latitude: 2, zoom: 3 },
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
  const isMountedRef = useRef(true);

  const [viewState, setViewState] = useState<Partial<ViewState>>(initialViewState);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pinnedTooltipId, setPinnedTooltipId] = useState<string | null>(null);
  const [isStyleDialogOpen, setIsStyleDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Debounced zoom used only for clustering calculations — avoids re-clustering on every pixel pan
  const [clusterZoom, setClusterZoom] = useState(viewState.zoom ?? 3);

  const currentMapStyle = useSelector(selectMapStyle);
  const currentNodeType = useSelector(selectNodeType);
  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  useEffect(() => {
    return () => { isMountedRef.current = false; };
  }, []);

  // Debounce clustering zoom updates at 200ms to avoid expensive re-clustering while panning
  useEffect(() => {
    const id = setTimeout(() => setClusterZoom(viewState.zoom ?? 3), 200);
    return () => clearTimeout(id);
  }, [viewState.zoom]);

  // Fly to programmatically-specified location
  useEffect(() => {
    if (flyToLocation && mapRef.current) {
      mapRef.current.flyTo({
        center: [flyToLocation.longitude, flyToLocation.latitude],
        zoom: flyToLocation.zoom ?? 14,
        duration: 1000,
        easing: t => t * (2 - t),
      });
    }
  }, [flyToLocation]);

  // ─── Clustering ─────────────────────────────────────────────────────────────

  const { clusters, clusterMemberIds } = useMemo(() => {
    if (airQualityData.length === 0) return { clusters: [], clusterMemberIds: new Set<string>() };
    // Above threshold: skip clustering entirely, show all nodes individually
    if (clusterZoom >= CLUSTER_ZOOM_THRESHOLD) {
      return { clusters: [], clusterMemberIds: new Set<string>() };
    }

    const { gridSize, distanceKm, minSize } = getClusterParams(clusterZoom);
    const index = buildSpatialIndex(airQualityData, gridSize);

    const clusters: ClusterData[] = [];
    const clusterMemberIds = new Set<string>();
    const processed = new Set<string>();

    for (const cellReadings of Object.values(index)) {
      if (cellReadings.length < minSize) continue;

      const usedInCell = new Set<string>();

      for (const seed of cellReadings) {
        if (processed.has(seed.id) || usedInCell.has(seed.id)) continue;

        // Collect nearby points within distanceKm using fast-but-approximate distance
        const members: AirQualityReading[] = [seed];
        usedInCell.add(seed.id);

        for (const other of cellReadings) {
          if (processed.has(other.id) || usedInCell.has(other.id)) continue;
          const dLon = (other.longitude - seed.longitude) * 111;
          const dLat = (other.latitude - seed.latitude) * 111;
          if (Math.sqrt(dLon * dLon + dLat * dLat) <= distanceKm) {
            members.push(other);
            usedInCell.add(other.id);
          }
        }

        if (members.length < minSize) continue;

        members.forEach(r => { processed.add(r.id); clusterMemberIds.add(r.id); });

        const avgLng = members.reduce((s, r) => s + r.longitude, 0) / members.length;
        const avgLat = members.reduce((s, r) => s + r.latitude, 0) / members.length;
        const vals = members
          .map(r => (selectedPollutant === 'pm2_5' ? r.pm25Value : r.pm10Value))
          .filter(v => v != null && !isNaN(v));
        const avgVal = vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;

        clusters.push({
          id: `cluster-${members.map(r => r.id).sort().join('|')}`,
          longitude: avgLng,
          latitude: avgLat,
          pointCount: members.length,
          readings: members,
          mostCommonLevel: getAirQualityLevel(avgVal, selectedPollutant),
        });
      }
    }

    return { clusters, clusterMemberIds };
  }, [airQualityData, clusterZoom, selectedPollutant]);

  // Individual readings not part of any cluster
  const soloReadings = useMemo(
    () => airQualityData.filter(r => !clusterMemberIds.has(r.id)),
    [airQualityData, clusterMemberIds]
  );

  // ─── Event Handlers ──────────────────────────────────────────────────────────

  const handleZoomIn  = useCallback(() => mapRef.current?.zoomIn({ duration: 300 }), []);
  const handleZoomOut = useCallback(() => mapRef.current?.zoomOut({ duration: 300 }), []);

  const handleGeolocation = useCallback(() => {
    navigator.geolocation?.getCurrentPosition(
      pos => mapRef.current?.flyTo({ center: [pos.coords.longitude, pos.coords.latitude], zoom: 14, duration: 2000 }),
      err => console.error('Geolocation error:', err)
    );
  }, []);

  const handleRefreshMap = useCallback(async () => {
    if (!onRefreshData) return;
    setIsRefreshing(true);
    try { await onRefreshData(); } catch (e) { console.error('Refresh error:', e); }
    finally { if (isMountedRef.current) setIsRefreshing(false); }
  }, [onRefreshData]);

  const handleMapStyleToggle = useCallback(() => setIsStyleDialogOpen(true), []);

  const handleStyleChange = useCallback(
    (style: MapStyle) => {
      dispatch(setMapSettings({ mapStyle: style.url, nodeType: style.nodeStyle }));
      setIsStyleDialogOpen(false);
    },
    [dispatch]
  );

  const handleMapClick = useCallback(() => {
    setSelectedNodeId(null);
    setPinnedTooltipId(null);
  }, []);

  /**
   * flyToNode — animates gently to a reading's location.
   * We always fly even if already at high zoom so the map centres on the node.
   */
  const flyToNode = useCallback((reading: AirQualityReading) => {
    const currentZoom = viewState.zoom ?? 3;
    const targetZoom = Math.min(18, Math.max(currentZoom + 2, NODE_DETAIL_ZOOM));
    mapRef.current?.flyTo({
      center: [reading.longitude, reading.latitude],
      zoom: targetZoom,
      duration: 900,
      easing: t => 1 - Math.pow(1 - t, 3),
      padding: { top: 60, bottom: 60, left: 60, right: 60 },
    });
  }, [viewState.zoom]);

  /**
   * handleReadingClick — always fires the parent callback AND flies to the node.
   * No zoom-level gate: clicking always works.
   */
  const handleReadingClick = useCallback(
    (reading: AirQualityReading) => {
      setSelectedNodeId(reading.id);
      setPinnedTooltipId(reading.id);
      onNodeClick?.(reading);
      flyToNode(reading);
    },
    [onNodeClick, flyToNode]
  );

  /**
   * handleClusterClick — zooms in to break the cluster apart, then lets the
   * user click individual nodes. Single-node clusters delegate directly.
   */
  const handleClusterClick = useCallback(
    (cluster: ClusterData) => {
      setPinnedTooltipId(null);

      if (cluster.pointCount === 1) {
        handleReadingClick(cluster.readings[0]);
        return;
      }

      const lons = cluster.readings.map(r => r.longitude);
      const lats = cluster.readings.map(r => r.latitude);
      const maxSpan = Math.max(
        Math.max(...lons) - Math.min(...lons),
        Math.max(...lats) - Math.min(...lats)
      );

      const currentZoom = viewState.zoom ?? 3;
      let targetZoom: number;
      if (maxSpan < 0.001)     targetZoom = Math.max(16, currentZoom + 3);
      else if (maxSpan < 0.01) targetZoom = Math.max(14, currentZoom + 2.5);
      else if (maxSpan < 0.1)  targetZoom = Math.max(12, currentZoom + 2);
      else                     targetZoom = Math.max(10, currentZoom + 1.5);
      targetZoom = Math.min(17, targetZoom);

      const centerLon = lons.reduce((a, b) => a + b, 0) / lons.length;
      const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;

      mapRef.current?.flyTo({
        center: [centerLon, centerLat],
        zoom: targetZoom,
        duration: 1000,
        easing: t => 1 - Math.pow(1 - t, 3),
        padding: { top: 50, bottom: 50, left: 50, right: 50 },
      });

      onClusterClick?.(cluster);
    },
    [handleReadingClick, onClusterClick, viewState.zoom]
  );

  const handleNodeClick = useCallback(
    (data: AirQualityReading | ClusterData) => {
      if (isClusterData(data)) handleClusterClick(data);
      else handleReadingClick(data);
    },
    [handleClusterClick, handleReadingClick]
  );

  const handleHover = useCallback(
    (data: AirQualityReading | ClusterData | null) => {
      setHoveredId(data?.id ?? null);
    },
    []
  );

  // ─── Render helpers ──────────────────────────────────────────────────────────

  if (!mapboxAccessToken) {
    return (
      <div className={cn('flex items-center justify-center h-full bg-muted rounded-lg', className)}>
        <p className="text-muted-foreground">
          MapBox access token not configured. Set <code>NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code>.
        </p>
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
        /*
         * interactiveLayerIds stays empty — we handle all interaction via
         * React Marker click handlers, not Mapbox layer events.
         */
        interactiveLayerIds={[]}
        reuseMaps
        projection="mercator"
        pitchWithRotate={false}
        touchZoomRotate={false}
        dragPan
        doubleClickZoom
        onClick={handleMapClick}
      >
        {/* ── Clusters ────────────────────────────────────────────────────── */}
        {clusters.map(cluster => (
          <Marker
            key={cluster.id}
            longitude={cluster.longitude}
            latitude={cluster.latitude}
            anchor="center"
            style={{
              zIndex: hoveredId === cluster.id ? MAP_MARKER_Z_INDEX + 10 : MAP_MARKER_Z_INDEX,
              // Marker must not block its own child's pointer events
              pointerEvents: 'none',
            }}
          >
            <MapNodes
              cluster={cluster}
              nodeType={currentNodeType}
              onClick={handleNodeClick}
              onHover={handleHover}
              isHovered={hoveredId === cluster.id}
              selectedPollutant={selectedPollutant}
              zoomLevel={viewState.zoom}
            />
          </Marker>
        ))}

        {/* ── Individual nodes ─────────────────────────────────────────────── */}
        {soloReadings.map(reading => (
          <Marker
            key={reading.id}
            longitude={reading.longitude}
            latitude={reading.latitude}
            anchor="center"
            style={{
              zIndex: hoveredId === reading.id ? MAP_MARKER_Z_INDEX + 10 : MAP_MARKER_Z_INDEX,
              // Marker must not block its own child's pointer events
              pointerEvents: 'none',
            }}
          >
            <MapNodes
              reading={reading}
              nodeType={currentNodeType}
              onClick={handleNodeClick}
              onHover={handleHover}
              isSelected={selectedNodeId === reading.id}
              isHovered={hoveredId === reading.id}
              size="md"
              selectedPollutant={selectedPollutant}
              isTooltipOpen={pinnedTooltipId === reading.id}
            />
          </Marker>
        ))}
      </MapboxMap>

      {/* ── Controls overlay ────────────────────────────────────────────────── */}
      <MapControls
        onGeolocation={handleGeolocation}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onRefreshMap={handleRefreshMap}
        onMapStyleToggle={handleMapStyleToggle}
        isRefreshing={isRefreshing}
      />

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
        message={isLoading ? 'Loading air quality data…' : 'Refreshing air quality data…'}
      />
    </div>
  );
};
