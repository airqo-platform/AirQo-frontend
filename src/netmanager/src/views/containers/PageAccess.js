import React from 'react';
import { Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { PERMISSIONS } from '../../constants/permissions';

export const withPermission = (Component, requiredPermission) => {
  const WithPermission = (props) => {
    let currentRole = useSelector((state) => state.accessControl.currentRole);

    let hasPermission = false;

    if (!currentRole) {
      currentRole = JSON.parse(localStorage.getItem('currentUserRole'));
    }

    if (currentRole && currentRole.role_permissions) {
      hasPermission = currentRole.role_permissions.some(
        (permission) => permission.permission === requiredPermission
      );
    }

    if (!hasPermission) {
      return <Redirect to="/permission-denied" />;
    }

    return <Component {...props} />;
  };

  return WithPermission;
};
