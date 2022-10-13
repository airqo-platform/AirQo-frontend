export const transformArray = (arr, key) => {
  const state = {};
  arr.map((item) => {
    state[item[key]] = item;
  });
  return state;
};

export const stripTrailingSlash = (url) => {
  return url.replace(/\/$/, '');
};
