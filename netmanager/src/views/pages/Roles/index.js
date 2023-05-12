/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import RolesTable from './components/RolesTable';
import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';
import { useDispatch, useSelector } from 'react-redux';
import { updateMainAlert } from 'redux/MainAlert/operations';
import { isEmpty } from 'underscore';
import RolesToolbar from './components/RolesToolbar';
import { getNetworkPermissionsApi } from '../../apis/accessControl';
import { loadRolesSummary } from 'redux/AccessControl/operations';
import { withPermission } from '../../containers/PageAccess';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3)
  },
  content: {
    marginTop: theme.spacing(2)
  }
}));

const Roles = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const [permissions, setPermissions] = useState(null);
  const [loading, setLoading] = useState(false);
  const roles = useSelector((state) => state.accessControl.rolesSummary);

  useEffect(() => {
    setLoading(true);
    if (isEmpty(roles)) {
      const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));
      if (!isEmpty(activeNetwork)) {
        dispatch(loadRolesSummary(activeNetwork._id));
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));
    if (!isEmpty(activeNetwork)) {
      getNetworkPermissionsApi(activeNetwork._id)
        .then((res) => {
          setPermissions(res.permissions);
        })
        .catch((error) => {
          dispatch(
            updateMainAlert({
              message: error.response && error.response.data && error.response.data.message,
              show: true,
              severity: 'error'
            })
          );
        });
    }
  }, []);

  return (
    <ErrorBoundary>
      <div className={classes.root}>
        <RolesToolbar permissions={permissions && permissions} />
        <div className={classes.content}>
          <RolesTable loading={loading} roles={roles} permissions={permissions && permissions} />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default withPermission(Roles, 'CREATE_UPDATE_AND_DELETE_NETWORK_ROLES');
