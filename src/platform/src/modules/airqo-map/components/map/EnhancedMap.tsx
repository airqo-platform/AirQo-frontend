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
import { toast } from '@/shared/components/ui';

// ─── Constants ────────────────────────────────────────────────────────────────

const MAP_MARKER_Z_INDEX = 20;
/**
 * At or above this zoom, no clusters are formed — every reading renders as
 * its own node. Below it, getClusterParams() decides how aggressively
 * nearby readings are grouped. Chosen so clusters break up naturally
 * before the user is close enough to want to click individual stations.
 */
const CLUSTER_ZOOM_THRESHOLD = 12;
const NODE_DETAIL_ZOOM = 14.5;
/** Debounce delay for clustering recalculation (ms) */
const CLUSTER_DEBOUNCE_MS = 250;
const INITIAL_VIEW_STATE: Partial<ViewState> = {
  longitude: 17.61872846571009,
  latitude: 5.468074924059209,
  zoom: 2.6680390382433803,
};
const RESET_FLY_TO_DURATION_MS = 1000;
const REFRESH_TIMEOUT_MS = 10000;

// ─── Module-level pure helpers ────────────────────────────────────────────────

const isClusterData = (
  item: AirQualityReading | ClusterData
): item is ClusterData => (item as ClusterData).pointCount !== undefined;

/**
 * Build a spatial grid index for O(n) clustering.
 * Pure function — safe to call inside useMemo.
 */
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

/**
 * Returns clustering parameters that shrink as zoom increases.
 * Using integer breakpoints keeps parameter changes discrete, which prevents
 * continuous re-clustering during smooth zoom animations.
 *
 * distanceKm shrinks aggressively with zoom so clusters naturally fragment
 * as the user zooms in. gridSize is always comfortably larger than
 * distanceKm/111 so the spatial index never splits a potential cluster
 * across two cells. minSize stays at 2 so any two readings within range
 * always cluster (avoids the "two lonely markers overlapping" look).
 */
const getClusterParams = (zoom: number) => {
  const z = Math.floor(zoom);
  if (z < 3) return { gridSize: 4.0, distanceKm: 30.0, minSize: 2 };
  if (z < 5) return { gridSize: 3.0, distanceKm: 18.0, minSize: 2 };
  if (z < 7) return { gridSize: 2.0, distanceKm: 9.0, minSize: 2 };
  if (z < 9) return { gridSize: 1.0, distanceKm: 4.5, minSize: 2 };
  if (z < 10) return { gridSize: 0.5, distanceKm: 2.0, minSize: 2 };
  if (z < 11) return { gridSize: 0.2, distanceKm: 1.0, minSize: 2 };
  return { gridSize: 0.1, distanceKm: 0.4, minSize: 2 }; // zoom 11 → <12 (threshold)
};

