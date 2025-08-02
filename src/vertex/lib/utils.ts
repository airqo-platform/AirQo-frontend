import { Measurement } from "@/app/types/devices";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import moment from "moment";

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

export const getElapsedDurationMapper = (dateTimeStr: string) => {
  let delta = Math.abs(moment.utc(new Date()) - moment.utc(new Date(dateTimeStr))) / 1000;
  const seconds = delta;
  const result = {};
  const structure = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  };

  Object.keys(structure).forEach(function (key) {
    result[key] = Math.floor(delta / structure[key]);
    delta -= result[key] * structure[key];
  });

  return [seconds, result];
};
