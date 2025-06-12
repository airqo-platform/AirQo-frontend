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
  features: Measurement[],
  coordinateGetter?: (feature: Measurement) => [number, number]
): GeoJSON.FeatureCollection => {
  return {
    type: "FeatureCollection",
    features: features.map((feature) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: (coordinateGetter && coordinateGetter(feature)) || [
          feature.siteDetails.approximate_longitude || 0,
          feature.siteDetails.approximate_latitude || 0,
        ],
      },
      properties: feature,
    })),
  };
};
