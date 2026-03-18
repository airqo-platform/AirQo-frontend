'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FiMinus, FiPlus } from 'react-icons/fi';

import {
  africanIso2Codes,
  CountryCoverage,
  MonitorStation,
  ViewMode,
} from '../mockup';

interface NetworkCoverageMapProps {
  countries: CountryCoverage[];
  selectedCountryId: string | null;
  selectedMonitorId: string | null;
  viewMode: ViewMode;
  mapStyle: string;
  onCountrySelectByIso: (iso2: string) => void;
  onMonitorSelect: (monitorId: string, countryId: string) => void;
}

type MarkerResource = {
  marker: any;
  element: HTMLButtonElement;
  handleClick: () => void;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
};

const AFRICA_BOUNDS: [[number, number], [number, number]] = [
  [-30, -43],
  [64, 45],
];

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

const monitorNodeMarkup = (
  isOnline: boolean,
  ringColor: string,
  count: number,
  selected: boolean,
) => {
  const icon = isOnline
    ? `<svg viewBox="0 0 24 24" aria-hidden="true" style="width:24px;height:24px;color:${ringColor};"><path fill="currentColor" d="M12 18.2a1.2 1.2 0 1 0 0 2.4a1.2 1.2 0 0 0 0-2.4Zm0-4.1a4.7 4.7 0 0 0-3.35 1.4a1 1 0 1 0 1.4 1.42a2.7 2.7 0 0 1 3.9 0a1 1 0 0 0 1.4-1.42A4.7 4.7 0 0 0 12 14.1Zm0-4.5a9.2 9.2 0 0 0-6.54 2.7a1 1 0 1 0 1.41 1.42a7.2 7.2 0 0 1 10.26 0a1 1 0 1 0 1.41-1.42A9.2 9.2 0 0 0 12 9.6Z"/></svg>`
    : `<svg viewBox="0 0 24 24" aria-hidden="true" style="width:24px;height:24px;color:${ringColor};"><path fill="currentColor" d="M3.7 3.7a1 1 0 0 0-1.4 1.4l2.35 2.35a9.1 9.1 0 0 0-.6.5a1 1 0 0 0 1.41 1.42c.11-.1.22-.2.34-.29l1.45 1.45a4.8 4.8 0 0 0-1.9 1.14a1 1 0 1 0 1.41 1.42a2.8 2.8 0 0 1 1.93-.8l1.26 1.26a1.2 1.2 0 1 0 1.43 1.43l1.29 1.29a1.2 1.2 0 0 0 1.7-1.7l-11-11Zm8.3 7.8a4.8 4.8 0 0 1 2.6.78a1 1 0 0 0 1.07-1.69a6.8 6.8 0 0 0-3.67-1.09a1 1 0 1 0 0 2Zm0-4.4a9.2 9.2 0 0 1 6.54 2.7a1 1 0 0 0 1.41-1.42A11.2 11.2 0 0 0 12 5.1a1 1 0 1 0 0 2Z"/></svg>`;

  return `<div style="position:relative;transition:transform .2s;transform:${selected ? 'scale(1.12)' : 'scale(1)'};"><span style="display:grid;place-items:center;height:52px;width:52px;border-radius:9999px;border:2px solid ${ringColor};background:#fff;box-shadow:0 6px 14px rgba(15,23,42,.24);${selected ? 'box-shadow:0 0 0 7px rgba(59,130,246,.2),0 6px 14px rgba(15,23,42,.24);' : ''}">${icon}</span>${
    count > 1
      ? `<span style="position:absolute;right:-5px;top:-5px;border-radius:9999px;background:#2563eb;color:#fff;font-weight:700;font-size:12px;line-height:1;padding:4px 7px;">+${count - 1}</span>`
      : ''
  }</div>`;
};

