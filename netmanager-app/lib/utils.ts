import { Measurement } from "@/app/types/devices";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const stripTrailingSlash = (url: string) => {
  return url.replace(/\/$/, "");
};

export const transformDataToGeoJson = (
  data: Measurement[],
  { longitude, latitude, ...rest }: { longitude: string; latitude: string },
  coordinateGetter?: (feature: Measurement) => [number, number],
  filter: (feature: Measurement) => boolean = () => true
) => {
  const features: {
    type: "Feature";
    properties: unknown;
    geometry: { type: "Point"; coordinates: [number, number] };
  }[] = [];
  data.map((feature) => {
    if (filter(feature)) {
      features.push({
        type: "Feature",
        properties: { ...rest, ...feature },
        geometry: {
          type: "Point",
          coordinates: (coordinateGetter && coordinateGetter(feature)) || [
            feature[longitude],
            feature[latitude],
          ],
        },
      });
    }
  });

  return {
    type: "FeatureCollection",
    features,
  };
};
