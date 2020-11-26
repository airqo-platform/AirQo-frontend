export const transformDataToGeoJson = (
  data,
  { longitude, latitude, ...rest }
) => {
  let features = [];
  data.map((feature) => {
    features.push({
      type: "Feature",
      properties: { ...rest, ...feature },
      geometry: {
        type: "Point",
        coordinates: [feature[longitude], feature[latitude]],
      },
    });
  });

  return {
    type: "FeatureCollection",
    features,
  };
};
