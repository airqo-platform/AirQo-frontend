/**
 *  Function to transform data to GeoJSON data format
 *  @param {Object[]} data - data to be transformed
 *  @param {Object} coordinates - Object indicating coordinate keys within the data
 *  @param {function} [coordinateGetter] - function that extracts and returns the coordinates [longitude, latitude] from a feature
 *  @param {function} [filter] - function for filtering feature. Return true to all values
 */
export const transformDataToGeoJson = (
  data,
  { longitude, latitude, ...rest },
  coordinateGetter,
  filter = () => true
) => {
  let features = [];
  data.map((feature) => {
    filter(feature) &&
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
  });

  return {
    type: "FeatureCollection",
    features,
  };
};

export const lightMapStyle = "mapbox://styles/mapbox/light-v10";

export const darkMapStyle = "mapbox://styles/mapbox/dark-v10";

export const streetMapStyle = "mapbox://styles/mapbox/streets-v11";

export const satelliteMapStyle = "mapbox://styles/mapbox/satellite-v9";
