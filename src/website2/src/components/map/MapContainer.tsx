'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FiMaximize2, FiMinus, FiPlus } from 'react-icons/fi';

import { Site } from '@/types';

interface MapContainerProps {
  sites: Site[];
  selectedSiteId?: string;
  onSiteClick?: (site: Site) => void;
  center?: [number, number];
  zoom?: number;
  className?: string;
}

const MapContainer: React.FC<MapContainerProps> = ({
  sites,
  selectedSiteId,
  onSiteClick,
  center = [0, 20],
  zoom = 3,
  className = '',
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef<any[]>([]);
  const popupsRef = useRef<any[]>([]);

  // Initialize map
  useEffect(() => {
    if (typeof window === 'undefined' || !window.mapboxgl) {
      console.error('Mapbox GL JS not loaded');
      return;
    }

    if (map.current) return; // Prevent multiple initializations

    const mapboxgl = window.mapboxgl;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current!,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: center,
        zoom: zoom,
        attributionControl: false,
      });

      // Add attribution control
      map.current.addControl(
        new mapboxgl.AttributionControl({
          compact: true,
        }),
      );

      // Wait for map to load
      map.current.on('load', () => {
        setMapLoaded(true);
      });

      // Handle errors
      map.current.on('error', (e: any) => {
        console.error('Mapbox error:', e);
      });
    } catch (error) {
      console.error('Failed to initialize map:', error);
    }

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []); // Only run once on mount

  // Clear all markers and popups
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((marker) => {
      try {
        marker.remove();
      } catch (error) {
        console.error('Error removing marker:', error);
      }
    });
    markersRef.current = [];

    popupsRef.current.forEach((popup) => {
      try {
        popup.remove();
      } catch (error) {
        console.error('Error removing popup:', error);
      }
    });
    popupsRef.current = [];
  }, []);

  // Update markers when sites or selection changes
  useEffect(() => {
    if (
      !mapLoaded ||
      !map.current ||
      typeof window === 'undefined' ||
      !window.mapboxgl
    ) {
      return;
    }

    const mapboxgl = window.mapboxgl;

    // Clear existing markers
    clearMarkers();

    // Validate sites data
    if (!Array.isArray(sites) || sites.length === 0) {
      return;
    }

    const bounds = new mapboxgl.LngLatBounds();
    let validSitesCount = 0;

    // Add markers for each site
    sites.forEach((site) => {
      // Validate site data
      if (
        !site ||
        typeof site.approximate_latitude !== 'number' ||
        typeof site.approximate_longitude !== 'number' ||
        !isFinite(site.approximate_latitude) ||
        !isFinite(site.approximate_longitude)
      ) {
        return;
      }

      try {
        const isSelected = site._id === selectedSiteId;

        // Create marker element
        const el = document.createElement('div');
        el.className = 'custom-marker';

        el.innerHTML = `
          <div class="relative cursor-pointer transition-transform hover:scale-110 ${isSelected ? 'scale-125' : ''}">
            <div class="w-6 h-6 rounded-full border-2 border-white shadow-lg bg-blue-500 ${isSelected ? 'ring-4 ring-blue-700' : ''}"></div>
            ${
              isSelected
                ? '<div class="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-700"></div>'
                : ''
            }
          </div>
        `;

        // Create popup
        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: true,
          closeOnClick: false,
          maxWidth: '250px',
        }).setHTML(`
          <div class="p-2">
            <h3 class="font-semibold text-sm">${site.name || site.formatted_name || 'Unnamed Location'}</h3>
            <p class="text-xs text-gray-600">${site.city || site.location_name || 'Unknown'}</p>
          </div>
        `);

        // Create marker
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([site.approximate_longitude, site.approximate_latitude])
          .setPopup(popup)
          .addTo(map.current);

        // Add click handler
        const clickHandler = () => {
          if (onSiteClick) {
            onSiteClick(site);
          }
        };

        el.addEventListener('click', clickHandler);

        // Store marker and popup for cleanup
        markersRef.current.push(marker);
        popupsRef.current.push(popup);

        // Extend bounds
        bounds.extend([site.approximate_longitude, site.approximate_latitude]);
        validSitesCount++;
      } catch (error) {
        console.error('Error creating marker for site:', site._id, error);
      }
    });

    // Fit map to bounds if we have valid sites
    if (validSitesCount > 0 && !bounds.isEmpty()) {
      try {
        map.current.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 12,
          duration: 1000,
        });
      } catch (error) {
        console.error('Error fitting bounds:', error);
      }
    }

    // Cleanup function
    return () => {
      clearMarkers();
    };
  }, [sites, selectedSiteId, mapLoaded, onSiteClick, clearMarkers]);

  // Map control handlers
  const handleZoomIn = useCallback(() => {
    if (map.current) {
      map.current.zoomIn({ duration: 300 });
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (map.current) {
      map.current.zoomOut({ duration: 300 });
    }
  }, []);

  const handleResetView = useCallback(() => {
    if (!map.current || typeof window === 'undefined' || !window.mapboxgl) {
      return;
    }

    const mapboxgl = window.mapboxgl;

    if (sites.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      let hasValidSites = false;

      sites.forEach((site) => {
        if (
          site &&
          typeof site.approximate_latitude === 'number' &&
          typeof site.approximate_longitude === 'number' &&
          isFinite(site.approximate_latitude) &&
          isFinite(site.approximate_longitude)
        ) {
          bounds.extend([
            site.approximate_longitude,
            site.approximate_latitude,
          ]);
          hasValidSites = true;
        }
      });

      if (hasValidSites && !bounds.isEmpty()) {
        try {
          map.current.fitBounds(bounds, {
            padding: { top: 50, bottom: 50, left: 50, right: 50 },
            maxZoom: 12,
            duration: 1000,
          });
        } catch (error) {
          console.error('Error resetting view:', error);
        }
      }
    } else {
      // Reset to default center and zoom
      map.current.flyTo({
        center: center,
        zoom: zoom,
        duration: 1000,
      });
    }
  }, [sites, center, zoom]);

  return (
    <div className={`relative ${className}`}>
      <div ref={mapContainer} className="w-full h-full rounded-lg" />

      {/* Map Controls */}
      {mapLoaded && (
        <div className="absolute top-4 right-4 flex flex-col gap-2 bg-white rounded-lg shadow-lg p-1 z-10">
          <button
            onClick={handleZoomIn}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            aria-label="Zoom in"
            type="button"
          >
            <FiPlus className="w-5 h-5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            aria-label="Zoom out"
            type="button"
          >
            <FiMinus className="w-5 h-5" />
          </button>
          <button
            onClick={handleResetView}
            className="p-2 hover:bg-gray-100 rounded transition-colors"
            aria-label="Reset view"
            type="button"
          >
            <FiMaximize2 className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Legend */}
      {mapLoaded && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-10">
          <h4 className="text-sm font-semibold mb-2">Monitor Locations</h4>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-xs">Active Monitors</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapContainer;
