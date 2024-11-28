import React from 'react';
import { Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';

export const withPermission = (Component, requiredPermission) => {
  const WithPermission = (props) => {
    const currentRole = useSelector((state) => state.accessControl.currentRole);

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
