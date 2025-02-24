import {
  ADD_POLYGON_SHAPE_SUCCESS,
  LOAD_ACTIVE_COHORT_DETAILS_SUCCESS,
  LOAD_ACTIVE_COHORT_SUCCESS,
  LOAD_ACTIVE_GRID_DETAILS_SUCCESS,
  LOAD_ACTIVE_GRID_SUCCESS,
  LOAD_ALL_COHORTS_SUCCESS,
  LOAD_ALL_GRIDS_SUCCESS,
  LOAD_COHORTS_SUMMARY_SUCCESS,
  LOAD_COMBINED_GRIDS_AND_COHORTS_SUMMARY_SUCCESS,
  LOAD_GRIDS_SUMMARY_SUCCESS
} from './actions';

const initialState = {
  combinedGridAndCohortsSummary: {},
  selectedGridSites: {},
  activeGrid: {
    name: 'Empty'
  },
  activeGridDetails: {},
  activeCohort: {
    name: 'Empty'
  },
  activeCohortDetails: {},
  polygonShape: {
    type: '',
    coordinates: []
  },
  grids: [],
  cohorts: [],
  gridsSummary: [],
  cohortsSummary: []
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
    case ADD_POLYGON_SHAPE_SUCCESS:
      return { ...state, polygonShape: action.payload };
    case LOAD_ALL_GRIDS_SUCCESS:
      return { ...state, grids: action.payload };
    case LOAD_ALL_COHORTS_SUCCESS:
      return { ...state, cohorts: action.payload };
    case LOAD_GRIDS_SUMMARY_SUCCESS:
      return { ...state, gridsSummary: action.payload };
    case LOAD_COHORTS_SUMMARY_SUCCESS:
      return { ...state, cohortsSummary: action.payload };
    default:
      return state;
  }
}
