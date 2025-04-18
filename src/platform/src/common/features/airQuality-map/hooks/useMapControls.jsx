import React, { useCallback } from 'react';
import GeoIcon from '@/icons/map/gpsIcon';
import PlusIcon from '@/icons/map/plusIcon';
import MinusIcon from '@/icons/map/minusIcon';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import { setSelectedNode } from '@/lib/store/services/map/MapSlice';
import { FaGlobe } from 'react-icons/fa';

/**
 * GlobeControl
 */
export class GlobeControl {
  constructor(initiallyActive = false) {
    this.map = null;
    this.active = initiallyActive; // Default to inactive (flat Mercator)
    this.container = this._createContainer();
    this.button = this._createButton(
      'Toggle Globe View',
      <FaGlobe size={20} />,
      this._toggleGlobe.bind(this),
    );
    this.container.appendChild(this.button);
  }

  _createContainer() {
    const c = document.createElement('div');
    c.className =
      'mapboxgl-ctrl mapboxgl-ctrl-group flex flex-col items-center justify-center rounded-full shadow-md overflow-hidden bg-white p-1 m-1 md:p-2 md:m-2';
    return c;
  }

  _createButton(title, component, onClick) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.title = title;
    btn.className =
      'inline-flex items-center justify-center w-[50px] h-[50px] rounded-full bg-white focus:outline-none';

    const wrapper = document.createElement('div');
    wrapper.className = 'flex items-center justify-center h-full w-full';
    btn.appendChild(wrapper);

    createRoot(wrapper).render(component);
    btn.addEventListener('click', onClick);

    return btn;
  }

  onAdd(map) {
    this.map = map;

    // Set initial appearance based on active state
    if (this.active) {
      this.button.classList.add(
        'bg-blue-100',
        'ring-2',
        'ring-offset-2',
        'ring-blue-500',
      );
      // Ensure map starts with globe projection if active is true
      if (map.getProjection().name !== 'globe') {
        map.setProjection({ name: 'globe' });
      }
    } else {
      // Ensure map starts with mercator projection if active is false
      if (map.getProjection().name !== 'mercator') {
        map.setProjection({ name: 'mercator' });
      }
    }

    return this.container;
  }

  onRemove() {
    this.container.remove();
    this.map = null;
  }

  _toggleGlobe() {
    if (!this.map) return;

    const proj = this.map.getProjection().name;
    const nowGlobe = proj !== 'globe';

    // Update map projection
    this.map.setProjection({ name: nowGlobe ? 'globe' : 'mercator' });

    // Update button appearance
    this.active = nowGlobe;

    if (this.active) {
      this.button.classList.add(
        'bg-blue-100',
        'ring-2',
        'ring-offset-2',
        'ring-blue-500',
      );
    } else {
      this.button.classList.remove(
        'bg-blue-100',
        'ring-2',
        'ring-offset-2',
        'ring-blue-500',
      );
    }
  }
}

/**
 * CustomZoomControl
 * Custom mapbox zoom control with zoom in and zoom out buttons
 */
export class CustomZoomControl {
  constructor() {
    this.map = null;
    this.container = this.createContainer();
    this.zoomInButton = this.createButton('Zoom In', <PlusIcon />, () => {
      if (this.map) {
        try {
          this.map.zoomIn();
        } catch (error) {
          console.error('Zoom in failed:', error);
        }
      }
    });
    this.zoomOutButton = this.createButton('Zoom Out', <MinusIcon />, () => {
      if (this.map) {
        try {
          this.map.zoomOut();
        } catch (error) {
          console.error('Zoom out failed:', error);
        }
      }
    });

    this.container.append(
      this.zoomInButton,
      this.createSeparator(),
      this.zoomOutButton,
    );
  }

  createContainer() {
    const container = document.createElement('div');
    container.className =
      'mapboxgl-ctrl mapboxgl-ctrl-group flex flex-col bg-white rounded-full shadow-md overflow-hidden';
    return container;
  }

