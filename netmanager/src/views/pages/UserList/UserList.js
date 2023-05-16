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
import { loadRolesSummary, fetchNetworkUsers } from 'redux/AccessControl/operations';
import { withPermission } from '../../containers/PageAccess';

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
  const dispatch = useDispatch();
  const roles = useSelector((state) => state.accessControl.rolesSummary);
  const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));

  useEffect(() => {
    if (isEmpty(roles)) {
      if (!isEmpty(activeNetwork)) {
        dispatch(loadRolesSummary(activeNetwork._id));
      }
    }
  }, []);

  useEffect(() => {
    if (!isEmpty(activeNetwork)) {
      dispatch(fetchNetworkUsers(activeNetwork._id));
    }
  }, []);

  return (
    <ErrorBoundary>
      <div className={classes.root}>
        <UsersToolbar roles={roles} />
        <div className={classes.content}>
          <UsersTable roles={roles} />
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

const userStateConnector = usrsStateConnector(UserList);

export default withPermission(userStateConnector, 'CREATE_UPDATE_AND_DELETE_NETWORK_USERS');
