import { UPDATE_ORGANIZATION_SUCCESS, RESET_ORGANIZATION_SUCCESS } from "../types";

const initialOrgState = { name: "" };

export default function (state = initialOrgState, action) {
  switch (action.type) {
    case RESET_ORGANIZATION_SUCCESS:
      return initialOrgState;
    case UPDATE_ORGANIZATION_SUCCESS:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