  createButton(title, component, onClick) {
    const button = document.createElement('button');
    button.className =
      'mapboxgl-ctrl-icon rounded-full m-1 md:m-2 flex items-center justify-center';
    button.type = 'button';
    button.title = title;

    const div = document.createElement('div');
    div.className = 'flex items-center justify-center h-full w-full';
    button.appendChild(div);

    const root = createRoot(div);
    root.render(component ? React.cloneElement(component) : null);

    button.addEventListener('click', onClick);
    return button;
  }

  createSeparator() {
    const separator = document.createElement('div');
    separator.className = 'border-t border-gray-300 w-full';
    return separator;
  }

  onAdd(map) {
    this.map = map;
    this.map.on('moveend', this.updateUrlWithMapState.bind(this));
    return this.container;
  }

  updateUrlWithMapState() {
    if (!this.map) return;
    try {
      const center = this.map.getCenter();
      const zoom = this.map.getZoom();
      if (!center || isNaN(zoom)) return;

      const url = new URL(window.location);
      url.searchParams.set('lat', center.lat.toFixed(4));
      url.searchParams.set('lng', center.lng.toFixed(4));
      url.searchParams.set('zm', zoom.toFixed(2));
      window.history.replaceState({}, '', url);
    } catch (error) {
      console.error('Error updating URL:', error);
    }
  }

  onRemove() {
    if (this.map) {
      this.map.off('moveend', this.updateUrlWithMapState.bind(this));
    }
    this.container.remove();
    this.map = null;
  }
}

/**
 * CustomGeolocateControl
 * Custom mapbox geolocate control to find the user's location
 */
export class CustomGeolocateControl {
  constructor(setToastMessage) {
    this.map = null;
    this.setToastMessage =
      typeof setToastMessage === 'function' ? setToastMessage : () => {};
    this.container = this.createContainer();
    this.geolocateButton = this.createButton('Locate Me', <GeoIcon />, () => {
      this.locateUser();
    });

    this.container.appendChild(this.geolocateButton);
  }

  createContainer() {
    const container = document.createElement('div');
    container.className =
      'mapboxgl-ctrl mapboxgl-ctrl-group flex flex-col items-center justify-center rounded-full shadow-md overflow-hidden bg-white p-1 m-1 md:p-2 md:m-2';
    return container;
  }

  createButton(title, component, onClick) {
    const button = document.createElement('button');
    button.className =
      'inline-flex items-center justify-center w-[50px] h-[50px] rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';
    button.type = 'button';
    button.title = title;

    const div = document.createElement('div');
    div.className = 'flex items-center justify-center h-full w-full';
    button.appendChild(div);

    const root = createRoot(div);
    root.render(component ? React.cloneElement(component) : null);

    button.addEventListener('click', onClick);
    return button;
  }

  onAdd(map) {
    this.map = map;
    return this.container;
  }

  onRemove() {
    this.container.remove();
    this.map = null;
  }

  locateUser() {
    if (!navigator.geolocation) {
      this.setToastMessage({
        message: 'Geolocation is not supported by your browser.',
        type: 'error',
        bgColor: 'bg-red-500',
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => this.handleGeolocationSuccess(position),
      (error) => this.handleGeolocationError(error),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      },
    );
  }

  handleGeolocationSuccess(position) {
    if (!this.map) return;
    const { longitude, latitude } = position.coords;
    this.setToastMessage({
      message: 'Location tracked successfully.',
      type: 'success',
      bgColor: 'bg-blue-600',
    });

    try {
      this.map.flyTo({
        center: [longitude, latitude],
        zoom: 14,
        speed: 1,
      });

      // Add user's location marker
      new mapboxgl.Marker().setLngLat([longitude, latitude]).addTo(this.map);

      // Create or update location radius circle
      const geoJsonData = {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [longitude, latitude],
            },
          },
        ],
      };

