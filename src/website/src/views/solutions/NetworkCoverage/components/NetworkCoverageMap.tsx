'use client';

/* eslint-disable simple-import-sort/imports */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FiMinus, FiPlus, FiCamera } from 'react-icons/fi';
import html2canvas from 'html2canvas';
import toast, { Toaster } from 'react-hot-toast';

import {
  africanIso2Codes,
  type MonitorType,
  type NetworkCoverageCountry,
  type NetworkCoverageMonitor,
  type ViewMode,
} from '../networkCoverageTypes';

interface NetworkCoverageMapProps {
  countries: NetworkCoverageCountry[];
  selectedCountryId: string | null;
  selectedMonitorId: string | null;
  viewMode: ViewMode;
  mapStyle: string;
  onCountrySelectByIso: (iso2: string) => void;
  onMonitorSelect: (
    monitorId: string,
    countryId: string,
    fromMap?: boolean,
  ) => void;
  onResetView: () => void;
  flyToMonitorId?: string | null;
  onRegisterSnapshot?: (fn: (() => Promise<string | null>) | null) => void;
}

type MarkerResource = {
  marker: any;
  element: HTMLButtonElement;
  handleClick: () => void;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
};

// AFRICA bounding box was removed — map is not locked to Africa by default.

const bucketColor = (count: number): string => {
  if (count === 0) return '#ECEFF4';
  if (count <= 9) return '#FFE7A3';
  if (count <= 49) return '#FFC95D';
  if (count <= 199) return '#F39C4A';
  if (count <= 999) return '#D65A31';
  return '#8A2D14';
};

const escapeHtml = (value: string): string =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');

const formatNetworkName = (value?: string | null) => {
  if (!value || !value.trim()) return '--';
  const trimmed = value.trim();
  if (trimmed.toLowerCase() === 'airqo') return 'AirQo';
  return trimmed;
};

const monitorTypeLabel: Record<MonitorType, string> = {
  Reference: 'Reference Monitor',
  LCS: 'Low-Cost Sensor (LCS)',
  Inactive: 'Inactive',
};

const monitorTypeStyles: Record<
  MonitorType,
  { bg: string; text: string; dot: string }
> = {
  Reference: {
    bg: 'rgba(16, 185, 129, 0.10)',
    text: '#047857',
    dot: '#10B981',
  },
  LCS: {
    bg: 'rgba(37, 99, 235, 0.10)',
    text: '#1D4ED8',
    dot: '#2563EB',
  },
  Inactive: {
    bg: 'rgba(148, 163, 184, 0.16)',
    text: '#475569',
    dot: '#94A3B8',
  },
};

const statusStyles: Record<
  'active' | 'inactive',
  { bg: string; text: string; dot: string }
> = {
  active: {
    bg: 'rgba(34, 197, 94, 0.12)',
    text: '#15803D',
    dot: '#22C55E',
  },
  inactive: {
    bg: 'rgba(148, 163, 184, 0.16)',
    text: '#64748B',
    dot: '#94A3B8',
  },
};

const buildPill = (
  label: string,
  color: { bg: string; text: string; dot: string },
) => `
  <span style="display:inline-flex;align-items:center;gap:6px;border-radius:9999px;background:${color.bg};color:${color.text};padding:5px 9px;font-size:11px;font-weight:700;line-height:1.1;white-space:nowrap;">
    <span style="width:6px;height:6px;border-radius:9999px;background:${color.dot};flex-shrink:0;"></span>
    ${escapeHtml(label)}
  </span>
`;