const NetworkCoverageMap: React.FC<NetworkCoverageMapProps> = ({
  countries,
  selectedCountryId,
  selectedMonitorId,
  viewMode,
  mapStyle,
  onCountrySelectByIso,
  onMonitorSelect,
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
  const [zoomLevel, setZoomLevel] = useState(2.6);

  const countryById = useMemo(() => {
    const result: Record<string, CountryCoverage> = {};
    countries.forEach((country) => {
      result[country.id] = country;
    });
    return result;
  }, [countries]);

  const countryByIso2 = useMemo(() => {
    const result: Record<string, CountryCoverage> = {};
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

  const selectedCountry = selectedCountryId
    ? countryById[selectedCountryId]
    : null;

  const visibleMonitors = useMemo(() => {
    return allMonitors;
  }, [allMonitors]);

  const groupedNodes = useMemo(() => {
    const grouped = new Map<
      string,
      {
        monitors: MonitorStation[];
        latitude: number;
        longitude: number;
        type: MonitorStation['type'];
      }
    >();

    const precision =
      zoomLevel < 4 ? 1 : zoomLevel < 5.2 ? 2 : zoomLevel < 7.2 ? 3 : 4;

    visibleMonitors.forEach((monitor) => {
      const key = `${monitor.latitude.toFixed(precision)}:${monitor.longitude.toFixed(precision)}:${monitor.type}`;
      const existing = grouped.get(key);
      if (existing) {
        existing.monitors.push(monitor);
      } else {
        grouped.set(key, {
          monitors: [monitor],
          latitude: monitor.latitude,
          longitude: monitor.longitude,
          type: monitor.type,
        });
      }
    });

    return Array.from(grouped.values());
  }, [visibleMonitors, zoomLevel]);

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
    if (
      typeof window === 'undefined' ||
      !(window as any).mapboxgl ||
      mapRef.current
    ) {
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
        center: [20, 2],
        zoom: 2.6,
        projection: 'mercator',
        maxBounds: AFRICA_BOUNDS,
        minZoom: 2.2,
        maxZoom: 13,
        attributionControl: true,
        customAttribution: ['Powered by AirQo'],
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

      map.fitBounds(AFRICA_BOUNDS, {
        padding: { top: 95, right: 110, bottom: 130, left: 100 },
        maxZoom: 2.4,
        duration: 0,
      });

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
      setZoomLevel(map.getZoom());
    });

    mapRef.current.on('zoomend', () => {
      setZoomLevel(mapRef.current.getZoom());
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
      }
    };
  }, [mapStyle]);

  useEffect(() => {
    if (!mapLoaded || !mapRef.current) {
      return;
    }

    const map = mapRef.current;
    const expression: any[] = ['match', ['get', 'iso_3166_1']];

    countries.forEach((country) => {
      expression.push(country.iso2, bucketColor(country.monitors.length));
    });
    expression.push('#E8ECF3');

    map.setPaintProperty('africa-country-fill', 'fill-color', expression);
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
        onCountrySelectByIso(iso2);
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
  }, [mapLoaded, onCountrySelectByIso]);

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
        .setHTML(
          `<div style="min-width: 138px; font-size: 12px; line-height: 1.4;"><div style="font-weight: 700; margin-bottom: 2px;">${name}</div><div>Monitor collection: ${count}</div></div>`,
        )
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
        if (group.monitors.length > 1 && map.getZoom() < 8.6) {
          map.flyTo({
            center: [group.longitude, group.latitude],
            zoom: Math.min(map.getZoom() + 1.6, 9.4),
            speed: 0.9,
            curve: 1.2,
          });
          return;
        }

        const nextMonitor =
          group.monitors.find((monitor) => monitor.status === 'active') ??
          group.monitors[0];
        const country = countryByIso2[nextMonitor.iso2];
        if (country) {
          onMonitorSelect(nextMonitor.id, country.id);
        }
      };

      element.addEventListener('click', handleClick);
      const handleMouseEnter = () => {
        element.style.zIndex = '40';

        if (!monitorPopupRef.current) {
          return;
        }

        if (group.monitors.length > 1) {
          const previewNames = group.monitors
            .slice(0, 3)
            .map((monitor) => `<div>${escapeHtml(monitor.name)}</div>`)
            .join('');
          const remaining = group.monitors.length - 3;
          monitorPopupRef.current
            .setLngLat([group.longitude, group.latitude])
            .setHTML(
              `<div style="min-width: 210px; font-size: 15px; line-height: 1.45;"><div style="font-weight: 700; color: #1e293b; margin-bottom: 6px;">${group.monitors.length} monitors</div><div style="color: #64748b;">${previewNames}${remaining > 0 ? `<div style=\"color:#2563eb;font-weight:600;\">+${remaining} more</div>` : ''}</div></div>`,
            )
            .addTo(map);
          return;
        }

        const node = group.monitors[0];
        const statusColor = node.status === 'active' ? '#22c55e' : '#94a3b8';
        monitorPopupRef.current
          .setLngLat([group.longitude, group.latitude])
          .setHTML(
            `<div style="min-width: 248px; font-size: 14px; line-height: 1.35;"><div style="font-size: 16px; color: #2563eb; margin-right: 7px; vertical-align: middle; display: inline-block; line-height: 0;">•</div><div style="display:inline-block; vertical-align: middle; width: calc(100% - 24px);"><div style="font-weight:700;color:#1e293b;font-size:18px;">${escapeHtml(node.name)}</div><div style="color:#64748b;font-size:12px; margin-top: 1px;">AirQo · ${escapeHtml(node.city)}, ${escapeHtml(node.country)}</div><div style="margin-top: 4px;"><span style="color:#2563eb;font-weight:700;font-size:14px;">${escapeHtml(node.type)}</span><span style="color:${statusColor};font-weight:600;font-size:14px; margin-left: 8px;">● ${escapeHtml(node.status === 'active' ? 'Active' : 'Inactive')}</span></div></div></div>`,
          )
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
    onMonitorSelect,
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

    if (selectedMonitorId) {
      const monitor = allMonitors.find((item) => item.id === selectedMonitorId);
      if (monitor) {
        map.flyTo({
          center: [monitor.longitude, monitor.latitude],
          zoom: 10.8,
          speed: 0.9,
          curve: 1.2,
        });
      }
      return;
    }

    if (selectedCountry && selectedCountry.monitors.length > 0) {
      const bounds = new (window as any).mapboxgl.LngLatBounds();
      selectedCountry.monitors.forEach((monitor) => {
        bounds.extend([monitor.longitude, monitor.latitude]);
      });
      map.fitBounds(bounds, {
        padding: { top: 120, right: 70, bottom: 90, left: 70 },
        maxZoom: 7,
        duration: 850,
      });
      return;
    }

    if (!selectedCountryId) {
      map.fitBounds(AFRICA_BOUNDS, {
        padding: { top: 115, right: 110, bottom: 140, left: 100 },
        maxZoom: 2.4,
        duration: 850,
      });
    }
  }, [
    allMonitors,
    mapLoaded,
    selectedCountry,
    selectedCountryId,
    selectedMonitorId,
  ]);

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
      </div>

      {mapInitError && (
        <div className="absolute inset-0 z-30 grid place-items-center bg-[#f6f6f7]">
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
            {mapInitError}
          </div>
        </div>
      )}

      <style jsx global>{`
        .network-coverage-tooltip .mapboxgl-popup-content {
          border-radius: 10px;
          background: #1f2430;
          color: #ffffff;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 10px 12px;
          box-shadow: 0 10px 24px rgba(2, 6, 23, 0.45);
        }

        .network-coverage-tooltip .mapboxgl-popup-tip {
          border-top-color: #1f2430;
          border-bottom-color: #1f2430;
        }

        .network-monitor-tooltip .mapboxgl-popup-content {
          border-radius: 16px;
          background: #ffffff;
          color: #1e293b;
          border: 0;
          padding: 12px 14px;
          box-shadow: 0 14px 34px rgba(15, 23, 42, 0.2);
        }

        .network-monitor-tooltip .mapboxgl-popup-tip {
          border-top-color: #ffffff;
          border-bottom-color: #ffffff;
        }

        .network-monitor-tooltip.mapboxgl-popup {
          z-index: 70 !important;
        }

        .mapboxgl-ctrl.mapboxgl-ctrl-attrib {
          font-size: 11px;
        }
      `}</style>
    </div>
  );
};

export default NetworkCoverageMap;
