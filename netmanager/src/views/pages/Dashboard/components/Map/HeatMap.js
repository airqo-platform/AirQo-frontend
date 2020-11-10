import React, { useState, useEffect } from "react";
import { Map as LeafletMap, Marker, Popup, TileLayer } from "react-leaflet";
import HeatmapLayer from "react-leaflet-heatmap-layer";
import { heatmapPredictApi } from "../../../../apis/predict";
import FullscreenControl from "react-leaflet-fullscreen";

const HeatMap = () => {
  const [heatMapData, setHeatMapData] = useState([]);

  useEffect(() => {
    const locationData = {
      min_long: 32.4,
      max_long: 32.8,
      min_lat: 0.1,
      max_lat: 0.5,
    };
    heatmapPredictApi(locationData).then((responseData) => {
      setHeatMapData(responseData.data || []);
    });
  }, []);

  return (
    <LeafletMap
      animate
      attributionControl
      center={[0.3341424, 32.5600613]}
      doubleClickZoom
      dragging
      easeLinearity={0.35}
      scrollWheelZoom
      zoom={12}
      zoomControl
    >
      <TileLayer
        url="http://{s}.tile.osm.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      />
      <HeatmapLayer
        fitBoundsOnLoad
        fitBoundsOnUpdate
        points={heatMapData}
        longitudeExtractor={(marker) => marker.long}
        latitudeExtractor={(marker) => marker.lat}
        intensityExtractor={(marker) => parseFloat(marker.mean)}
      />
      <FullscreenControl position="topright" />
    </LeafletMap>
  );
};

export default HeatMap;
