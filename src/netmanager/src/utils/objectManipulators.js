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

export const createAlertBarExtraContentFromObject = (obj) => {
  const extra = [];

  Object.entries(obj).forEach(([key, value]) => {
    if (typeof value === 'string') {
      extra.push(`${key} - ${value}`);
    } else if (typeof value === 'object' && value !== null) {
      const message = value.msg || value.message || JSON.stringify(value);
      extra.push(`${key} - ${message}`);
    } else {
      extra.push(`${key} - ${String(value)}`);
    }
  });

  return extra;
};

