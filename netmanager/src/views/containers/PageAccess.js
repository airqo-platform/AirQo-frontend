import React from 'react';
import { Redirect } from 'react-router-dom';

export const withPermission = (Component, requiredPermission) => {
  const WithPermission = (props) => {
    const currentRole = JSON.parse(localStorage.getItem('currentUserRole'));

    // Check if the user has the required permission
    const hasPermission =
      currentRole &&
      currentRole?.role_permissions?.some(
        (permission) => permission.permission === requiredPermission
      );

    if (!hasPermission) {
      // If the user doesn't have permission, redirect to a "permission denied" page
      return <Redirect to="/permission-denied" />;
    }

    // If the user has permission, render the requested component
    return <Component {...props} />;
  };

  return WithPermission;
};
