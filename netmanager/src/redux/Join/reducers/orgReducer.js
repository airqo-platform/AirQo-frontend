import { UPDATE_ORGANIZATION_SUCCESS } from "../types";

const initialOrgState = { name: "KCCA" };

export default function (state = initialOrgState, action) {
  switch (action.type) {
    case UPDATE_ORGANIZATION_SUCCESS:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
