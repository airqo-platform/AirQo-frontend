import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import mapboxgl from 'mapbox-gl';
import LayerIcon from '@/icons/map/layerIcon';
import RefreshIcon from '@/icons/map/refreshIcon';
import ShareIcon from '@/icons/map/shareIcon';
import { CustomGeolocateControl, CustomZoomControl } from './components/MapControls';
import { setCenter, setZoom } from '@/lib/store/services/map/MapSlice';
import LayerModal from './components/LayerModal';
import MapImage from '@/images/map/dd1.png';
import Loader from '@/components/Spinner';

const mapStyles = [
  { url: 'mapbox://styles/mapbox/streets-v11', name: 'Streets', image: MapImage },
  // { url: 'mapbox://styles/mapbox/outdoors-v11', name: 'Outdoors' },
  { url: 'mapbox://styles/mapbox/light-v10', name: 'Light', image: MapImage },
  { url: 'mapbox://styles/mapbox/dark-v10', name: 'Dark', image: MapImage },
  { url: 'mapbox://styles/mapbox/satellite-v9', name: 'Satellite', image: MapImage },
  // { url: 'mapbox://styles/mapbox/satellite-streets-v11', name: 'Satellite Streets' },
];

const initialState = {
  center: {
    latitude: 0.3201412790664193,
    longitude: 32.56389785939493,
  },
  zoom: 13,
};

const AirQoMap = ({ customStyle, mapboxApiAccessToken, showSideBar }) => {
  const dispatch = useDispatch();
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const dropdownRef = useRef(null);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v11');
  const [isOpen, setIsOpen] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const urls = new URL(window.location.href);
  const urlParams = new URLSearchParams(urls.search);
  const mapdata = useSelector((state) => state.map);

  const lat = urlParams.get('lat');
  const lng = urlParams.get('lng');
  const zm = urlParams.get('zm');

  useEffect(() => {
    if (mapRef.current && mapdata.center.latitude && mapdata.center.longitude) {
      mapRef.current.flyTo({
        center: [mapdata.center.longitude, mapdata.center.latitude],
        zoom: mapdata.zoom,
        essential: true,
      });
    }
  }, [mapdata.center, mapdata.zoom]);

  useEffect(() => {
    mapboxgl.accessToken = mapboxApiAccessToken;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: mapStyle,
      center: [lng || mapdata.center.longitude, lat || mapdata.center.latitude],
      zoom: zm || mapdata.zoom,
    });

    mapRef.current = map;

    // Add controls upon map load
    map.on('load', () => {
      map.resize();

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
      dispatch(setCenter(initialState.center));
      dispatch(setZoom(initialState.zoom));
    };
  }, [mapStyle, mapboxApiAccessToken]);

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
    // setRefresh(!refresh);
  };

  const shareLocation = () => {
    try {
      const map = mapRef.current;
      const center = map.getCenter();
      const zoom = map.getZoom();
      const currentUrl = window.location.href;

      // Construct URL with labeled parameters
      const url = new URL(currentUrl);
      url.searchParams.set('lat', center.lat.toFixed(4));
      url.searchParams.set('lng', center.lng.toFixed(4));
      url.searchParams.set('zm', zoom.toFixed(2));

      navigator.clipboard.writeText(url.toString());

      alert('Location URL copied to clipboard');
    } catch (error) {
      console.error('Error sharing location', error);
    }
  };

  return (
    <div className='relative w-auto h-auto'>
      {/* Map */}
      <div ref={mapContainerRef} className={customStyle} />
      {/* Loader */}
      {refresh && (
        <div
          className={`absolute inset-0 flex items-center justify-center z-40 ${
            showSideBar ? 'ml-96' : ''
          }`}>
          <div className='bg-white w-[70px] h-[70px] flex justify-center items-center rounded-md shadow-md'>
            <span className='ml-2'>
              <Loader width={32} height={32} />
            </span>
          </div>
        </div>
      )}
      {/* Map control buttons */}
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
              <LayerModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                mapStyles={mapStyles}
                showSideBar={showSideBar}
                onStyleSelect={(style) => {
                  setMapStyle(style.url);
                }}
              />
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
    </div>
  );
};

export default AirQoMap;
