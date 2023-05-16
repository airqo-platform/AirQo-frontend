/* eslint-disable */
import React, { useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';
import PropTypes from 'prop-types';
import usrsStateConnector from 'views/stateConnectors/usersStateConnector';
import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';
import { useDispatch, useSelector } from 'react-redux';
import { isEmpty } from 'underscore';
import { withPermission } from '../../containers/PageAccess';
import AvailableUsersTable from './components/UsersTable/AvailableUsersTable';
import { fetchAvailableNetworkUsers } from 'redux/AccessControl/operations';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3)
  },
  content: {
    marginTop: theme.spacing(2)
  }
}));

const AvailableUserList = (props) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const users = useSelector((state) => state.accessControl.availableUsers);
  const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));

  useEffect(() => {
    if (!isEmpty(activeNetwork)) {
      // fetch available users
      dispatch(fetchAvailableNetworkUsers(activeNetwork._id));
    }
  }, []);

  return (
    <ErrorBoundary>
      <div className={classes.root}>
        <div className={classes.content}>
          <AvailableUsersTable users={users} />
        </div>
      </div>
    </ErrorBoundary>
  );
};

AvailableUserList.propTypes = {
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  userState: PropTypes.object.isRequired
};

const userStateConnector = usrsStateConnector(AvailableUserList);

export default withPermission(userStateConnector, 'CREATE_UPDATE_AND_DELETE_NETWORK_USERS');
