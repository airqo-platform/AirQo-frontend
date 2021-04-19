/**
 *  Function to transform data to GeoJSON data format
 *  @param {Object[]} data - data to be transformed
 *  @param {Object} coordinates - Object indicating coordinate keys within the data
 *  @param {function} [coordinateGetter] - function that extracts and returns the coordinates [longitude, latitude] from a feature
 */
export const transformDataToGeoJson = (
  data,
  { longitude, latitude, ...rest },
  coordinateGetter
) => {
  let features = [];
  data.map((feature) => {
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
