import { EXPLORE_DATA_REQUEST_SUCCESS, UPDATE_EXPLORE_DATA_SUCCESS, SHOW_EXPLORE_DATA_MODAL_SUCCESS } from './actions';

const initialState = {
  userType: {
    individual: false,
    organization: false,
  },
  category: "",
  firstName: null,
  lastName: null,
  long_organization: null,
  jobTitle: null,
  email: null,
  success: false,
  openModal: false
};

export default function (state = initialState, action) {
  switch (action.type) {
    case EXPLORE_DATA_REQUEST_SUCCESS:
      return { ...state, ...action.payload };
    case UPDATE_EXPLORE_DATA_SUCCESS:
      return { ...state, ...action.payload };
    case SHOW_EXPLORE_DATA_MODAL_SUCCESS:
      return {...state, ...action.payload}
    default:
      return state;
  }
}
