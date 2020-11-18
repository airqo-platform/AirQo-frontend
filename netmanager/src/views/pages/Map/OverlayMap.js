import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import { heatmapPredictApi } from "views/apis/predict";
import { getMonitoringSitesInfoApi } from "views/apis/analytics";
import { heatMapPaint } from "./paints";
import { transformDataToGeoJson } from "./utils";
import { formatDateString } from "utils/dateTime";
import Filter from "../Dashboard/components/Map/Filter";

// css
import "assets/css/overlay-map.css";

const markerDetails = {
  0: ["marker-unknown", "UnCategorised"],
  0.0000000001: ["marker-good", "Good"],
  12.1: ["marker-moderate", "Moderate"],
  35.5: ["marker-uhfsg", "Unhealthy for sensitive groups"],
  55.5: ["marker-unhealthy", "Unhealthy"],
  150.5: ["marker-v-unhealthy", "VeryUnhealthy"],
  250.5: ["marker-hazardous", "Harzadous"],
};

const getMarkerDetail = (markerValue) => {
  let keys = Object.keys(markerDetails);
  // in-place reverse sorting
  keys.sort((key1, key2) => -(key1 - key2));

  for (let i = 0; i < keys.length; i++) {
    if (markerValue >= keys[i]) {
      return markerDetails[keys[i]];
    }
  }
  return ["marker-unknown", "UnCategorised"];
};

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_TOKEN;

const MapToggleController = ({ controls }) => {
  return (
    <div className="map-toggle-controller">
      {controls.map((control, index) => (
        <span
          className={`control-item ${
            control.active ? "" : "control-item-disabled"
          }`}
          onClick={control.toggleState}
          key={index}
        >
          {control.label}
        </span>
      ))}
    </div>
  );
};

export const OverlayMap = ({
  center,
  zoom,
  heatMapData,
  monitoringSiteData,
}) => {
  const mapContainerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [showSensors, setShowSensors] = useState(true);
  const [showHeatMap, setShowHeatMap] = useState(true);

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      // style: "mapbox://styles/mapbox/streets-v11",
      style: "mapbox://styles/mapbox/dark-v10",
      center,
      zoom,
      maxZoom: 18,
    });
    map.addControl(
      new mapboxgl.FullscreenControl({ container: mapContainerRef.current }),
      "bottom-right"
    );
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

    map.on("click", async () => {
      console.log("zoom", map.getZoom());
    });

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

  const toggleSensors = () => {
    try {
      const markers = document.getElementsByClassName("marker");
      for (let i = 0; i < markers.length; i++) {
        markers[i].style.visibility = !showSensors ? "visible" : "hidden";
      }
      setShowSensors(!showSensors);
      // eslint-disable-next-line no-empty
    } catch (err) {}
  };

  const toggleHeatMap = () => {
    try {
      map.setLayoutProperty(
        "circular-points-layer",
        "visibility",
        !showHeatMap ? "visible" : "none"
      );
      setShowHeatMap(!showHeatMap);
      // eslint-disable-next-line no-empty
    } catch (err) {}
  };

  return (
    <div className="overlay-map-container" ref={mapContainerRef}>
      {showSensors &&
        map &&
        monitoringSiteData.features.forEach((feature) => {
          const [markerClass, desc] = getMarkerDetail(
            feature.properties.Last_Hour_PM25_Value
          );

          const el = document.createElement("div");
          el.className = `marker ${markerClass}`;
          el.innerText = feature.properties.Last_Hour_PM25_Value;

          new mapboxgl.Marker(el)
            .setLngLat(feature.geometry.coordinates)
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(
                `<div>
                    <div>${feature.properties.Parish} - ${
                  feature.properties.Division
                } Division</div>
                    <span>${feature.properties.LocationCode}</span>
                    <div class="${"popup-body " + markerClass}"> AQI: ${
                  feature.properties.Last_Hour_PM25_Value
                } - ${desc}</div>
                    <span>Last Refreshed: ${formatDateString(
                      feature.properties.LastHour
                    )} (EAT)</span>
                </div>`
              )
            )
            .addTo(map);
        })}
      <Filter fetchFilteredData={monitoringSiteData.features} />
      {map && (
        <MapToggleController
          controls={[
            {
              label: "sensor",
              active: showSensors,
              toggleState: toggleSensors,
            },
            {
              label: "heatmap",
              active: showHeatMap,
              toggleState: toggleHeatMap,
            },
          ]}
        />
      )}
    </div>
  );
};

const MapContainer = () => {
  const [heatMapData, setHeatMapData] = useState(
    transformDataToGeoJson([], { longitude: "long", latitude: "lat" })
  );
  const [monitoringSiteData, setMonitoringSiteMapData] = useState(
    transformDataToGeoJson([], { longitude: "Longitude", latitude: "Latitude" })
  );

  useEffect(() => {
    const locationData = {
      min_long: 32.4,
      max_long: 32.8,
      min_lat: 0.1,
      max_lat: 0.5,
    };
    getMonitoringSitesInfoApi("")
      .then((responseData) => {
        setMonitoringSiteMapData(
          transformDataToGeoJson(responseData.airquality_monitoring_sites, {
            longitude: "Longitude",
            latitude: "Latitude",
          })
        );
      })
      .catch((err) => {});
    heatmapPredictApi(locationData)
      .then((responseData) => {
        setHeatMapData(
          transformDataToGeoJson(responseData.data || [], {
            longitude: "long",
            latitude: "lat",
          })
        );
      })
      .catch((err) => {});
  }, []);

  return (
    <div>
      <OverlayMap
        center={[32.5600613, 0.3341424]}
        zoom={11}
        heatMapData={heatMapData}
        monitoringSiteData={monitoringSiteData}
      />
    </div>
  );
};

export default MapContainer;
