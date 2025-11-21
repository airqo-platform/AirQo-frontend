'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FiMaximize2, FiMinus, FiPlus } from 'react-icons/fi';

import { Site } from '@/types';

// Helper function to escape HTML and prevent XSS
const escapeHtml = (text: string): string => {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
};

interface MapContainerProps {
  sites: Site[];
  selectedSiteId?: string;
  onSiteClick?: (site: Site) => void;
  center?: [number, number];
  zoom?: number;
  className?: string;
  isAllSites?: boolean;
}

const MapContainer: React.FC<MapContainerProps> = ({
  sites,
  selectedSiteId,
  onSiteClick,
  center = [0, 20],
  zoom = 3,
  className = '',
  isAllSites = false,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef<any[]>([]);
  const popupsRef = useRef<any[]>([]);
  const listenersRef = useRef<{ element: HTMLElement; handler: () => void }[]>(
    [],
  );

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

    // Clean up event listeners
    listenersRef.current.forEach(({ element, handler }) => {
      try {
        element.removeEventListener('click', handler);
      } catch (error) {
        console.error('Error removing event listener:', error);
      }
    });
    listenersRef.current = [];
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

        // Create marker element using DOM methods to prevent XSS
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.zIndex = isSelected ? '1000' : '1';

        // Create marker container
        const markerDiv = document.createElement('div');
        markerDiv.className = `relative cursor-pointer transition-transform hover:scale-110 ${isSelected ? 'scale-125 z-[1000]' : ''}`;

        // Create inner circle
        const innerDiv = document.createElement('div');
        innerDiv.className = `w-4 h-4 rounded-full border-2 border-white bg-blue-500 ${isSelected ? 'ring-4 ring-blue-700 w-6 h-6' : 'shadow-md'}`;
        markerDiv.appendChild(innerDiv);

        // Add arrow for selected markers
        if (isSelected) {
          const arrow = document.createElement('div');
          arrow.className =
            'absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-blue-700';
          markerDiv.appendChild(arrow);
        }

        el.appendChild(markerDiv);

        // Create popup with escaped HTML to prevent XSS
        const siteName = escapeHtml(
          site.name || site.formatted_name || 'Unnamed Location',
        );
        const siteLocation = escapeHtml(
          site.city || site.location_name || 'Unknown',
        );

        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: true,
          closeOnClick: false,
          maxWidth: '250px',
        }).setHTML(`
          <div class="p-2">
            <h3 class="font-semibold text-sm">${siteName}</h3>
            <p class="text-xs text-gray-600">${siteLocation}</p>
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

        // Store marker, popup, and listener for cleanup
        markersRef.current.push(marker);
        popupsRef.current.push(popup);
        listenersRef.current.push({ element: el, handler: clickHandler });

        // Extend bounds
        bounds.extend([site.approximate_longitude, site.approximate_latitude]);
        validSitesCount++;
      } catch (error) {
        console.error('Error creating marker for site:', site._id, error);
      }
    });

    // Adjust map view based on sites
    if (validSitesCount > 0) {
      try {
        if (isAllSites && !bounds.isEmpty()) {
          // For all sites, fit all markers into view
          map.current.fitBounds(bounds, {
            padding: { top: 80, bottom: 80, left: 80, right: 80 },
            maxZoom: 6, // Lower max zoom for overview
            duration: 1000,
          });
        } else if (!bounds.isEmpty()) {
          // For specific grid, fit to bounds with higher zoom
          map.current.fitBounds(bounds, {
            padding: { top: 50, bottom: 50, left: 50, right: 50 },
            maxZoom: 12,
            duration: 1000,
          });
        }
      } catch (error) {
        console.error('Error adjusting map view:', error);
      }
    }

    // Cleanup function
    return () => {
      clearMarkers();
    };
  }, [
    sites,
    selectedSiteId,
    mapLoaded,
    onSiteClick,
    clearMarkers,
    isAllSites,
    center,
    zoom,
  ]);

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
