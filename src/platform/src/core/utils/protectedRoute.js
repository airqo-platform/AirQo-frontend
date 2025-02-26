import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import LogoutUser from '@/core/utils/LogoutUser';

export default function withAuth(Component) {
  return function WithAuthComponent(props) {
    const dispatch = useDispatch();
    const router = useRouter();
    const userCredentials = useSelector((state) => state.login);

    useEffect(() => {
      if (typeof window !== 'undefined') {
        const storedUserGroup = localStorage.getItem('activeGroup');

        if (!userCredentials.success) {
          router.push('/account/login');
        }

        if (!storedUserGroup) {
          LogoutUser(dispatch, router);
        }
      }
    }, [userCredentials, dispatch, router]);

    // Render the component if the user is authenticated
    return userCredentials.success ? <Component {...props} /> : null;
  };
}

export const withPermission = (Component, requiredPermission) => {
  return function WithPermission(props) {
    const router = useRouter();

    useEffect(() => {
      if (typeof window !== 'undefined') {
        const storedUserGroup = localStorage.getItem('activeGroup');
        const parsedUserGroup = storedUserGroup
          ? JSON.parse(storedUserGroup)
          : {};
        const currentRole = parsedUserGroup?.role;

        const hasPermission = currentRole?.role_permissions?.some(
          (permission) => permission.permission === requiredPermission,
        );

        if (!hasPermission) {
          router.push('/permission-denied');
        }
      }
    }, [requiredPermission, router]);

    return <Component {...props} />;
  };
};

export const checkAccess = (requiredPermission) => {
  if (requiredPermission && typeof window !== 'undefined') {
    const storedGroupObj = localStorage.getItem('activeGroup');
    const currentRole = storedGroupObj ? JSON.parse(storedGroupObj).role : null;

    const permissions = currentRole?.role_permissions?.map(
      (item) => item.permission,
    );

    return permissions?.includes(requiredPermission) ?? false;
  }
  return false;
};
