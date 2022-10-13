import {
  UPDATE_ORGANIZATION_SUCCESS,
  RESET_ORGANIZATION_SUCCESS,
} from '../types';
import { LOGOUT_USER_SUCCESS } from 'redux/Join/types';

const initialOrgState = { name: '' };

export default function (state = initialOrgState, action) {
  switch (action.type) {
    case RESET_ORGANIZATION_SUCCESS:
      return initialOrgState;
    case UPDATE_ORGANIZATION_SUCCESS:
      return { ...state, ...action.payload };
    case LOGOUT_USER_SUCCESS:
      return initialOrgState;
    default:
      return state;
  }
}
