import { useSelector } from 'react-redux';

export const useUserRolesData = () => {
  return useSelector((state) => state.accessControl.userRoles);
};
