import { omit } from "underscore";

export const isFormFullyFilled = (state) => {
  let errors = {};
  let testState = omit(state, "errors", "isChecked");

  Object.keys(testState).forEach((key) => {
    if (testState[key] === "") {
      errors[key] = `${key} is required`;
    }
  });
  return errors;
};