const buildMonitorTooltipMarkup = (monitor: NetworkCoverageMonitor) => {
  const typeColor = monitorTypeStyles[monitor.type];
  const statusColor = statusStyles[monitor.status];
  const latitudeText =
    typeof monitor.latitude === 'number' && Number.isFinite(monitor.latitude)
      ? `${Math.abs(monitor.latitude).toFixed(4)}°${monitor.latitude < 0 ? 'S' : 'N'}`
      : '--';
  const longitudeText =
    typeof monitor.longitude === 'number' && Number.isFinite(monitor.longitude)
      ? `${Math.abs(monitor.longitude).toFixed(4)}°${monitor.longitude < 0 ? 'W' : 'E'}`
      : '--';

  return `
    <div style="width:auto;max-width:min(72vw,520px);min-width:0;box-sizing:border-box;overflow-wrap:anywhere;word-break:break-word;white-space:normal;">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;">
        <div style="min-width:0;flex:1;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
            <span style="flex-shrink:0;width:8px;height:8px;border-radius:9999px;background:#2563EB;"></span>
            <span style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#64748B;">Monitor</span>
          </div>
          <div style="font-size:16px;font-weight:800;line-height:1.28;color:#0F172A;word-break:break-word;overflow-wrap:anywhere;white-space:normal;">
            ${escapeHtml(monitor.name)}
          </div>
          <div style="margin-top:6px;font-size:13px;line-height:1.45;color:#64748B;word-break:break-word;overflow-wrap:anywhere;white-space:normal;">
            ${escapeHtml(monitor.operator || '--')} · ${escapeHtml(monitor.city)}, ${escapeHtml(monitor.country)}
          </div>
        </div>
      </div>

      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px;max-width:100%;">
        ${buildPill(monitorTypeLabel[monitor.type], typeColor)}
        ${buildPill(monitor.status === 'active' ? 'Active' : 'Inactive', statusColor)}
      </div>

      <div style="margin-top:12px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 12px;padding-top:12px;border-top:1px solid rgba(148,163,184,0.18);font-size:12px;line-height:1.45;">
          <div style="min-width:0;">
          <div style="color:#94A3B8;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;font-size:10px;">Source</div>
          <div style="margin-top:2px;color:#334155;font-weight:600;word-break:break-word;overflow-wrap:anywhere;white-space:normal;">${escapeHtml(formatNetworkName(monitor.network))}</div>
        </div>
        <div style="min-width:0;">
          <div style="color:#94A3B8;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;font-size:10px;">Coordinates</div>
          <div style="margin-top:2px;color:#334155;font-weight:600;word-break:break-word;overflow-wrap:anywhere;white-space:normal;">${latitudeText}<br />${longitudeText}</div>
        </div>
      </div>
    </div>
  `;
};

const buildCoverageTooltipMarkup = (name: string, count: number) => `
  <div style="min-width:0;max-width:min(60vw,420px);overflow-wrap:anywhere;word-break:break-word;white-space:normal;">
    <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;">
      <div style="min-width:0;flex:1;">
        <div style="font-size:14px;font-weight:800;line-height:1.25;color:#F8FAFC;word-break:break-word;overflow-wrap:anywhere;">${escapeHtml(name)}</div>
        <div style="margin-top:4px;font-size:12px;line-height:1.4;color:rgba(248,250,252,0.78);">${count} monitor${count === 1 ? '' : 's'} registered</div>
      </div>
      <span style="flex-shrink:0;border-radius:9999px;background:rgba(255,255,255,0.14);padding:4px 8px;font-size:11px;font-weight:700;color:#FFFFFF;white-space:nowrap;">${count}</span>
    </div>
  </div>
`;

const monitorNodeMarkup = (
  isOnline: boolean,
  ringColor: string,
  _count: number,
  _selected: boolean,
) => {
  void _count; // referenced to satisfy linter
  void _selected; // referenced to satisfy linter

  return `
    <div style="position:relative;">
      <span style="display:grid;place-items:center;height:28px;width:28px;border-radius:9999px;border:2px solid ${ringColor};background:#ffffff;">
        <span style="width:10px;height:10px;border-radius:9999px;background:${ringColor};display:block;"></span>
      </span>
    </div>`;
};

