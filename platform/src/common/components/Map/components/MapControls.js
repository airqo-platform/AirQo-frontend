import GeoIcon from '@/icons/map/gpsIcon';
import React from 'react';
import PlusIcon from '@/icons/map/plusIcon';
import MinusIcon from '@/icons/map/minusIcon';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';

/**
 * CustomZoomControl
 * @description Custom mapbox zoom control
 * @returns {HTMLElement} container
 */
export class CustomZoomControl {
  constructor() {
    this.container = this.createContainer();
    this.zoomInButton = this.createButton('Zoom In', <PlusIcon />, () => this.map?.zoomIn());
    this.zoomOutButton = this.createButton('Zoom Out', <MinusIcon />, () => this.map?.zoomOut());

    this.container.append(this.zoomInButton, this.createSeparator(), this.zoomOutButton);
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
    button.addEventListener('click', onClick);

    const div = document.createElement('div');
    div.className = 'flex items-center justify-center h-full w-full';
    button.appendChild(div);

    const root = createRoot(div);
    root.render(React.cloneElement(component));

    return button;
  }

  createSeparator() {
    const separator = document.createElement('div');
    separator.className = 'border-t border-gray-300 w-full';
    return separator;
  }

  onAdd(map) {
    this.map = map;
    this.map.on('moveend', this.updateUrlWithMapState);
    return this.container;
  }

  updateUrlWithMapState = () => {
    const center = this.map.getCenter();
    const zoom = this.map.getZoom();
    const url = new URL(window.location);
    url.searchParams.set('lat', center.lat.toFixed(4));
    url.searchParams.set('lng', center.lng.toFixed(4));
    url.searchParams.set('zm', zoom.toFixed(2));
    window.history.pushState({}, '', url);
  };

  onRemove() {
    this.map.off('moveend', this.updateUrlWithMapState);
    this.container.parentNode.removeChild(this.container);
    this.map = undefined;
  }
}

/**
 * CustomGeolocateControl
 * @description Custom mapbox geolocate control
 * @returns {HTMLElement} container
 * @param {Function} setToastMessage
 */
export class CustomGeolocateControl {
  constructor(setToastMessage) {
    this.setToastMessage = setToastMessage;
    this.container = this._createContainer();
    this.geolocateButton = this._createButton('Locate Me', <GeoIcon />, () => this._locate());
    this.container.appendChild(this.geolocateButton);
  }

  // creates the GEO container
  _createContainer() {
    const container = document.createElement('div');
    container.className =
      'mapboxgl-ctrl mapboxgl-ctrl-group flex flex-col items-center justify-center rounded-full shadow-md overflow-hidden bg-white p-1 m-1 md:p-2 md:m-2';
    return container;
  }

  // creates the GEO button
  _createButton(title, component, onClick) {
    const button = document.createElement('button');
    button.className =
      'inline-flex items-center justify-center w-[50px] h-[50px] rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';
    button.type = 'button';
    button.title = title;

    const div = document.createElement('div');
    div.className = 'flex items-center justify-center h-full w-full';

    button.appendChild(div);

    const root = createRoot(div);
    root.render(React.cloneElement(component));

    button.addEventListener('click', onClick);
    return button;
  }

  onAdd(map) {
    this.map = map;
    return this.container;
  }

  onRemove() {
    this.container.parentNode.removeChild(this.container);
    this.map = undefined;
  }

  _locate() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => this._handleGeolocationSuccess(position),
      (error) => this._handleGeolocationError(error),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      },
    );
  }

  _handleGeolocationSuccess(position) {
    this.setToastMessage({
      message: 'Location tracked successfully.',
      type: 'success',
      bgColor: 'bg-blue-600',
    });

    this.map.flyTo({
      center: [position.coords.longitude, position.coords.latitude],
      zoom: 14,
      speed: 1,
    });

    // Use the default Mapbox marker icon
    new mapboxgl.Marker()
      .setLngLat([position.coords.longitude, position.coords.latitude])
      .addTo(this.map);

    // Check if the source already exists
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
                coordinates: [position.coords.longitude, position.coords.latitude],
              },
            },
          ],
        },
      });
    }

    // Add the layer if it doesn't exist
    if (!this.map.getLayer('circle-layer')) {
      this.map.addLayer({
        id: 'circle-layer',
        type: 'circle',
        source: 'circle-source',
        paint: {
          // Use a stepped expression to increase the circle radius as the zoom level increases
          'circle-radius': [
            'step',
            ['zoom'],
            20, // circle radius at zoom levels less than 14
            14,
            50, // circle radius at zoom level 14
            16,
            100, // circle radius at zoom level 16
            18,
            200, // circle radius at zoom level 18
            20,
            400, // circle radius at zoom level 20
          ],
          'circle-color': '#0000ff',
          'circle-opacity': 0.2,
        },
      });
    }
  }

  _handleGeolocationError(error) {
    this.setToastMessage({
      message: 'Error tracking location.',
      type: 'error',
    });
  }
}
