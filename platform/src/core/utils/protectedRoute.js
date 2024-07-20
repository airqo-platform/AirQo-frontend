import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { resetStore } from '@/lib/store/services/account/LoginSlice';
import { resetChecklist } from '@/lib/store/services/checklists/CheckData';
import { resetAllTasks } from '@/lib/store/services/checklists/CheckList';
import { resetChartStore } from '@/lib/store/services/charts/ChartSlice';
import { clearIndividualPreferences } from '@/lib/store/services/account/UserDefaultsSlice';

export default function withAuth(Component) {
  return function WithAuthComponent(props) {
    const storedUserGroup = localStorage.getItem('activeGroup');

    const dispatch = useDispatch();
    const router = useRouter();
    const userCredentials = useSelector((state) => state.login);

    useEffect(() => {
      if (!userCredentials.success) {
        router.push('/account/login');
      }
    }, [userCredentials]);

    useEffect(() => {
      if (!storedUserGroup ) {
        localStorage.clear();
        dispatch(resetStore());
        dispatch(resetChartStore());
        dispatch(clearIndividualPreferences());
        dispatch(resetAllTasks());
        dispatch(resetChecklist());
        router.push('/account/login');
      }
    }, [storedUserGroup]);

    return userCredentials.success && <Component {...props} />;
  };
}

export const withPermission = (Component, requiredPermission) => {
  const WithPermission = (props) => {
    const storedUserGroup = localStorage.getItem('activeGroup');
    const parsedUserGroup = storedUserGroup ? JSON.parse(storedUserGroup) : {};
    const currentRole = parsedUserGroup && parsedUserGroup.role;
    const router = useRouter();

    // Check if the user has the required permission
    const hasPermission =
      currentRole &&
      currentRole?.role_permissions?.some(
        (permission) => permission.permission === requiredPermission,
      );

    if (!hasPermission) {
      // If the user doesn't have permission, redirect to a "permission denied" page
      router.push('/permission-denied');
      return null;
    }

    // If the user has permission, render the requested component
    return <Component {...props} />;
  };

  return WithPermission;
};

export const checkAccess = (requiredPermission) => {
  if (requiredPermission) {
    const storedGroupObj = localStorage.getItem('activeGroup');
    const currentRole = storedGroupObj ? JSON.parse(storedGroupObj).role : {};

    const permissions =
      currentRole &&
      currentRole.role_permissions &&
      currentRole.role_permissions.map((item) => item.permission);

    return permissions && permissions.includes(requiredPermission);
  }
};
