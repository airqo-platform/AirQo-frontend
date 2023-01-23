// eslint-disable-next-line import/named
import { GET_INVOLVED_REGISTRATION_SUCCESS, SHOW_GET_INVOLVED_MODAL_SUCCESS, UPDATE_GET_INVOLVED_DATA_SUCCESS } from './actions';

const initialState = {
  openModal: false,
  category: '',
  complete: false,
  slide: 0,
  firstName: null,
  lastName: null,
  email: null,
  acceptedTerms: false,
};

export default function (state = initialState, action) {
  switch (action.type) {
    case GET_INVOLVED_REGISTRATION_SUCCESS:
      return { ...state, complete: true };

    case SHOW_GET_INVOLVED_MODAL_SUCCESS:
      return { ...state, ...action.payload };

    case UPDATE_GET_INVOLVED_DATA_SUCCESS:
      return { ...state, ...action.payload };

    default:
      return state;
  }
}
