import React, { useCallback } from 'react';
import GeoIcon from '@/icons/map/gpsIcon';
import PlusIcon from '@/icons/map/plusIcon';
import MinusIcon from '@/icons/map/minusIcon';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import { setSelectedNode } from '@/lib/store/services/map/MapSlice';

/**
 * CustomZoomControl
 * @description Custom mapbox zoom control with zoom in and zoom out buttons
 * @returns {HTMLElement} container
 */
export class CustomZoomControl {
  constructor() {
    this.map = null;
    this.container = this.createContainer();
    this.zoomInButton = this.createButton('Zoom In', <PlusIcon />, () => {
      if (this.map) {
        this.map.zoomIn();
      }
    });
    this.zoomOutButton = this.createButton('Zoom Out', <MinusIcon />, () => {
      if (this.map) {
        this.map.zoomOut();
      }
    });

    // Append buttons to the container
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
    if (component) {
      root.render(React.cloneElement(component));
    } else {
      console.error(`${title} icon component is missing.`);
    }

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
    if (this.map) {
      this.map.on('moveend', this.updateUrlWithMapState);
    }
    return this.container;
  }

  updateUrlWithMapState = () => {
    if (!this.map) return;
    const center = this.map.getCenter();
    const zoom = this.map.getZoom();
    if (!center || isNaN(zoom)) return;

    const url = new URL(window.location);
    url.searchParams.set('lat', center.lat.toFixed(4));
    url.searchParams.set('lng', center.lng.toFixed(4));
    url.searchParams.set('zm', zoom.toFixed(2));
    window.history.pushState({}, '', url);
  };

  onRemove() {
    if (this.map) {
      this.map.off('moveend', this.updateUrlWithMapState);
    }
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
    this.map = null;
  }
}

/**
 * CustomGeolocateControl
 * @description Custom mapbox geolocate control to find the user's location
 * @returns {HTMLElement} container
 * @param {Function} setToastMessage - Function to display feedback to the user
 */
export class CustomGeolocateControl {
  constructor(setToastMessage) {
    this.map = null;
    this.setToastMessage = setToastMessage || (() => {});
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
    if (component) {
      root.render(React.cloneElement(component));
    } else {
      console.error(`${title} icon component is missing.`);
    }

    button.addEventListener('click', onClick);
    return button;
  }

  onAdd(map) {
    this.map = map;
    return this.container;
  }

  onRemove() {
    if (this.container.parentNode) {
      this.container.parentNode.removeChild(this.container);
    }
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

    this.map.flyTo({
      center: [longitude, latitude],
      zoom: 14,
      speed: 1,
    });

    new mapboxgl.Marker().setLngLat([longitude, latitude]).addTo(this.map);

    if (!this.map.getSource('circle-source')) {
      this.map.addSource('circle-source', {
        type: 'geojson',
        data: {
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
        },
      });
    }

    if (!this.map.getLayer('circle-layer')) {
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
  }

  handleGeolocationError(error) {
    this.setToastMessage({
      message: `Error tracking location: ${error.message}`,
      type: 'error',
      bgColor: 'bg-red-500',
    });
  }
}

// Function to refresh the map
export const useRefreshMap = (
  setToastMessage,
  mapRef,
  dispatch,
  selectedNode,
) =>
  useCallback(() => {
    const map = mapRef.current;
    if (map) {
      try {
        const originalStyle =
          map.getStyle().sprite.split('/').slice(0, -1).join('/') +
          '/style.json';
        map.setStyle(originalStyle);

        setToastMessage({
          message: 'Map refreshed successfully',
          type: 'success',
          bgColor: 'bg-blue-600',
        });
      } catch (error) {
        console.error('Error refreshing the map:', error);
      }

      if (selectedNode) {
        dispatch(setSelectedNode(null));
      }
    }
  }, [mapRef, dispatch, setToastMessage, selectedNode]);

/**
 * Custom hook to share the current map location by copying the URL with updated parameters.
 */
export const useShareLocation = (setToastMessage, mapRef) => {
  return useCallback(async () => {
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
      // Get the current center and zoom level of the map
      const center = map.getCenter();
      const zoom = map.getZoom();

      // Construct a new URL based on the current location without existing search params
      const currentUrl = new URL(window.location.href);
      const baseUrl = `${currentUrl.origin}${currentUrl.pathname}`;
      const url = new URL(baseUrl);

      // Update or set the search parameters for latitude, longitude, and zoom
      url.searchParams.set('lat', center.lat.toFixed(4));
      url.searchParams.set('lng', center.lng.toFixed(4));
      url.searchParams.set('zm', zoom.toFixed(2));

      const shareUrl = url.toString();

      // Check if the Clipboard API is available
      if (navigator.clipboard && navigator.clipboard.writeText) {
        // Use the Clipboard API to copy the URL
        await navigator.clipboard.writeText(shareUrl);
        setToastMessage({
          message: 'Location URL copied to clipboard!',
          type: 'success',
          bgColor: 'bg-blue-600',
        });
      } else {
        // Fallback method for browsers that do not support the Clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = shareUrl;
        textArea.style.position = 'fixed';
        textArea.style.top = '-1000px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
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
        } catch (err) {
          console.error('Fallback: Oops, unable to copy', err);
          setToastMessage({
            message: 'Failed to copy location URL.',
            type: 'error',
            bgColor: 'bg-red-600',
          });
        } finally {
          document.body.removeChild(textArea);
        }
      }
    } catch (error) {
      console.error('Error sharing location:', error);
      setToastMessage({
        message: 'An unexpected error occurred.',
        type: 'error',
        bgColor: 'bg-red-600',
      });
    }
  }, [mapRef, setToastMessage]);
};

/**
 * IconButton
 * @description Reusable button component with customizable icons
 * @param {Function} onClick - Click event handler
 * @param {string} title - Button title for accessibility
 * @param {ReactNode} icon - Icon to be displayed inside the button
 * @returns JSX Element
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
 * LoadingOverlay
 * @description Display a loading overlay centered on the screen
 * @param {ReactNode} children - Loading content to display (like a spinner)
 * @param {number} size - Size of the overlay
 * @returns JSX Element
 */
export const LoadingOverlay = ({ children, size }) => (
  <div className="absolute inset-0 flex items-center justify-center z-[10000]">
    <div
      className={`bg-white w-[${size}px] h-[${size}px] flex justify-center items-center rounded-md shadow-md p-3`}
    >
      {children}
    </div>
  </div>
);
