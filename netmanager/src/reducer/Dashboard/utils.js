import { isEmpty } from "underscore";

export const filterDefaults = (newValues, defaults) => {
  if (isEmpty(newValues)) {
    return defaults;
  }

  if (newValues.length >= defaults.length) {
    return newValues;
  }
  const newDefaults = defaults.filter((element) => {
    let index = 0;

    while (index < newValues.length) {
      if (element.chartTitle === newValues[index].chartTitle) {
        return false;
      }
      index++;
    }
    return true;
  });

  return [...newValues, ...newDefaults];
};
