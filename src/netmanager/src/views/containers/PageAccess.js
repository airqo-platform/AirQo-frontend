import React from 'react';
import { Redirect } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { PERMISSIONS } from '../../constants/permissions';
import { hasPermission } from '../../utils/permissions';

export const withPermission = (Component, requiredPermission) => {
  const WithPermission = (props) => {
    let currentRole = useSelector((state) => state.accessControl.currentRole);

    if (!currentRole) {
      currentRole = JSON.parse(localStorage.getItem('currentUserRole'));
    }

    const userHasPermission = currentRole && currentRole.role_permissions 
      ? hasPermission(currentRole.role_permissions, requiredPermission)
      : false;

    if (!userHasPermission) {
      return <Redirect to="/permission-denied" />;
    }

    return <Component {...props} />;
  };

  return WithPermission;
};