      if (this.map.getSource('circle-source')) {
        this.map.getSource('circle-source').setData(geoJsonData);
      } else {
        this.map.addSource('circle-source', {
          type: 'geojson',
          data: geoJsonData,
        });

        this.map.addLayer({
          id: 'circle-layer',
          type: 'circle',
          source: 'circle-source',
          paint: {
            'circle-radius': [
              'step',
              ['zoom'],
              20,
              14,
              50,
              16,
              100,
              18,
              200,
              20,
              400,
            ],
            'circle-color': '#0000ff',
            'circle-opacity': 0.2,
          },
        });
      }
    } catch (error) {
      console.error('Error updating map with geolocation:', error);
    }
  }

  handleGeolocationError(error) {
    this.setToastMessage({
      message: `Error tracking location: ${error.message}`,
      type: 'error',
      bgColor: 'bg-red-500',
    });
  }
}

/**
 * Refresh the map style and state.
 */
export const useRefreshMap = (
  setToastMessage,
  mapRef,
  dispatch,
  selectedNode,
) =>
  useCallback(() => {
    const map = mapRef.current;
    if (!map) {
      setToastMessage({
        message: 'Map reference is not available.',
        type: 'error',
        bgColor: 'bg-red-600',
      });
      return;
    }

    try {
      const originalStyle =
        map.getStyle().sprite.split('/').slice(0, -1).join('/') + '/style.json';
      map.setStyle(originalStyle);
      setToastMessage({
        message: 'Map refreshed successfully',
        type: 'success',
        bgColor: 'bg-blue-600',
      });

      if (selectedNode) {
        dispatch(setSelectedNode(null));
      }
    } catch (error) {
      console.error('Error refreshing the map:', error);
      setToastMessage({
        message: 'Failed to refresh the map',
        type: 'error',
        bgColor: 'bg-red-600',
      });
    }
  }, [mapRef, dispatch, setToastMessage, selectedNode]);

/**
 * Share the current map location by copying the URL with updated parameters.
 */
export const useShareLocation = (setToastMessage, mapRef) =>
  useCallback(async () => {
    const map = mapRef.current;
    if (!map) {
      setToastMessage({
        message: 'Map is not available.',
        type: 'error',
        bgColor: 'bg-red-600',
      });
      return;
    }

    try {
      const center = map.getCenter();
      const zoom = map.getZoom();
      const currentUrl = new URL(window.location.href);
      const baseUrl = `${currentUrl.origin}${currentUrl.pathname}`;
      const url = new URL(baseUrl);
      url.searchParams.set('lat', center.lat.toFixed(4));
      url.searchParams.set('lng', center.lng.toFixed(4));
      url.searchParams.set('zm', zoom.toFixed(2));
      const shareUrl = url.toString();

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setToastMessage({
          message: 'Location URL copied to clipboard!',
          type: 'success',
          bgColor: 'bg-blue-600',
        });
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.top = '-1000px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        const successful = document.execCommand('copy');
        if (successful) {
          setToastMessage({
            message: 'Location URL copied to clipboard!',
            type: 'success',
            bgColor: 'bg-blue-600',
          });
        } else {
          throw new Error('Copy command was unsuccessful');
        }
        document.body.removeChild(textArea);
      }
    } catch (error) {
      console.error('Error sharing location:', error);
      setToastMessage({
        message: 'Failed to copy location URL',
        type: 'error',
        bgColor: 'bg-red-600',
      });
    }
  }, [mapRef, setToastMessage]);

/**
 * IconButton - Reusable button component with customizable icons
 */
export const IconButton = ({ onClick, title, icon }) => (
  <button
    onClick={onClick}
    title={title}
    className="inline-flex items-center justify-center p-2 md:p-3 mr-2 text-white rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md"
  >
    {icon}
  </button>
);

/**
 * LoadingOverlay - Display a loading overlay centered on the screen
 */
export const LoadingOverlay = ({ children, size = 70 }) => (
  <div
    className="absolute inset-0 flex items-center justify-center"
    style={{
      zIndex: 10000,
    }}
  >
    <div
      className={`bg-white w-${size} h-${size} flex justify-center items-center rounded-md shadow-md p-3`}
    >
      {children}
    </div>
  </div>
);
