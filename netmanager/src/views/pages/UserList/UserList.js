/* eslint-disable */
import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import PropTypes from 'prop-types';
import usrsStateConnector from 'views/stateConnectors/usersStateConnector';
import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';

import UsersTable from './components/UsersTable';
import UsersToolbar from './components/UsersToolbar';
import { useDispatch, useSelector } from 'react-redux';
import { isEmpty } from 'underscore';
import { loadUserRoles, fetchNetworkUsers } from 'redux/AccessControl/operations';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3)
  },
  content: {
    marginTop: theme.spacing(2)
  }
}));

const UserList = (props) => {
  const classes = useStyles();

  const users = useSelector((state) => state.accessControl.networkUsers);
  const dispatch = useDispatch();
  const roles = useSelector((state) => state.accessControl.userRoles);

  useEffect(() => {
    if (isEmpty(roles)) {
      dispatch(loadUserRoles());
    }
  }, []);

  useEffect(() => {
    const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));
    if (!isEmpty(activeNetwork)) {
      dispatch(fetchNetworkUsers(activeNetwork._id));
    }
  }, []);

  return (
    <ErrorBoundary>
      <div className={classes.root}>
        <UsersToolbar roles={roles} />
        <div className={classes.content}>
          <UsersTable users={users} />
        </div>
      </div>
    </ErrorBoundary>
  );
};

UserList.propTypes = {
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  userState: PropTypes.object.isRequired
};

export default usrsStateConnector(UserList);
