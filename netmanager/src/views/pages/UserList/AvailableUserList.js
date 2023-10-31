/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import PropTypes from 'prop-types';
import usrsStateConnector from 'views/stateConnectors/usersStateConnector';
import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';
import { useDispatch } from 'react-redux';
import { isEmpty } from 'underscore';
import { withPermission } from '../../containers/PageAccess';
import AvailableUsersTable from './components/UsersTable/AvailableUsersTable';
import { getAvailableNetworkUsersListApi } from 'views/apis/accessControl';

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
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));

  useEffect(() => {
    if (!isEmpty(activeNetwork)) {
      setLoading(true);
      getAvailableNetworkUsersListApi(activeNetwork._id)
        .then((res) => {
          setUsers(res.available_users);
        })
        .catch((error) => {
          dispatch(
            updateMainAlert({
              message: error.response?.data?.message,
              show: true,
              severity: 'error'
            })
          );
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, []);

  return (
    <ErrorBoundary>
      <div className={classes.root}>
        <div className={classes.content}>
          <AvailableUsersTable users={users} loadData={loading} />
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
