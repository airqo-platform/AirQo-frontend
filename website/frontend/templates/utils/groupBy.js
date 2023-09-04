const groupBy = (arr, getKey) => arr.reduce((r, v) => {
  r[getKey(v)] = r[getKey(v)] || [];
  r[getKey(v)].push(v);
  return r;
}, Object.create(null));

export default groupBy;
