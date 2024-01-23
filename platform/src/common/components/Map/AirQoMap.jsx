import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';

const AirQoMap = ({
  latitude = 37.783333,
  longitude = -122.416667,
  zoom = 11,
  style,
  mapboxApiAccessToken,
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/streets-v11');

  const styles = [
    'mapbox://styles/mapbox/streets-v11',
    'mapbox://styles/mapbox/outdoors-v11',
    'mapbox://styles/mapbox/light-v10',
    'mapbox://styles/mapbox/dark-v10',
    'mapbox://styles/mapbox/satellite-v9',
    'mapbox://styles/mapbox/satellite-streets-v11',
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

    // Add navigation control (the +/- zoom buttons)
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    map.on('load', () => {
      // Add the user location button
      const geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true,
        },
        trackUserLocation: true,
      });

      // Add the control to the map.
      map.addControl(geolocate, 'top-right');

      geolocate.on('geolocate', (e) => {
        console.log('A geolocate event has occurred.', e);
      });
    });

    return () => {
      map.remove();
    };
  }, [mapStyle]);

  const refreshMap = () => {
    const map = mapRef.current;
    map.setStyle(map.getStyle());
  };

  const shareLocation = () => {
    const map = mapRef.current;
    const center = map.getCenter();
    const url = `https://www.google.com/maps/search/?api=1&query=${center.lat},${center.lng}`;
    alert(`Share this link: ${url}`);
  };

  return (
    <>
      <div ref={mapContainerRef} className={style} />
      <div className='absolute bottom-4 right-4'>
        {styles.map((style, index) => (
          <button key={index} onClick={() => setMapStyle(style)}>
            Style {index + 1}
          </button>
        ))}
        <button onClick={refreshMap}>Refresh Map</button>
        <button onClick={shareLocation}>Share Location</button>
      </div>
    </>
  );
};

export default AirQoMap;
