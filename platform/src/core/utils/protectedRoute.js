import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { resetStore } from '@/lib/store/services/account/LoginSlice';
import { updateUserChecklists, resetChecklist } from '@/lib/store/services/checklists/CheckData';
import { resetAllTasks } from '@/lib/store/services/checklists/CheckList';
import { resetChartStore } from '@/lib/store/services/charts/ChartSlice';
import { clearIndividualPreferences } from '@/lib/store/services/account/UserDefaultsSlice';

// Custom hook to handle user inactivity
const useIdleTimer = (action, idleTime) => {
  useEffect(() => {
    let timer;
    const handleUserActivity = () => {
      clearTimeout(timer);
      timer = setTimeout(action, idleTime);
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
    };
  }, [action, idleTime]);
};

export default function withAuth(Component) {
  return function WithAuthComponent(props) {
    const dispatch = useDispatch();
    const router = useRouter();
    const userInfo = useSelector((state) => state.login.userInfo);
    const userCredentials = useSelector((state) => state.login);
    const cardCheckList = useSelector((state) => state.cardChecklist.cards);

    const logout = async () => {
      const action = await dispatch(
        updateUserChecklists({
          user_id: userInfo._id,
          items: cardCheckList,
        }),
      );

      // Check the status of the updateUserChecklists request
      if (updateUserChecklists.rejected.match(action)) {
        setIsLoading(false);
        return;
      }

      localStorage.clear();
      dispatch(resetStore());
      dispatch(resetChartStore());
      dispatch(clearIndividualPreferences());
      dispatch(resetAllTasks());
      dispatch(resetChecklist());
      router.push('/account/login');
    };

    // Use custom hook to handle user inactivity
    useIdleTimer(logout, 1800000);

    useEffect(() => {
      if (!userCredentials.success) {
        router.push('/account/login');
      }
    }, [userCredentials]);

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

    return permissions.includes(requiredPermission);
  }
};
