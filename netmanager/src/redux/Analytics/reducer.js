import {
  LOAD_ACTIVE_COHORT_DETAILS_SUCCESS,
  LOAD_ACTIVE_COHORT_SUCCESS,
  LOAD_ACTIVE_GRID_DETAILS_SUCCESS,
  LOAD_ACTIVE_GRID_SUCCESS,
  LOAD_COMBINED_GRIDS_AND_COHORTS_SUMMARY_SUCCESS
} from './actions';

const initialState = {
  combinedGridAndCohortsSummary: {},
  selectedGridSites: {},
  activeGrid: {},
  activeGridDetails: {},
  activeCohort: {},
  activeCohortDetails: {}
};

export default function (state = initialState, action) {
  switch (action.type) {
    case LOAD_COMBINED_GRIDS_AND_COHORTS_SUMMARY_SUCCESS:
      return { ...state, combinedGridAndCohortsSummary: action.payload };
    case LOAD_ACTIVE_GRID_SUCCESS:
      return { ...state, activeGrid: action.payload };
    case LOAD_ACTIVE_GRID_DETAILS_SUCCESS:
      return { ...state, activeGridDetails: action.payload };
    case LOAD_ACTIVE_COHORT_SUCCESS:
      return { ...state, activeCohort: action.payload };
    case LOAD_ACTIVE_COHORT_DETAILS_SUCCESS:
      return { ...state, activeCohortDetails: action.payload };
    default:
      return state;
  }
}
