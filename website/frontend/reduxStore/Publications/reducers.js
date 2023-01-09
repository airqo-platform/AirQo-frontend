import { LOAD_PUBLICATIONS_SUCCESS } from "./actions";

const initialState = {
  loading: false,
  publications: []
};

export default function (state = initialState, action) {
  switch (action.type) {
    case LOAD_PUBLICATIONS_SUCCESS:
      return { ...state, publications: action.payload };

    default:
      return state;
  }
}
