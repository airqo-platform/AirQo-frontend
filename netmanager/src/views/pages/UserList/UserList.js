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
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const roles = useSelector((state) => state.accessControl.rolesSummary);
  const activeNetwork = useSelector((state) => state.accessControl.activeNetwork);

  useEffect(() => {
    if (!activeNetwork) return;
    dispatch(loadRolesSummary(activeNetwork._id));
  }, []);

  const fetchUsers = async (skipCount, limitCount) => {
    console.log('fetchUsers called with:', { skipCount, limitCount });
    if (!activeNetwork) return;
    setLoading(true);
    try {
      const res = await getNetworkUsersListApi(activeNetwork._id, {
        skip: skipCount,
        limit: limitCount
      });
      console.log('API Response:', {
        users: res.assigned_users.length,
        total: res.total_assigned_users,
        skip: skipCount,
        limit: limitCount
      });
      setUsers(res.assigned_users);
      setTotalCount(res.total_assigned_users || 0);
    } catch (error) {
      console.error('Error fetching users:', error);
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
    if (!activeNetwork) return;
    dispatch(loadRolesSummary(activeNetwork._id));
    fetchUsers(page * pageSize, pageSize);
  }, [activeNetwork]);

  const handlePageChange = (event, newPage) => {
    console.log('UserList handlePageChange:', { currentPage: page, newPage });
    setPage(newPage);

    const skipCount = newPage * pageSize;
    console.log('Fetching users with:', { skipCount, pageSize });
    fetchUsers(skipCount, pageSize);
  };

  const handleRowsPerPageChange = (newPageSize) => {
    setPageSize(newPageSize);
    setPage(0);
    fetchUsers(0, newPageSize);
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
            pageSize={pageSize}
            currentPage={page}
            onPageChange={handlePageChange}
            onChangeRowsPerPage={handleRowsPerPageChange}
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
