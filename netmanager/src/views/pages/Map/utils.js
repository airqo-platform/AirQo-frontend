export const transformDataToGeoJson = (data) => {
  let features = [];
  data.map((feature) => {
    features.push({
      type: "Feature",
      properties: { ...feature },
      geometry: {
        type: "Point",
        coordinates: [feature.long, feature.lat],
      },
    });
  });

  return {
    type: "FeatureCollection",
    features,
  };
};
