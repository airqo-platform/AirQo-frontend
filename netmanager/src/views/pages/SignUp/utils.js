import { omit } from "underscore";

export const isFormFullyFilled = (state, msg) => {
  let errors = {};
  let testState = omit(state, "errors", "isChecked");

  Object.keys(testState).forEach((key) => {
    if (testState[key] === "") {
      errors[key] = msg || `${key} is required`;
    }
  });
  return errors;
};
