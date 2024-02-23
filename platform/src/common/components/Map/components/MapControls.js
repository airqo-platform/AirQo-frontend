import GeoIcon from '@/icons/map/gpsIcon';
import React from 'react';
import PlusIcon from '@/icons/map/plusIcon';
import MinusIcon from '@/icons/map/minusIcon';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';

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
    button.className = 'mapboxgl-ctrl-icon rounded-full p-2 m-2 flex items-center justify-center';
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
    url.searchParams.set('zm', zoom);
    window.history.pushState({}, '', url);
  };

  onRemove() {
    this.map.off('moveend', this.updateUrlWithMapState);
    this.container.parentNode.removeChild(this.container);
    this.map = undefined;
  }
}

export class CustomGeolocateControl {
  constructor() {
    this.container = this.createContainer();
    this.geolocateButton = this.createButton('Locate Me', <GeoIcon />, () => this.locate());
    this.container.appendChild(this.geolocateButton);
  }

  createContainer() {
    const container = document.createElement('div');
    container.className =
      'mapboxgl-ctrl mapboxgl-ctrl-group flex flex-col items-center justify-center rounded-full shadow-md overflow-hidden bg-white p-2 m-2';
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

  locate() {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.map.flyTo({
          center: [position.coords.longitude, position.coords.latitude],
          zoom: 14,
          speed: 1,
        });

        // Create and add the marker
        new mapboxgl.Marker({
          color: 'blue',
          scale: 0.5,
        })
          .setLngLat([position.coords.longitude, position.coords.latitude])
          .addTo(this.map);

        // Add a source and layer for the circle
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

        this.map.addLayer({
          id: 'circle-layer',
          type: 'circle',
          source: 'circle-source',
          paint: {
            'circle-radius': 50,
            'circle-color': '#0000ff',
            'circle-opacity': 0.2,
          },
        });
      },
      (error) => {
        console.error('Geolocation error:', error);
        // Handle errors appropriately
      },
      {
        enableHighAccuracy: true, // Use high accuracy
        timeout: 5000,
        maximumAge: 0,
      },
    );
  }
}
