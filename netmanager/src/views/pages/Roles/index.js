/* eslint-disable */
import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import RolesTable from './components/RolesTable';
import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';
import { useDispatch, useSelector } from 'react-redux';
import { isEmpty } from 'underscore';
import { loadUserRoles } from '../../../redux/AccessControl/operations';
import RolesToolbar from './components/RolesToolbar';

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
  const roles = useSelector((state) => state.accessControl.userRoles);

  useEffect(() => {
    if (isEmpty(roles)) {
      dispatch(loadUserRoles());
    }
  }, []);

  return (
    <ErrorBoundary>
      <div className={classes.root}>
        <RolesToolbar />
        <div className={classes.content}>
          <RolesTable roles={roles} />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Roles;
