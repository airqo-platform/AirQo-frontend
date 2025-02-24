export const generatePaginateOptions = (arrLength) => {
  const multiple = 25;
  let options = [];
  let counter = 10;

  while (counter < arrLength) {
    options.push(counter);
    let newCounter = Math.floor(counter / multiple) * multiple + multiple;
    if (newCounter >= arrLength) {
      break;
    }
    counter = newCounter;
  }
  options.push(arrLength);

  return options;
};

export const getPaginationOptionIndexMapper = (paginationOptions) => {
  const pageMapper = {};
  paginationOptions.map((value, index) => {
    pageMapper[value] = index;
  });
  // give the last index a special value
  if (paginationOptions.length > 0) {
    pageMapper[paginationOptions[paginationOptions.length - 1]] = "last";
  }
  return pageMapper;
};

export const getPaginationOption = (index, paginationOptions) => {
  const defaultPaginationSize = 10;
  if (!index) {
    return defaultPaginationSize;
  }
  if (index === "last") {
    if (paginationOptions.length > 0) {
      return (
        paginationOptions[paginationOptions.length - 1] || defaultPaginationSize
      );
    }
  }
  return paginationOptions[index] || defaultPaginationSize;
};
