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
  let delta: number = Math.abs(moment.utc(new Date()).valueOf() - moment.utc(new Date(dateTimeStr)).valueOf()) / 1000;
  const seconds = delta;
  const result: { [key: string]: number } = {};
  const structure = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1
  } as const;

  type StructureKey = keyof typeof structure;

  Object.keys(structure).forEach(function (key) {
    const typedKey = key as StructureKey;
    result[typedKey] = Math.floor(delta / structure[typedKey]);
    delta -= result[typedKey] * structure[typedKey];
  });

  return [seconds, result];
};