const NetworkCoverageMap: React.FC<NetworkCoverageMapProps> = ({
  countries,
  selectedCountryId,
  selectedMonitorId,
  viewMode,
  mapStyle,
  onCountrySelectByIso,
  onMonitorSelect,
  onResetView,
  flyToMonitorId,
  onRegisterSnapshot,
}) => {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const coverageClickHandlerRef = useRef<((event: any) => void) | null>(null);
  const coverageMouseMoveHandlerRef = useRef<((event: any) => void) | null>(
    null,
  );
  const coverageMouseEnterHandlerRef = useRef<(() => void) | null>(null);
  const coverageMouseLeaveHandlerRef = useRef<(() => void) | null>(null);
  const coveragePopupRef = useRef<any>(null);
  const monitorPopupRef = useRef<any>(null);
  const markersRef = useRef<MarkerResource[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInitError, setMapInitError] = useState<string | null>(null);

  // Stable refs so that changing prop identity on every parent render does
  // not cause heavyweight effects (marker rebuild, handler swap) to re-run.
  const onMonitorSelectRef = useRef(onMonitorSelect);
  const onCountrySelectByIsoRef = useRef(onCountrySelectByIso);
  // Track that we've applied the user's requested initial view so that
  // subsequent effects (like selected-country fitBounds) don't override it
  // on first render.
  const hasAppliedInitialViewRef = useRef(false);
  const allMonitorsRef = useRef<typeof allMonitors>([]);
  // Keep refs up-to-date without triggering re-renders.
  onMonitorSelectRef.current = onMonitorSelect;
  onCountrySelectByIsoRef.current = onCountrySelectByIso;

  const countryById = useMemo(() => {
    const result: Record<string, NetworkCoverageCountry> = {};
    countries.forEach((country) => {
      result[country.id] = country;
    });
    return result;
  }, [countries]);

  const countryByIso2 = useMemo(() => {
    const result: Record<string, NetworkCoverageCountry> = {};
    countries.forEach((country) => {
      result[country.iso2] = country;
    });
    return result;
  }, [countries]);

  const monitorCountByIso2 = useMemo(() => {
    const result: Record<string, number> = {};
    countries.forEach((country) => {
      result[country.iso2] = country.monitors.length;
    });
    return result;
  }, [countries]);

  const allMonitors = useMemo(
    () => countries.flatMap((country) => country.monitors),
    [countries],
  );
  // Keep allMonitorsRef in sync so flyTo can read the latest value without
  // needing allMonitors in the flyTo effect dependency array.
  allMonitorsRef.current = allMonitors;

  const selectedCountry = selectedCountryId
    ? countryById[selectedCountryId]
    : null;

  const visibleMonitors = useMemo(() => {
    return allMonitors;
  }, [allMonitors]);

  // Render each monitor as its own node (no clustering).
  const groupedNodes = useMemo(() => {
    return visibleMonitors
      .filter(
        (monitor) =>
          typeof monitor.latitude === 'number' &&
          typeof monitor.longitude === 'number' &&
          Number.isFinite(monitor.latitude) &&
          Number.isFinite(monitor.longitude),
      )
      .map((monitor) => ({
        monitors: [monitor],
        latitude: monitor.latitude,
        longitude: monitor.longitude,
        type: monitor.type,
      }));
  }, [visibleMonitors]);

  const clearMarkers = () => {
    markersRef.current.forEach((resource) => {
      resource.element.removeEventListener('click', resource.handleClick);
      resource.element.removeEventListener(
        'mouseenter',
        resource.handleMouseEnter,
      );
      resource.element.removeEventListener(
        'mouseleave',
        resource.handleMouseLeave,
      );
      resource.marker.remove();
    });
    markersRef.current = [];
    monitorPopupRef.current?.remove();
  };

  useEffect(() => {
    if (typeof window === 'undefined' || mapRef.current) {
      return;
    }

    if (!(window as any).mapboxgl) {
      setMapInitError(
        'Map library is not available. Mapbox script failed to load.',
      );
      return;
    }

    const mapboxgl = (window as any).mapboxgl;

    if (typeof mapboxgl?.supported === 'function' && !mapboxgl.supported()) {
      setMapInitError(
        'This browser does not support the required map features. Please update your browser.',
      );
      return;
    }

    let mapInstance: any;
    try {
      mapInstance = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: mapStyle,
        // Use pre-calculated Africa center so the map starts at the correct
        // position without a fitBounds animation on load (eliminates jump).
        center: [15.751726790157534, 1.5627232057281049] as [number, number],
        zoom: 2.914761576947509,
        // Start the map focused on the user's requested Africa view.
        projection: 'mercator',
        minZoom: 1.7,
        maxZoom: 13,
        // Required for canvas.toDataURL() snapshot to return actual pixels
        // instead of a blank/empty image (WebGL clears buffer by default).
        preserveDrawingBuffer: true,
        attributionControl: true,
        customAttribution: ['Powered by <a href="/" rel="noopener">AirQo</a>'],
      });
      setMapInitError(null);
    } catch {
      setMapInitError(
        'Map failed to initialize on this device. Please refresh or try a different browser.',
      );
      return;
    }

    mapRef.current = mapInstance;

    mapRef.current.on('load', () => {
      const map = mapRef.current;

      // Ensure the map is constrained to AFRICA_BOUNDS and start at the
      // exact center/zoom requested by the user.
      try {
        map.jumpTo({
          center: [15.751726790157534, 1.5627232057281049],
          zoom: 2.914761576947509,
        });
        // Mark that we've applied the initial view so other effects know.
        hasAppliedInitialViewRef.current = true;
      } catch {
        // ignore jump errors
      }

      // Initial position is also set via center/zoom in the constructor as fallback.
      map.addSource('africa-country-boundaries', {
        type: 'vector',
        url: 'mapbox://mapbox.country-boundaries-v1',
        promoteId: 'iso_3166_1',
      });

      map.addLayer({
        id: 'africa-country-fill',
        type: 'fill',
        source: 'africa-country-boundaries',
        'source-layer': 'country_boundaries',
        filter: [
          'all',
          ['==', ['get', 'disputed'], 'false'],
          [
            'any',
            ['==', ['get', 'worldview'], 'all'],
            ['in', 'US', ['get', 'worldview']],
          ],
          ['in', ['get', 'iso_3166_1'], ['literal', africanIso2Codes]],
        ],
        paint: {
          'fill-color': '#E8ECF3',
          'fill-opacity': 0.35,
        },
      });

      map.addLayer({
        id: 'africa-country-outline',
        type: 'line',
        source: 'africa-country-boundaries',
        'source-layer': 'country_boundaries',
        filter: [
          'all',
          ['==', ['get', 'disputed'], 'false'],
          [
            'any',
            ['==', ['get', 'worldview'], 'all'],
            ['in', 'US', ['get', 'worldview']],
          ],
          ['in', ['get', 'iso_3166_1'], ['literal', africanIso2Codes]],
        ],
        paint: {
          'line-color': '#D4DBE5',
          'line-width': 0.9,
        },
      });

      map.addLayer({
        id: 'africa-country-selected-outline',
        type: 'line',
        source: 'africa-country-boundaries',
        'source-layer': 'country_boundaries',
        filter: ['==', ['get', 'iso_3166_1'], '__none__'],
        paint: {
          'line-color': '#145DFF',
          'line-width': 2,
        },
      });

      setMapLoaded(true);
    });

    mapRef.current.on('zoomend', () => {
      // zoom end handler (no-op logging removed)
    });

    mapRef.current.on('moveend', () => {
      // move end handler (no-op logging removed)
    });

    return () => {
      if (coverageClickHandlerRef.current && mapRef.current) {
        mapRef.current.off(
          'click',
          'africa-country-fill',
          coverageClickHandlerRef.current,
        );
      }
      clearMarkers();
      coveragePopupRef.current?.remove();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        setMapLoaded(false);
      }
    };
  }, [mapStyle]);

  // Expose a snapshot getter to the parent PDF generator.
  const captureSnapshot = async (): Promise<string | null> => {
    try {
      if (!mapContainerRef.current) return null;

      await new Promise((resolve) => window.requestAnimationFrame(resolve));

      const deviceScale = window.devicePixelRatio || 1;
      // Use a conservative cap for snapshot scale to avoid extremely large canvases
      // on high-DPI devices. Limit to 2x to keep memory usage reasonable.
      const captureScale = Math.min(deviceScale, 2);

      const canvas = await html2canvas(mapContainerRef.current, {
        backgroundColor: null,
        useCORS: true,
        allowTaint: true,
        scale: captureScale,
        logging: false,
      });

      return canvas.toDataURL('image/png');
    } catch (err: any) {
      console.error('Snapshot capture failed', err);
      try {
        toast.error(
          'Failed to capture map snapshot: ' +
            (err?.message || 'Unknown error'),
        );
      } catch {}
      return null;
    }
  };

  // Expose a snapshot getter to the parent PDF generator.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!onRegisterSnapshot) return;

    onRegisterSnapshot(captureSnapshot);
    return () => onRegisterSnapshot(null);
  }, [onRegisterSnapshot, mapLoaded]);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) {
      return;
    }

    // When switching to coverage view, reset to default Africa overview
    if (viewMode === 'coverage') {
      try {
        mapRef.current?.flyTo({
          center: [15.751726790157534, 1.5627232057281049],
          zoom: 2.914761576947509,
          duration: 650,
        });
      } catch {
        // ignore
      }
    }

    const map = mapRef.current;

    // Build a safe 'match' expression only when we have at least one ISO->color pair.
    const isoColorPairs = countries
      .map((country) => ({
        iso: country.iso2,
        color: bucketColor(country.monitors.length),
      }))
      .filter((p) => typeof p.iso === 'string' && p.iso.trim() !== '');

    if (isoColorPairs.length > 0) {
      const expression: any[] = ['match', ['get', 'iso_3166_1']];
      isoColorPairs.forEach((p) => {
        expression.push(p.iso, p.color);
      });
      // default color
      expression.push('#E8ECF3');
      map.setPaintProperty('africa-country-fill', 'fill-color', expression);
    } else {
      // If no countries available, set a static default color to avoid an invalid expression
      map.setPaintProperty('africa-country-fill', 'fill-color', '#E8ECF3');
    }

    map.setPaintProperty(
      'africa-country-fill',
      'fill-opacity',
      viewMode === 'coverage' ? 0.55 : 0.18,
    );

    map.setLayoutProperty(
      'africa-country-fill',
      'visibility',
      viewMode === 'coverage' ? 'visible' : 'none',
    );
    map.setLayoutProperty(
      'africa-country-outline',
      'visibility',
      viewMode === 'coverage' ? 'visible' : 'none',
    );
  }, [countries, mapLoaded, viewMode]);

  useEffect(() => {
    if (!mapRef.current || !mapContainerRef.current) {
      return;
    }

    if (typeof ResizeObserver === 'undefined') {
      const onResize = () => {
        mapRef.current?.resize();
      };
      window.addEventListener('resize', onResize);
      return () => window.removeEventListener('resize', onResize);
    }

    const observer = new ResizeObserver(() => {
      mapRef.current?.resize();
    });
    observer.observe(mapContainerRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) {
      return;
    }

    const map = mapRef.current;

    if (coverageClickHandlerRef.current) {
      map.off('click', 'africa-country-fill', coverageClickHandlerRef.current);
      coverageClickHandlerRef.current = null;
    }

    const handler = (event: any) => {
      const feature = event?.features?.[0];
      const iso2 = feature?.properties?.iso_3166_1;
      if (iso2) {
        // Use ref so effect doesn't need to re-run when prop identity changes.
        onCountrySelectByIsoRef.current(iso2);
      }
    };

    coverageClickHandlerRef.current = handler;
    map.on('click', 'africa-country-fill', handler);

    return () => {
      if (coverageClickHandlerRef.current) {
        map.off(
          'click',
          'africa-country-fill',
          coverageClickHandlerRef.current,
        );
        coverageClickHandlerRef.current = null;
      }
    };
  }, [mapLoaded]);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) {
      return;
    }

    const mapboxgl = (window as any).mapboxgl;
    const map = mapRef.current;
    const setCanvasCursor = (cursor: string) => {
      const canvas = map?.getCanvas?.();
      if (canvas?.style) {
        canvas.style.cursor = cursor;
      }
    };

    if (!coveragePopupRef.current) {
      coveragePopupRef.current = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: 'network-coverage-tooltip',
        offset: 12,
      });
    }

    if (!monitorPopupRef.current) {
      monitorPopupRef.current = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: 'network-monitor-tooltip',
        offset: 18,
      });
    }

    if (coverageMouseMoveHandlerRef.current) {
      map.off(
        'mousemove',
        'africa-country-fill',
        coverageMouseMoveHandlerRef.current,
      );
      coverageMouseMoveHandlerRef.current = null;
    }
    if (coverageMouseEnterHandlerRef.current) {
      map.off(
        'mouseenter',
        'africa-country-fill',
        coverageMouseEnterHandlerRef.current,
      );
      coverageMouseEnterHandlerRef.current = null;
    }
    if (coverageMouseLeaveHandlerRef.current) {
      map.off(
        'mouseleave',
        'africa-country-fill',
        coverageMouseLeaveHandlerRef.current,
      );
      coverageMouseLeaveHandlerRef.current = null;
    }

    const handleMouseMove = (event: any) => {
      if (viewMode !== 'coverage') {
        return;
      }

      const feature = event?.features?.[0];
      const iso2 = feature?.properties?.iso_3166_1;
      if (!iso2) {
        return;
      }

      const country = countryByIso2[iso2];
      const name = country?.country ?? feature?.properties?.name_en ?? iso2;
      const count = monitorCountByIso2[iso2] ?? 0;

      coveragePopupRef.current
        .setLngLat(event.lngLat)
        .setHTML(buildCoverageTooltipMarkup(name, count))
        .addTo(map);
    };

    const handleMouseEnter = () => {
      if (viewMode !== 'coverage') {
        return;
      }
      setCanvasCursor('pointer');
    };

    const handleMouseLeave = () => {
      setCanvasCursor('');
      coveragePopupRef.current?.remove();
    };

    coverageMouseMoveHandlerRef.current = handleMouseMove;
    coverageMouseEnterHandlerRef.current = handleMouseEnter;
    coverageMouseLeaveHandlerRef.current = handleMouseLeave;

    map.on('mousemove', 'africa-country-fill', handleMouseMove);
    map.on('mouseenter', 'africa-country-fill', handleMouseEnter);
    map.on('mouseleave', 'africa-country-fill', handleMouseLeave);

    if (viewMode !== 'coverage') {
      coveragePopupRef.current?.remove();
      setCanvasCursor('');
    }

    return () => {
      if (coverageMouseMoveHandlerRef.current) {
        map.off(
          'mousemove',
          'africa-country-fill',
          coverageMouseMoveHandlerRef.current,
        );
        coverageMouseMoveHandlerRef.current = null;
      }
      if (coverageMouseEnterHandlerRef.current) {
        map.off(
          'mouseenter',
          'africa-country-fill',
          coverageMouseEnterHandlerRef.current,
        );
        coverageMouseEnterHandlerRef.current = null;
      }
      if (coverageMouseLeaveHandlerRef.current) {
        map.off(
          'mouseleave',
          'africa-country-fill',
          coverageMouseLeaveHandlerRef.current,
        );
        coverageMouseLeaveHandlerRef.current = null;
      }
      setCanvasCursor('');
      coveragePopupRef.current?.remove();
    };
  }, [countryByIso2, mapLoaded, monitorCountByIso2, viewMode]);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) {
      return;
    }

    const map = mapRef.current;
    clearMarkers();

    if (viewMode !== 'monitors') {
      return;
    }

    groupedNodes.forEach((group) => {
      const element = document.createElement('button');
      element.type = 'button';
      element.className = 'cursor-pointer';
      const groupHasReference = group.type === 'Reference';
      const groupHasOnline = group.monitors.some(
        (monitor) => monitor.status === 'active',
      );
      const groupHasSelected = group.monitors.some(
        (monitor) => monitor.id === selectedMonitorId,
      );

      const ringColor = groupHasOnline
        ? groupHasReference
          ? '#12A86B'
          : group.type === 'Inactive'
            ? '#94A3B8'
            : '#2563EB'
        : '#94A3B8';

      element.innerHTML = monitorNodeMarkup(
        groupHasOnline,
        ringColor,
        group.monitors.length,
        groupHasSelected,
      );

      const handleClick = () => {
        // Always select the monitor (no cluster zoom behavior).
        const nextMonitor =
          group.monitors.find((monitor) => monitor.status === 'active') ??
          group.monitors[0];
        const country = countryByIso2[nextMonitor.iso2];
        if (country) {
          // Indicate selection came from the map so parent can open sidebar on mobile.
          onMonitorSelectRef.current(nextMonitor.id, country.id, true);
        }
      };

      element.addEventListener('click', handleClick);
      const handleMouseEnter = () => {
        element.style.zIndex = '40';

        if (!monitorPopupRef.current) {
          return;
        }

        // Always show the monitor tooltip for the first monitor in the group.
        const node = group.monitors[0];
        monitorPopupRef.current
          .setLngLat([group.longitude, group.latitude])
          .setHTML(buildMonitorTooltipMarkup(node))
          .addTo(map);
      };
      const handleMouseLeave = () => {
        element.style.zIndex = groupHasSelected ? '8' : '4';
        monitorPopupRef.current?.remove();
      };
      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);
      element.style.pointerEvents = 'auto';
      element.style.zIndex = groupHasSelected ? '8' : '4';

      const marker = new (window as any).mapboxgl.Marker({ element })
        .setLngLat([group.longitude, group.latitude])
        .addTo(map);

      markersRef.current.push({
        marker,
        element,
        handleClick,
        handleMouseEnter,
        handleMouseLeave,
      });
    });

    return () => {
      clearMarkers();
    };
  }, [
    countryByIso2,
    groupedNodes,
    mapLoaded,
    // onMonitorSelect intentionally omitted – accessed via ref to prevent
    // clearing and rebuilding all markers on every parent render.
    selectedMonitorId,
    viewMode,
  ]);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) {
      return;
    }

    const map = mapRef.current;

    const selectedCountryIso2 = selectedCountry
      ? selectedCountry.iso2
      : '__none__';
    map.setFilter('africa-country-selected-outline', [
      '==',
      ['get', 'iso_3166_1'],
      selectedCountryIso2,
    ]);

    // Avoid overriding the explicit initial view set by the user on first
    // load. Only auto-fit when a country is selected after initial view.
    if (!hasAppliedInitialViewRef.current) {
      return;
    }

    if (selectedCountry && selectedCountry.monitors.length > 0) {
      const bounds = new (window as any).mapboxgl.LngLatBounds();
      selectedCountry.monitors.forEach((monitor) => {
        if (
          typeof monitor.longitude === 'number' &&
          typeof monitor.latitude === 'number' &&
          Number.isFinite(monitor.longitude) &&
          Number.isFinite(monitor.latitude)
        ) {
          bounds.extend([monitor.longitude, monitor.latitude]);
        }
      });
      map.fitBounds(bounds, {
        padding: { top: 120, right: 70, bottom: 90, left: 70 },
        maxZoom: 7,
        duration: 850,
      });
      return;
    }

    // The map is constrained to AFRICA_BOUNDS so users cannot pan outside
    // the continent. We still allow selected-country fitBounds to zoom in.
    // The reset control returns the view to the locked default center/zoom.
  }, [allMonitors, mapLoaded, selectedCountry, selectedCountryId]);

  // Fly to a specific monitor when parent requests it (triggered after details load)
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !flyToMonitorId) return;

    const map = mapRef.current;
    // Use ref so that data refreshes don't re-trigger this effect.
    const monitor = allMonitorsRef.current.find(
      (item) => item.id === flyToMonitorId,
    );
    if (monitor) {
      map.flyTo({
        center: [monitor.longitude, monitor.latitude],
        zoom: 10.8,
        speed: 0.9,
        curve: 1.2,
      });
      // Show popup when the flyTo animation completes so the user sees
      // the selected monitor's tooltip anchored to the node.
      try {
        map.once('moveend', () => {
          try {
            if (!monitorPopupRef.current) return;
            monitorPopupRef.current
              .setLngLat([monitor.longitude, monitor.latitude])
              .setHTML(buildMonitorTooltipMarkup(monitor))
              .addTo(map);
          } catch {
            // ignore popup errors
          }
        });
      } catch {
        // ignore
      }
    }
  }, [flyToMonitorId, mapLoaded]);

  // Automatically show the monitor popup when a node is selected from the
  // sidebar or map. Removing the popup when selection clears.
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    const map = mapRef.current;

    if (!selectedMonitorId) {
      try {
        monitorPopupRef.current?.remove();
      } catch {}
      return;
    }

    const monitor = allMonitorsRef.current.find(
      (item) => item.id === selectedMonitorId,
    );
    if (!monitor) return;

    try {
      if (!monitorPopupRef.current) {
        const mapboxgl = (window as any).mapboxgl;
        monitorPopupRef.current = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
          className: 'network-monitor-tooltip',
          offset: 18,
        });
      }

      monitorPopupRef.current
        .setLngLat([monitor.longitude, monitor.latitude])
        .setHTML(buildMonitorTooltipMarkup(monitor))
        .addTo(map);
    } catch {
      // ignore
    }
  }, [selectedMonitorId, mapLoaded]);

  return (
    <div className="relative h-full w-full">
      <div ref={mapContainerRef} className="h-full w-full" />

      <div className="absolute bottom-14 right-4 z-20 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.22)]">
        <button
          type="button"
          onClick={() => mapRef.current?.zoomIn({ duration: 300 })}
          className="grid h-12 w-12 place-items-center bg-white text-slate-700 transition-colors hover:bg-slate-50"
          aria-label="Zoom in"
        >
          <FiPlus className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => mapRef.current?.zoomOut({ duration: 300 })}
          className="grid h-12 w-12 place-items-center border-t border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50"
          aria-label="Zoom out"
        >
          <FiMinus className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={async () => {
            try {
              const dataUrl = await captureSnapshot();
              if (!dataUrl) return;
              const a = document.createElement('a');
              a.href = dataUrl;
              a.download = `africa-map-snapshot-${new Date().toISOString().split('T')[0]}.png`;
              document.body.appendChild(a);
              a.click();
              a.remove();
              try {
                toast.success('Screenshot downloaded', { duration: 2500 });
              } catch {
                // ignore toast errors
              }
            } catch {
              // ignore capture errors
            }
          }}
          className="grid h-12 w-12 place-items-center border-t border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50"
          aria-label="Capture map snapshot"
          title="Capture map snapshot"
        >
          <FiCamera className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => {
            try {
              // Fly back to the user-requested locked Africa center/zoom.
              mapRef.current?.flyTo({
                center: [15.751726790157534, 1.5627232057281049],
                zoom: 2.914761576947509,
                duration: 650,
              });
            } catch {
              // ignore
            }
            try {
              onResetView();
            } catch {
              // ignore
            }
          }}
          className="grid h-12 w-12 place-items-center border-t border-slate-200 bg-white text-slate-700 transition-colors hover:bg-slate-50"
          aria-label="Reset view"
          title="Reset view"
        >
          <span className="text-xs font-semibold">Reset</span>
        </button>
      </div>

      {/* Snapshot preview modal removed — camera now downloads immediately */}
      <Toaster position="bottom-right" containerStyle={{ zIndex: 40000 }} />

      {mapInitError && (
        <div className="absolute inset-0 z-30 grid place-items-center bg-slate-100">
          <div className="rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
            {mapInitError}
          </div>
        </div>
      )}

      <style jsx global>{`
        .network-coverage-tooltip .mapboxgl-popup-content {
          border-radius: 18px;
          background: #0f172a;
          color: #ffffff;
          border: 1px solid rgba(148, 163, 184, 0.2);
          padding: 12px 14px;
          box-shadow: 0 18px 36px rgba(2, 6, 23, 0.42);
          width: auto;
          display: inline-block;
          max-width: min(70vw, 520px);
          white-space: normal;
          overflow: visible !important;
        }

        .network-coverage-tooltip .mapboxgl-popup-tip {
          border-top-color: #0f172a;
          border-bottom-color: #0f172a;
        }

        .network-monitor-tooltip .mapboxgl-popup-content {
          border-radius: 22px;
          background: #ffffff;
          color: #1e293b;
          border: 0;
          padding: 16px 16px 15px;
          box-shadow: 0 18px 44px rgba(15, 23, 42, 0.22);
          width: auto;
          display: inline-block;
          max-width: min(72vw, 520px);
          white-space: normal;
          overflow: visible !important;
        }

        .network-monitor-tooltip .mapboxgl-popup-tip {
          border-top-color: #ffffff;
          border-bottom-color: #ffffff;
        }

        .network-monitor-tooltip .mapboxgl-popup-content,
        .network-coverage-tooltip .mapboxgl-popup-content {
          overflow-wrap: anywhere;
          word-break: break-word;
          transition: none !important;
          transform: none !important;
        }

        .network-monitor-tooltip .mapboxgl-popup-tip,
        .network-coverage-tooltip .mapboxgl-popup-tip {
          transition: none !important;
        }

        .mapboxgl-popup {
          transition: none !important;
        }

        .network-monitor-tooltip .mapboxgl-popup-content * {
          box-sizing: border-box;
        }

        .network-monitor-tooltip .mapboxgl-popup-content::-webkit-scrollbar {
          width: 0;
          height: 0;
        }

        .network-monitor-tooltip.mapboxgl-popup {
          z-index: 80 !important;
        }

        .mapboxgl-ctrl.mapboxgl-ctrl-attrib {
          font-size: 11px;
        }
      `}</style>
    </div>
  );
};

export default NetworkCoverageMap;
