import { LOAD_PUBLICATIONS_SUCCESS, LOAD_PUBLICATIONS_REQUEST } from './actions';

const initialState = {
  loading: false,
  publications: [],
  error: null
};

export default function (state = initialState, action) {
  switch (action.type) {
    case LOAD_PUBLICATIONS_REQUEST:
      return { ...state, loading: true, error: null };
    case LOAD_PUBLICATIONS_SUCCESS:
      return { ...state, loading: false, publications: action.payload };
    default:
      return state;
  }
}
