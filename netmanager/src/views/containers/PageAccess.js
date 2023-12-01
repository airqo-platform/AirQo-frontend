import React from 'react';
import { Redirect } from 'react-router-dom';

export const withPermission = (Component, requiredPermission) => {
  const WithPermission = (props) => {
    const currentRole = JSON.parse(localStorage.getItem('currentUserRole'));

    let hasPermission = false;
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
