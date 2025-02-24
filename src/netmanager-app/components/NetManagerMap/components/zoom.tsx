import React, { useCallback } from 'react';
import GeoIcon from '@/public/icons//map/gpsIcon';
import PlusIcon from '@/public/icons/map/plusIcon';
import MinusIcon from '@/public/icons/map/minusIcon';
import { createRoot } from 'react-dom/client';
import mapboxgl from 'mapbox-gl';
import { setSelectedNode } from '@/lib/store/services/map/MapSlice';

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