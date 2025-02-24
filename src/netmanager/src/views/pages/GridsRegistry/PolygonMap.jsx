import React, { useState } from 'react';

import L from 'leaflet';
import { Map, TileLayer, FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';
import { useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import { useDispatch } from 'react-redux';
import { loadPolygon } from 'redux/Analytics/operations';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png'
});

const PolygonMap = () => {
  const dispatch = useDispatch();
  const [center, setCenter] = useState({ lat: 0.347596, lng: 32.58252 });
  const ZOOM_LEVEL = 10;
  const mapRef = useRef();

  const _created = (e) => {
    let type = e.layerType;
    let layer = e.layer;

    if (type === 'polygon') {
      dispatch(
        loadPolygon({
          type: layer.toGeoJSON().geometry.type,
          coordinates: layer.toGeoJSON().geometry.coordinates
        })
      );
    }
  };

  const _edited = (e) => {
    let type = e.layerType;
    let layer = e.layer;

    if (type === 'polygon') {
      dispatch(
        loadPolygon({
          type: type,
          coordinates: layer.toGeoJSON().geometry.coordinates
        })
      );
    }
  };

  const styles = {
    backgroundColor: '#FFF',
    zIndex: 999,
    position: 'relative',
    height: '400px',
    width: '100%',
    opacity: 0.8
  };

  return (
    <>
      <div className="row" style={styles}>
        <div className="col text-center">
          <div className="col">
            <Map center={center} zoom={ZOOM_LEVEL} ref={mapRef}>
              <FeatureGroup>
                <EditControl
                  position="topright"
                  onCreated={_created}
                  onEdited={_edited}
                  draw={{
                    rectangle: false,
                    circle: false,
                    circlemarker: false,
                    polyline: false,
                    marker: false
                  }}
                />
              </FeatureGroup>
              <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
              />
            </Map>
          </div>
        </div>
      </div>
    </>
  );
};

export default PolygonMap;
