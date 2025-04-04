import React from "react";
import L from "leaflet";
import { MapContainer, TileLayer, FeatureGroup } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { useDispatch } from "react-redux";
import { setPolygon } from "@/core/redux/slices/gridsSlice";

// Extend Leaflet types to include _getIconUrl
interface IconDefault extends L.Icon {
  _getIconUrl?: string;
}

// Type for draw control options
interface DrawControlOptions {
  rectangle: boolean;
  circle: boolean;
  circlemarker: boolean;
  polyline: boolean;
  marker: boolean;
}

// Type for draw events
interface DrawEvent {
  layerType: string;
  layer: L.Layer;
}

// Type for edit events
interface EditEvent {
  layers: L.LayerGroup;
}

// Fix Leaflet's default icon issue
delete (L.Icon.Default.prototype as IconDefault)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const PolygonMap: React.FC = () => {
  const dispatch = useDispatch();
  const ZOOM_LEVEL = 10;

  const drawOptions: DrawControlOptions = {
    rectangle: false,
    circle: false,
    circlemarker: false,
    polyline: false,
    marker: false,
  };

  const _created = (e: DrawEvent): void => {
    const { layerType, layer } = e;
    if (layerType === "polygon") {
      const polygon = layer as L.Polygon;
      const geoJson = polygon.toGeoJSON();
      dispatch(
        setPolygon({
          type: geoJson.geometry.type,
          coordinates: geoJson.geometry.coordinates as [number, number][][] | [number, number][][][],
        })
      );
    }
  };

  const _edited = (e: EditEvent): void => {
    const { layers } = e;
    layers.eachLayer((layer: L.Layer) => {
      if (layer instanceof L.Polygon) {
        const geoJson = layer.toGeoJSON();
        dispatch(
          setPolygon({
            type: geoJson.geometry.type,
            coordinates: geoJson.geometry.coordinates as [number, number][][] | [number, number][][][],
          })
        );
      }
    });
  };

  return (
    <div className="h-[400px] w-full bg-muted rounded-md overflow-hidden opacity-80">
      <div className="w-full h-full relative">
        <MapContainer
          center={{ lat: 0.347596, lng: 32.58252 }}
          zoom={ZOOM_LEVEL}
          className="h-full w-full"
          scrollWheelZoom={false}
        >
          <FeatureGroup>
            <EditControl
              position="topright"
              onCreated={_created}
              onEdited={_edited}
              draw={drawOptions}
            />
          </FeatureGroup>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        </MapContainer>
      </div>
    </div>
  );
};

export default PolygonMap;
