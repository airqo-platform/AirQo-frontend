import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import LayerIcon from '@/icons/map/layerIcon';
import RefreshIcon from '@/icons/map/refreshIcon';
import ShareIcon from '@/icons/map/shareIcon';
import { CustomGeolocateControl, CustomZoomControl } from './components/MapControls';

const AirQoMap = ({
  latitude = 0.3201412790664193,
  longitude = 32.56389785939493,
  zoom = 12,
  customStyle,
  mapboxApiAccessToken,
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const dropdownRef = useRef(null);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v11');
  const [isOpen, setIsOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  const mapStyles = [
    { url: 'mapbox://styles/mapbox/streets-v11', name: 'Streets' },
    { url: 'mapbox://styles/mapbox/outdoors-v11', name: 'Outdoors' },
    { url: 'mapbox://styles/mapbox/light-v10', name: 'Light' },
    { url: 'mapbox://styles/mapbox/dark-v10', name: 'Dark' },
    { url: 'mapbox://styles/mapbox/satellite-v9', name: 'Satellite' },
    { url: 'mapbox://styles/mapbox/satellite-streets-v11', name: 'Satellite Streets' },
  ];

  useEffect(() => {
    mapboxgl.accessToken = mapboxApiAccessToken;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center: [longitude, latitude],
      zoom: zoom,
    });

    mapRef.current = map;

    // Add controls upon map load
    map.on('load', () => {
      map.resize();

      setMapLoaded(true);

      try {
        const zoomControl = new CustomZoomControl();
        map.addControl(zoomControl, 'bottom-right');

        const geolocateControl = new CustomGeolocateControl();
        map.addControl(geolocateControl, 'bottom-right');
      } catch (error) {
        console.log('Error adding map controls', error);
      }
    });

    return () => {
      map.remove();
    };
  }, [mapStyle, mapboxApiAccessToken, refresh]);

  // generate code to close dropdown when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownRef]);

  const refreshMap = () => {
    const map = mapRef.current;
    map.setStyle(map.getStyle());
    setRefresh(!refresh);
    setMapLoaded(false);
  };

  const shareLocation = () => {
    try {
      const map = mapRef.current;
      const center = map.getCenter();
      const zoom = map.getZoom();
      const url = `https://www.openstreetmap.org/#map=${zoom}/${center.lat}/${center.lng}`;
      navigator.clipboard.writeText(url);

      alert('Location URL copied to clipboard');
    } catch (error) {
      console.log('Error sharing location', error);
    }
  };

  return (
    <>
      <div ref={mapContainerRef} className={customStyle} />
      {mapLoaded && (
        <div className='absolute top-4 right-0'>
          <div className='flex flex-col gap-4'>
            <div className='relative'>
              <div className='relative inline-block' ref={dropdownRef}>
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  title='Map Layers'
                  className='inline-flex items-center justify-center w-[50px] h-[50px] mr-2 text-white rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md'>
                  <LayerIcon />
                </button>
                {isOpen && (
                  <div className='origin-top-right absolute right-2 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5'>
                    <div
                      className='py-1 w-full'
                      role='menu'
                      aria-orientation='vertical'
                      aria-labelledby='options-menu'>
                      {mapStyles.map((style, index) => (
                        <button
                          key={index}
                          onClick={() => setMapStyle(style.url)}
                          className='block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                          role='menuitem'>
                          {style.name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={refreshMap}
              title='Refresh Map'
              className='inline-flex items-center justify-center w-[50px] h-[50px] mr-2 text-white rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md'>
              <RefreshIcon />
            </button>
            <button
              onClick={shareLocation}
              title='Share Location'
              className='inline-flex items-center justify-center w-[50px] h-[50px] text-white rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md'>
              <ShareIcon />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AirQoMap;
