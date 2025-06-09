"use client";

import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { setPolygon } from "@/core/redux/slices/gridsSlice";

// Import CSS
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

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
  layer: {
    toGeoJSON: () => {
      geometry: {
        type: "Polygon" | "MultiPolygon";
        coordinates: number[][][];
      };
    };
  };
}

// Type for edit events
interface EditEvent {
  layers: {
    eachLayer: (callback: (layer: {
      toGeoJSON: () => {
        geometry: {
          type: "Polygon" | "MultiPolygon";
          coordinates: number[][][];
        };
      };
    }) => void) => void;
  };
}

type LeafletModule = typeof import('leaflet');
type ReactLeafletModule = typeof import('react-leaflet');
type LeafletDrawModule = typeof import('react-leaflet-draw');

interface MapComponentsType {
  MapContainer: ReactLeafletModule['MapContainer'];
  TileLayer: ReactLeafletModule['TileLayer'];
  FeatureGroup: ReactLeafletModule['FeatureGroup'];
  EditControl: LeafletDrawModule['EditControl'];
  L: LeafletModule;
}

const PolygonMap: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  const [MapComponents, setMapComponents] = useState<MapComponentsType | null>(null);
  const dispatch = useDispatch();
  const ZOOM_LEVEL = 10;

  useEffect(() => {
    const setupMap = async () => {
      if (typeof window !== 'undefined') {
        const L = (await import('leaflet')).default;
        const { MapContainer, TileLayer, FeatureGroup } = await import('react-leaflet');
        const { EditControl } = await import('react-leaflet-draw');

        // Fix Leaflet's default icon issue
        delete (L.Icon.Default.prototype as { _getIconUrl?: string })._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });

        setMapComponents({ MapContainer, TileLayer, FeatureGroup, EditControl, L });
        setIsClient(true);
      }
    };

    setupMap();
  }, []);

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
      const geoJson = layer.toGeoJSON();
      const transformedCoordinates = geoJson.geometry.coordinates.map((ring: number[][]) => 
        ring.map((point: number[]) => [point[1], point[0]] as [number, number])
      );
      dispatch(
        setPolygon({
          type: geoJson.geometry.type as "Polygon" | "MultiPolygon",
          coordinates: transformedCoordinates,
        })
      );
    }
  };

  const _edited = (e: EditEvent): void => {
    const { layers } = e;
    layers.eachLayer((layer: { toGeoJSON: () => { geometry: { type: "Polygon" | "MultiPolygon"; coordinates: number[][][]; }; }; }) => {
      if (MapComponents?.L.Polygon && layer instanceof MapComponents.L.Polygon) {
        const geoJson = layer.toGeoJSON();
        const transformedCoordinates = geoJson.geometry.coordinates.map((ring: number[][]) => 
          ring.map((point: number[]) => [point[1], point[0]] as [number, number])
        );
        dispatch(
          setPolygon({
            type: geoJson.geometry.type as "Polygon" | "MultiPolygon",
            coordinates: transformedCoordinates,
          })
        );
      }
    });
  };

  if (!isClient || !MapComponents) {
    return (
      <div className="h-[400px] w-full bg-muted rounded-md overflow-hidden opacity-80 flex items-center justify-center">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  const { MapContainer, TileLayer, FeatureGroup, EditControl } = MapComponents;

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
