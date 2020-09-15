import { LOAD_USER_DEFAULT_GRAPHS_SUCCESS } from "../actions";

const initialUserDefaultGraphsState = [
  {
    pollutant: "PM 2.5",
    frequency: "daily",
    chartType: "line",
    chartTitle: "Mean Daily PM 2.5 for Kawempe division",
    locations: [
      "Bwaise II",
      "Kyebando",
      "Komamboga",
      "Kazo Angola",
      "Wandegeya",
    ],
  },
  {
    pollutant: "PM 2.5",
    frequency: "daily",
    chartType: "line",
    chartTitle: "Mean Daily PM 2.5 for Lubaga division",
    locations: ["Namirembe", "Kawala", "Lubya", "Nakulabye", "Mutundwe"],
  },
  {
    pollutant: "PM 2.5",
    frequency: "daily",
    chartType: "line",
    chartTitle: "Mean Daily PM 2.5 for Makindye division",
    locations: ["Kibuye I", "Nsambya Central", "Kisugu", "Ggaba"],
  },
  {
    pollutant: "PM 2.5",
    frequency: "daily",
    chartType: "line",
    chartTitle: "Mean Daily PM 2.5 for Nakawa division",
    locations: ["Nakawa", "Kiswa", "Luzira", "Naguru I", "Kyanja"],
  },
];

const filterState = (newValues, state) => {
  if (newValues.length >= 4) {
    return newValues;
  }
  state.filter((element) => {
    const index = 0;

    while (index < newValues.length) {
      if (element.chartTitle === newValues[0].chartTitle) {
        return false;
      }
    }
    return true;
  });

  return [...newValues, ...state];
};

export default function (state = initialUserDefaultGraphsState, action) {
  switch (action.type) {
    case LOAD_USER_DEFAULT_GRAPHS_SUCCESS:
      return filterState(action.payload, state);
    default:
      return state;
  }
}
