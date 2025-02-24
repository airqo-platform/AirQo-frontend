const _multiFilterFunc = (filter) => (item) => {
  for (let key in filter) {
    if (item[key] === undefined || item[key] !== filter[key]) return false;
  }
  return true;
};

export const multiFilter = (items, filter) => {
  return items.filter(_multiFilterFunc(filter));
};
