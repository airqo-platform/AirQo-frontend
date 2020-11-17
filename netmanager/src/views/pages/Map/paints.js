export const heatMapPaint = {
  // Size circle radius by earthquake magnitude and zoom level
  // "circle-radius": [
  //   "interpolate",
  //   ["linear"],
  //   ["zoom"],
  //   7,
  //   ["interpolate", ["linear"], ["get", "mag"], 1, 1, 6, 4],
  //   16,
  //   ["interpolate", ["linear"], ["get", "mag"], 1, 5, 6, 50],
  // ],
  "circle-radius": 15,
  // Color circle by earthquake magnitude
  // "circle-color": [
  //   "interpolate",
  //   ["linear"],
  //   ["get", "mag"],
  //   1,
  //   "rgba(33,102,172,0)",
  //   2,
  //   "rgb(103,169,207)",
  //   3,
  //   "rgb(209,229,240)",
  //   4,
  //   "rgb(253,219,199)",
  //   5,
  //   "rgb(239,138,98)",
  //   6,
  //   "rgb(178,24,43)",
  // ],
  "circle-color": "rgb(178,24,43)",
  "circle-stroke-color": "white",
  "circle-stroke-width": 0,
  // Transition from heatmap to circle layer by zoom level
  "circle-opacity": 0.7,
  "circle-blur": 2,
  // "circle-opacity": ["interpolate", ["linear"], ["zoom"], 7, 0, 8, 1],
};
