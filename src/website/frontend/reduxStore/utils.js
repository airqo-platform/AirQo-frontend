export const transformArray = (arr, key) => {
  const state = {};
  arr.map((item) => {
    state[item[key]] = item;
  });
  return state;
};
