/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import PropTypes from 'prop-types';
import usrsStateConnector from 'views/stateConnectors/usersStateConnector';
import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';

import UsersTable from './components/UsersTable';
import UsersToolbar from './components/UsersToolbar';
import { useDispatch, useSelector } from 'react-redux';
import { loadRolesSummary } from 'redux/AccessControl/operations';
import { withPermission } from '../../containers/PageAccess';
import { getNetworkUsersListApi } from 'views/apis/accessControl';
import { updateMainAlert } from 'redux/MainAlert/operations';

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
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [limit, setLimit] = useState(10);
  const [skip, setSkip] = useState(0);
  const roles = useSelector((state) => state.accessControl.rolesSummary);
  const activeNetwork = useSelector((state) => state.accessControl.activeNetwork);

  useEffect(() => {
    if (!activeNetwork) return;
    dispatch(loadRolesSummary(activeNetwork._id));
  }, []);

  const fetchUsers = async (skipCount, limitCount) => {
    if (!activeNetwork) return;
    setLoading(true);
    try {
      const res = await getNetworkUsersListApi(activeNetwork._id, {
        skip: skipCount,
        limit: limitCount
      });
      setUsers(res.assigned_users);
      setTotalCount(res.total || 0);
    } catch (error) {
      let errorMessage = 'An error occurred';
      if (error.response && error.response.status >= 500) {
        errorMessage = 'An error occurred. Please try again later';
      } else if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      dispatch(
        updateMainAlert({
          message: errorMessage,
          show: true,
          severity: 'error'
        })
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchUsers(skip, limit);
  }, [activeNetwork]);

  const handlePageChange = (page, pageSize) => {
    const newSkip = page * pageSize;
    setSkip(newSkip);
    setLimit(pageSize);
    fetchUsers(newSkip, pageSize);
  };

  return (
    <ErrorBoundary>
      <div className={classes.root}>
        <UsersToolbar roles={roles} />
        <div className={classes.content}>
          <UsersTable
            roles={roles}
            users={users}
            loadData={loading}
            totalCount={totalCount}
            pageSize={limit}
            currentPage={skip / limit}
            onPageChange={handlePageChange}
          />
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
