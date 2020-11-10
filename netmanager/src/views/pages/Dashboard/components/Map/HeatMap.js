import React, { useState, useEffect } from "react";
import { Map as LeafletMap, Marker, Popup, TileLayer } from "react-leaflet";
import HeatmapLayer from "react-leaflet-heatmap-layer";
import { heatmapPredictApi } from "../../../../apis/predict";
import FullscreenControl from "react-leaflet-fullscreen";


// values calculated by dividing x by 500. x for each category [0, 12, 35.4, 55.4, 150.4, 250, 500] respectively
// const heatMapGradient = {
//   0: "#797979",
//   0.024: "#44e527",
//   0.0708: "#f8fe39",
//   0.1108: "#ee8327",
//   0.3008: "#fe0023",
//   0.5: "#8639c0",
//   1: "#81202e",
// };

// values calculated by dividing x by 250. x for each category [0, 12, 35.4, 55.4, 150.4, 250] respectively
const heatMapGradient = {
  0: "#44e527",
  0.048: "#f8fe39",
  0.1416: "#ee8327",
  0.2216: "#fe0023",
  0.6016: "#8639c0",
  1: "#81202e",
};

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
        gradient={heatMapGradient}
        longitudeExtractor={(marker) => marker.long}
        latitudeExtractor={(marker) => marker.lat}
        intensityExtractor={(marker) => parseFloat(marker.mean)}
      />
      <FullscreenControl position="topright" />
    </LeafletMap>
  );
};

export default HeatMap;
