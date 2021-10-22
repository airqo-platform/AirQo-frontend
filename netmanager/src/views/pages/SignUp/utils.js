import { omit } from "underscore";

export const containsEmptyValues = (obj) => {
  const keys = Object.keys(obj);

  for (let i = 0; i < keys.length; i++) {
    if (obj[keys[i]]) return false;
  }
  return true;
};

export const isFormFullyFilled = (state, msg) => {
  let errors = {};
  let testState = omit(state, "errors", "isChecked");

  Object.keys(testState).forEach((key) => {
    if (testState[key] === "") {
      errors[key] = msg || `This field is required`;
    }
  });
  return errors;
};
