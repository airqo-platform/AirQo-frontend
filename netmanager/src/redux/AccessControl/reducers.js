import { LOAD_ALL_USER_ROLES_SUCCESS, LOAD_CURRENT_USER_ROLE_SUCCESS } from './actions';

const initialState = {
  userRoles: null,
  currentRole: {}
};

export default function accessControlReducer(state = initialState, action) {
  switch (action.type) {
    case LOAD_ALL_USER_ROLES_SUCCESS:
      return { ...state, userRoles: action.payload };
    case LOAD_CURRENT_USER_ROLE_SUCCESS:
      return { ...state, currentRole: action.payload };
    default:
      return state;
  }
}
