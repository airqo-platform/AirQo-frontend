import { clone as _clone, each as _each } from "underscore";

export const dropEmpty = (obj) => {
  let clone = _clone(obj);
  _each(clone, function (v, k) {
    if (typeof v !== "boolean" && !v) {
      delete clone[k];
    }
  });
  return clone;
};

export const mergeErrorObjects = (errorsArr, { errorKey, errorMsgKey }) => {
  const mergedError = {};
  errorsArr.map((error) => {
    mergedError[error[errorKey]] = error[errorMsgKey];
  });
  return mergedError;
};

export const createAlertBarExtraContent = (arr, callback) => {
  const extra = [];
  arr.map((value, key) => extra.push(callback(value, key)));
  return extra;
};
