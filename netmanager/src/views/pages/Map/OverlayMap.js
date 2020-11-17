import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import { heatmapPredictApi } from "views/apis/predict";
import { heatMapPaint } from "./paints";
import { transformDataToGeoJson } from "./utils";

// css
import "assets/css/map.css";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

export const OverlayMap = ({ center, zoom, heatMapData }) => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);

  console.log("heatmap data", heatMapData);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      // style: "mapbox://styles/mapbox/streets-v11",
      style: "mapbox://styles/mapbox/dark-v10",
      center,
      zoom,
    });
    map.addControl(new mapboxgl.NavigationControl(), "bottom-right");

    map.on("load", () => {
      map.addSource("heatmap-data", {
        type: "geojson",
        data: heatMapData,
      });
      map.addLayer({
        id: "circular-points-layer",
        source: "heatmap-data",
        type: "circle",
        paint: heatMapPaint,
      });
    });

    // map.on("moveend", async () => {
    //   map.getSource("heatmap-data").setData(heatMapData);
    // });

    setMap(map);

    // clean up on unmount
    return () => map.remove();
  }, []);

  useEffect(() => {
    if (map) {
      map.getSource("heatmap-data") &&
        map.getSource("heatmap-data").setData(heatMapData);
    }
  });

  return <div className="overlay-map-container" ref={mapContainerRef} />;
};

const MapContainer = () => {
  const [heatMapData, setHeatMapData] = useState(transformDataToGeoJson([]));

  useEffect(() => {
    const locationData = {
      min_long: 32.4,
      max_long: 32.8,
      min_lat: 0.1,
      max_lat: 0.5,
    };
    heatmapPredictApi(locationData).then((responseData) => {
      setHeatMapData(transformDataToGeoJson(responseData.data || []));
    });
  }, []);

  return (
    <div>
      <OverlayMap
        center={[32.5600613, 0.3341424]}
        zoom={9}
        heatMapData={heatMapData}
      />
    </div>
  );
};

export default MapContainer;
