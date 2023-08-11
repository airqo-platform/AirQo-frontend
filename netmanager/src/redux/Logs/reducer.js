import { LOAD_ACTIVE_SERVICE_SUCCESS, LOAD_LOGS_SUCCESS } from './actions';

const initialState = {
  logs: [],
  activeService: ''
};

export default function logsReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_LOGS_SUCCESS:
      return { ...state, logs: action.payload };
    case LOAD_ACTIVE_SERVICE_SUCCESS:
      return { ...state, activeService: action.payload };
    default:
      return state;
  }
}
