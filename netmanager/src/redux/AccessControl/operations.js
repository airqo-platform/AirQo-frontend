import { addUserRoleApi, getUserRolesApi } from '../../views/apis/accessControl';
import { LOAD_ALL_USER_ROLES_FAILURE, LOAD_ALL_USER_ROLES_SUCCESS } from './actions';
import { isEmpty } from 'underscore';

export const loadUserRoles = () => async (dispatch) => {
  return await getUserRolesApi()
    .then((resData) => {
      if (isEmpty(resData.roles || [])) return;
      dispatch({
        type: LOAD_ALL_USER_ROLES_SUCCESS,
        payload: resData.roles
      });
    })
    .catch((err) => {
      dispatch({
        type: LOAD_ALL_USER_ROLES_FAILURE,
        payload: err
      });
    });
};
