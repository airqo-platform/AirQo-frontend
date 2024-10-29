import {
  LOAD_DEFAULT_SITES_SUCCESS,
  LOAD_DEFAULT_SITES_FAILURE,
  SET_DEFAULT_SITES_SUCCESS,
  SET_DEFAULT_SITES_FAILURE,
  DELETE_DEFAULT_SITE_SUCCESS,
  DELETE_DEFAULT_SITE_FAILURE,
  UPDATE_DEFAULT_SITE_SUCCESS,
  UPDATE_DEFAULT_SITE_FAILURE
} from './actions';

const initialState = {
  sites: [],
  loading: false,
  error: null
};

export default function defaultSitePreferencesReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_DEFAULT_SITES_SUCCESS:
      return {
        ...state,
        sites: action.payload,
        error: null
      };

    case SET_DEFAULT_SITES_SUCCESS:
      return {
        ...state,
        sites: action.payload,
        error: null
      };

    case DELETE_DEFAULT_SITE_SUCCESS:
      return {
        ...state,
        sites: state.sites.filter((site) => site.site_id !== action.payload),
        error: null
      };

    case UPDATE_DEFAULT_SITE_SUCCESS:
      return {
        ...state,
        sites: state.sites.map((site) =>
          site.site_id === action.payload.site_id ? { ...site, ...action.payload } : site
        ),
        error: null
      };

    case LOAD_DEFAULT_SITES_FAILURE:
    case SET_DEFAULT_SITES_FAILURE:
    case DELETE_DEFAULT_SITE_FAILURE:
    case UPDATE_DEFAULT_SITE_FAILURE:
      return {
        ...state,
        error: action.payload
      };

    default:
      return state;
  }
}
