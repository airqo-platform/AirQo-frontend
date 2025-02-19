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
      features.forEach({
        type: "Feature",
        properties: { ...rest, ...feature },
        geometry: {
          type: "Point",
          coordinates: (coordinateGetter && coordinateGetter(feature)) || [
            feature[longitude] || 0,
            feature[latitude] || 0,
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

export const ConvertToGeojson=(data: any)=>{
        return {
                type: "FeatureCollection" as const,
                features: data.measurements.map((item: any) => ({
                        type: "Feature",
                        geometry: {
                                type: "Point",
                                coordinates: [
                                      item.siteDetails.approximate_longitude, 
                                      item.siteDetails.approximate_latitude
                              ]
                                },
                                properties: {
                                        id: item._id,
                                        site_id:item.site_id,
                                        time: new Date(item.time).toLocaleDateString("en-US", {
                                              weekday: "long",
                                              year: "numeric",
                                              month: "long",
                                              day: "numeric"
                                            }),
                                        location_name:item.siteDetails.name,
                                        aqi_category: item.aqi_category,
                                        aqi_color:item.aqi_color.startsWith("#") ? item.aqi_color : `#${item.aqi_color}`,
                                        value:item.pm2_5 ?.value??0,
                                        }
                                        }))
                                        }


        }