// ─── Props ────────────────────────────────────────────────────────────────────

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
  selectionContextKey?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export const EnhancedMap: React.FC<EnhancedMapProps> = ({
  className,
  initialViewState = INITIAL_VIEW_STATE,
  airQualityData = [],
  onNodeClick,
  onClusterClick,
  onRefreshData,
  flyToLocation,
  selectedPollutant = 'pm2_5',
  onPollutantChange,
  selectionContextKey,
}) => {
  const dispatch = useDispatch();
  const mapRef = useRef<MapRef>(null);
  /**
   * isMountedRef — guards async setState calls after unmount.
   * Not a state variable so it never causes re-renders.
   */
  const isMountedRef = useRef(true);

  // ── View / interaction state ─────────────────────────────────────────────────
  const [viewState, setViewState] =
    useState<Partial<ViewState>>(initialViewState);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [pinnedTooltipId, setPinnedTooltipId] = useState<string | null>(null);
  const [isStyleDialogOpen, setIsStyleDialogOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const isRefreshingRef = useRef(false);

  /**
   * clusterZoom — debounced and floor-quantised zoom for clustering.
   *
   * WHY floor-quantised:
   *   getClusterParams only changes at integer zoom boundaries, so using
   *   Math.floor(zoom) means the cluster memo only recalculates when we cross
   *   an integer boundary — not on every fractional pixel of smooth scrolling.
   *   This eliminates the cluster "pop/glitch" during zoom animations.
   *
   * WHY debounced (250ms):
   *   Even with quantisation, rapid threshold crossings (e.g. fast pinch zoom)
   *   should be debounced so the expensive O(n²) clustering only runs once the
   *   user has settled at a new zoom level.
   */
  const [clusterZoom, setClusterZoom] = useState(() =>
    Math.floor(viewState.zoom ?? 3)
  );

  const currentMapStyle = useSelector(selectMapStyle);
  const currentNodeType = useSelector(selectNodeType);
  const mapboxAccessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

  // ── Cleanup on unmount ───────────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    setSelectedNodeId(null);
    setHoveredId(null);
    setPinnedTooltipId(null);
  }, [selectionContextKey]);

  // ── Debounced cluster zoom ───────────────────────────────────────────────────

  useEffect(() => {
    const next = Math.floor(viewState.zoom ?? 3);
    // Only schedule a state update if the quantised value actually changed.
    // This prevents unnecessary timer creation during fractional zoom changes
    // within the same integer level.
    if (next === clusterZoom) return;

    const id = setTimeout(() => {
      if (isMountedRef.current) setClusterZoom(next);
    }, CLUSTER_DEBOUNCE_MS);

    return () => clearTimeout(id);
  }, [viewState.zoom, clusterZoom]);

  // ── Fly-to (programmatic) ────────────────────────────────────────────────────

  useEffect(() => {
    if (!flyToLocation || !mapRef.current) return;
    mapRef.current.flyTo({
      center: [flyToLocation.longitude, flyToLocation.latitude],
      zoom: flyToLocation.zoom ?? 14,
      duration: 1000,
      easing: t => t * (2 - t),
    });
  }, [flyToLocation]);

  // ── Clustering ───────────────────────────────────────────────────────────────

  const { clusters, clusterMemberIds } = useMemo(() => {
    if (airQualityData.length === 0) {
      return {
        clusters: [] as ClusterData[],
        clusterMemberIds: new Set<string>(),
      };
    }
    // Use the higher of the debounced clusterZoom and the live viewState.zoom
    // to ensure clusters break up immediately when the user zooms past the
    // threshold, even if the debounce hasn't fired yet. This prevents the
    // "cluster didn't break up after clicking" issue.
    const effectiveZoom = Math.max(
      clusterZoom,
      Math.floor(viewState.zoom ?? 3)
    );
    if (effectiveZoom >= CLUSTER_ZOOM_THRESHOLD) {
      return {
        clusters: [] as ClusterData[],
        clusterMemberIds: new Set<string>(),
      };
    }

    const { gridSize, distanceKm, minSize } = getClusterParams(effectiveZoom);
    const index = buildSpatialIndex(airQualityData, gridSize);

    const result: ClusterData[] = [];
    const memberIds = new Set<string>();
    const processed = new Set<string>();

    for (const cellReadings of Object.values(index)) {
      if (cellReadings.length < minSize) continue;
      const usedInCell = new Set<string>();

      for (const seed of cellReadings) {
        if (processed.has(seed.id) || usedInCell.has(seed.id)) continue;

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

        members.forEach(r => {
          processed.add(r.id);
          memberIds.add(r.id);
        });

        const n = members.length;
        const avgLng = members.reduce((s, r) => s + r.longitude, 0) / n;
        const avgLat = members.reduce((s, r) => s + r.latitude, 0) / n;
        const vals = members
          .map(r => (selectedPollutant === 'pm2_5' ? r.pm25Value : r.pm10Value))
          .filter((v): v is number => v != null && !isNaN(v));
        const avgVal = vals.length
          ? vals.reduce((a, b) => a + b, 0) / vals.length
          : 0;

        result.push({
          id: `cluster-${members
            .map(r => r.id)
            .sort()
            .join('|')}`,
          longitude: avgLng,
          latitude: avgLat,
          pointCount: n,
          readings: members,
          mostCommonLevel: getAirQualityLevel(avgVal, selectedPollutant),
        });
      }
    }

    return { clusters: result, clusterMemberIds: memberIds };
  }, [airQualityData, clusterZoom, viewState.zoom, selectedPollutant]);

  const soloReadings = useMemo(
    () => airQualityData.filter(r => !clusterMemberIds.has(r.id)),
    [airQualityData, clusterMemberIds]
  );

  // ── Map control handlers ──────────────────────────────────────────────────────

  const handleZoomIn = useCallback(
    () => mapRef.current?.zoomIn({ duration: 300 }),
    []
  );
  const handleZoomOut = useCallback(
    () => mapRef.current?.zoomOut({ duration: 300 }),
    []
  );

  const handleGeolocation = useCallback(() => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      pos =>
        mapRef.current?.flyTo({
          center: [pos.coords.longitude, pos.coords.latitude],
          zoom: 14,
          duration: 2000,
        }),
      err => console.error('Geolocation error:', err)
    );
  }, []);

  const handleRefreshMap = useCallback(async () => {
    if (!onRefreshData) {
      toast.error('Refresh not available');
      return;
    }
    if (isRefreshingRef.current) return;

    isRefreshingRef.current = true;
    setIsRefreshing(true);

    // GUARANTEED fallback: force-close the overlay after timeout
    const fallbackTimer = setTimeout(() => {
      console.warn('Refresh fallback timer triggered - forcing overlay close');
      isRefreshingRef.current = false;
      setIsRefreshing(false);
    }, REFRESH_TIMEOUT_MS);

    try {
      await onRefreshData();
      toast.success('Map refreshed');
    } catch (e) {
      // Cancellation/abort errors are expected (e.g. on unmount or cohort
      // switch) — don't surface them as failures per coding guidelines.
      const isAbort =
        (e instanceof Error && e.name === 'AbortError') ||
        (typeof DOMException !== 'undefined' &&
          e instanceof DOMException &&
          e.name === 'AbortError');
      if (isAbort) {
        return;
      }
      console.error('Map refresh error:', e);
      toast.error('Failed to refresh map');
    } finally {
      clearTimeout(fallbackTimer);
      // Force state update even if component might be unmounting
      isRefreshingRef.current = false;
      setIsRefreshing(false);
    }
  }, [onRefreshData]);

  const handleResetView = useCallback(() => {
    mapRef.current?.flyTo({
      center: [INITIAL_VIEW_STATE.longitude!, INITIAL_VIEW_STATE.latitude!],
      zoom: INITIAL_VIEW_STATE.zoom,
      duration: RESET_FLY_TO_DURATION_MS,
      easing: t => t * (2 - t),
    });
  }, []);

  const handleMapStyleToggle = useCallback(
    () => setIsStyleDialogOpen(true),
    []
  );

  const handleStyleChange = useCallback(
    (style: MapStyle) => {
      dispatch(
        setMapSettings({ mapStyle: style.url, nodeType: style.nodeStyle })
      );
      setIsStyleDialogOpen(false);
    },
    [dispatch]
  );

  /** Clear selection when the user clicks empty map canvas */
  const handleMapClick = useCallback(() => {
    setSelectedNodeId(null);
    setPinnedTooltipId(null);
  }, []);

  // ── Node interaction handlers ─────────────────────────────────────────────────

  /**
   * flyToNode — always centres and zooms to the reading.
   * No zoom-level gate: clicking always works regardless of current zoom.
   */
  const flyToNode = useCallback(
    (reading: AirQualityReading) => {
      const currentZoom = viewState.zoom ?? 3;
      const targetZoom = Math.min(
        18,
        Math.max(currentZoom + 2, NODE_DETAIL_ZOOM)
      );
      mapRef.current?.flyTo({
        center: [reading.longitude, reading.latitude],
        zoom: targetZoom,
        duration: 900,
        easing: t => 1 - Math.pow(1 - t, 3),
        padding: { top: 60, bottom: 60, left: 60, right: 60 },
      });
    },
    [viewState.zoom]
  );

  const handleReadingClick = useCallback(
    (reading: AirQualityReading) => {
      setSelectedNodeId(reading.id);
      setPinnedTooltipId(reading.id);
      onNodeClick?.(reading);
      flyToNode(reading);
    },
    [onNodeClick, flyToNode]
  );

  const handleClusterClick = useCallback(
    (cluster: ClusterData) => {
      setPinnedTooltipId(null);

      // Single-member cluster: treat as a reading click
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
      // Always fly to at least CLUSTER_ZOOM_THRESHOLD + 1 so the cluster
      // actually breaks apart into individual nodes on arrival. Tighter
      // clusters zoom in further so their members are comfortably separated
      // and clickable. max() against currentZoom + delta keeps the user from
      // being yanked in from very low zoom levels.
      let targetZoom: number;
      if (maxSpan < 0.001) targetZoom = 16;
      else if (maxSpan < 0.01) targetZoom = 15;
      else if (maxSpan < 0.05) targetZoom = 14;
      else
        targetZoom = Math.max(
          CLUSTER_ZOOM_THRESHOLD + 1,
          currentZoom + 2.5
        );
      targetZoom = Math.min(18, targetZoom);

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

  /**
   * handleHover — updates hovered ID only when it actually changes.
   * Skipping the setState when the value is the same prevents unnecessary
   * re-renders of all markers during rapid mouse movement across the map.
   */
  const handleHover = useCallback(
    (data: AirQualityReading | ClusterData | null) => {
      const nextId = data?.id ?? null;
      setHoveredId(prev => (prev === nextId ? prev : nextId));
    },
    []
  );

  // ── Marker style helpers ──────────────────────────────────────────────────────

  /**
   * Marker wrapper style.
   * CRITICAL: pointerEvents:'none' on the Marker container prevents Mapbox's
   * absolutely-positioned marker div from absorbing clicks that should reach
   * the MapNodes button child instead.
   * The child re-enables pointer events via pointerEvents:'auto' in NODE_BUTTON_STYLE.
   */
  const getMarkerStyle = useCallback(
    (id: string): React.CSSProperties => ({
      zIndex: hoveredId === id ? MAP_MARKER_Z_INDEX + 10 : MAP_MARKER_Z_INDEX,
      pointerEvents: 'none',
    }),
    [hoveredId]
  );

  // ── Guard: no token ───────────────────────────────────────────────────────────

  if (!mapboxAccessToken) {
    return (
      <div
        className={cn(
          'flex items-center justify-center h-full bg-muted rounded-lg',
          className
        )}
      >
        <p className="text-muted-foreground text-center px-4">
          MapBox access token not configured.
          <br />
          <code className="text-xs">NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN</code>
        </p>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className={cn('relative h-full w-full', className)}>
      <MapboxMap
        ref={mapRef}
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapboxAccessToken={mapboxAccessToken}
        style={{ width: '100%', height: '100%' }}
        mapStyle={currentMapStyle}
        minZoom={0.5}
        maxZoom={18}
        attributionControl={false}
        preserveDrawingBuffer={true}
        /**
         * interactiveLayerIds stays empty — all interaction is handled
         * via React Marker event handlers, not Mapbox layer events.
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
        {/* ── Cluster markers ──────────────────────────────────────────────── */}
        {clusters.map(cluster => (
          <Marker
            key={cluster.id}
            longitude={cluster.longitude}
            latitude={cluster.latitude}
            anchor="center"
            style={getMarkerStyle(cluster.id)}
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

        {/* ── Solo (unclustered) reading markers ───────────────────────────── */}
        {soloReadings.map(reading => (
          <Marker
            key={reading.id}
            longitude={reading.longitude}
            latitude={reading.latitude}
            anchor="center"
            style={getMarkerStyle(reading.id)}
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
              zoomLevel={viewState.zoom}
            />
          </Marker>
        ))}
      </MapboxMap>

      {/* ── UI Overlays ──────────────────────────────────────────────────────── */}
      <MapControls
        onGeolocation={handleGeolocation}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onRefreshMap={handleRefreshMap}
        onMapStyleToggle={handleMapStyleToggle}
        isRefreshing={isRefreshing}
        onResetView={handleResetView}
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
        isVisible={isRefreshing}
        message="Refreshing air quality data…"
      />
    </div>
  );
};
