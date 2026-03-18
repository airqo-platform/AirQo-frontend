'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { FiMinus, FiPlus } from 'react-icons/fi';

import {
  africanIso2Codes,
  CountryCoverage,
  MonitorStation,
  ViewMode,
} from '../mockup';
import MonitorNode from './map/MonitorNode';

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
  root: Root;
  handleClick: () => void;
  handleMouseEnter: () => void;
  handleMouseLeave: () => void;
};

const AFRICA_BOUNDS: [[number, number], [number, number]] = [
  [-28, -42],
  [63, 43],
];

const bucketColor = (count: number): string => {
  if (count === 0) return '#E8ECF3';
  if (count === 1) return '#CCD9FF';
  if (count <= 3) return '#8EADFF';
  if (count <= 6) return '#4D79F2';
  return '#1C56E3';
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
  const markersRef = useRef<MarkerResource[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
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
      resource.root.unmount();
      resource.marker.remove();
    });
    markersRef.current = [];
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

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center: [20, 2],
      zoom: 2.6,
      projection: 'mercator',
      maxBounds: AFRICA_BOUNDS,
      minZoom: 2.2,
      maxZoom: 13,
      attributionControl: true,
    });

    mapRef.current.on('load', () => {
      const map = mapRef.current;

      map.fitBounds(AFRICA_BOUNDS, {
        padding: { top: 90, right: 90, bottom: 100, left: 90 },
        maxZoom: 2.55,
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

    if (!coveragePopupRef.current) {
      coveragePopupRef.current = new mapboxgl.Popup({
        closeButton: false,
        closeOnClick: false,
        className: 'network-coverage-tooltip',
        offset: 12,
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
      map.getCanvas().style.cursor = 'pointer';
    };

    const handleMouseLeave = () => {
      map.getCanvas().style.cursor = '';
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
      map.getCanvas().style.cursor = '';
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
      map.getCanvas().style.cursor = '';
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

      const root = createRoot(element);
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

      root.render(
        <MonitorNode
          isOnline={groupHasOnline}
          ringColor={ringColor}
          count={group.monitors.length}
          selected={groupHasSelected}
        />,
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
        element.style.zIndex = '20';
      };
      const handleMouseLeave = () => {
        element.style.zIndex = groupHasSelected ? '8' : '4';
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
        root,
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
        padding: { top: 110, right: 90, bottom: 120, left: 90 },
        maxZoom: 2.55,
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

      <div className="pointer-events-none absolute bottom-2 right-2 z-20 rounded-md bg-white/90 px-2 py-1 text-xs font-medium text-slate-600 shadow-sm">
        Powered by <span className="font-semibold text-blue-600">AirQo</span>
      </div>

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
      `}</style>
    </div>
  );
};

export default NetworkCoverageMap;
