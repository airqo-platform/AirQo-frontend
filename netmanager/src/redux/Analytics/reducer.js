import {
  LOAD_ACTIVE_GRID_SUCCESS,
  LOAD_COMBINED_GRIDS_AND_COHORTS_SUMMARY_SUCCESS
} from './actions';

const initialState = {
  combinedGridAndCohortsSummary: {},
  selectedGridSites: {},
  activeGrid: {}
};

export default function (state = initialState, action) {
  switch (action.type) {
    case LOAD_COMBINED_GRIDS_AND_COHORTS_SUMMARY_SUCCESS:
      return { ...state, combinedGridAndCohortsSummary: action.payload };
    case LOAD_ACTIVE_GRID_SUCCESS:
      return { ...state, activeGrid: action.payload };
    default:
      return state;
  }
}
