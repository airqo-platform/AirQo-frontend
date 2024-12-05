/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import PropTypes from 'prop-types';
import usrsStateConnector from 'views/stateConnectors/usersStateConnector';
import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';
import { useDispatch, useSelector } from 'react-redux';
import { withPermission } from '../../containers/PageAccess';
import AvailableUsersTable from './components/UsersTable/AvailableUsersTable';
import { getAvailableNetworkUsersListApi } from 'views/apis/accessControl';
import { updateMainAlert } from '../../../redux/MainAlert/operations';

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
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);
  const activeNetwork = useSelector((state) => state.accessControl.activeNetwork);

  const fetchUsers = async (skipCount, limitCount) => {
    console.log('fetchUsers called with:', { skipCount, limitCount });
    if (!activeNetwork) return;
    setLoading(true);
    try {
      const res = await getAvailableNetworkUsersListApi(activeNetwork._id, {
        skip: skipCount,
        limit: limitCount
      });
      console.log('API Response:', {
        users: res.available_users.length,
        total: res.total_available_users,
        skip: skipCount,
        limit: limitCount
      });
      setUsers(res.available_users);
      setTotalCount(res.total_available_users || 0);
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

  useEffect(() => {
    fetchUsers(page * pageSize, pageSize);
  }, [activeNetwork]);

  const handlePageChange = (event, newPage) => {
    console.log('AvailableUserList handlePageChange:', { currentPage: page, newPage });
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
        <div className={classes.content}>
          <AvailableUsersTable
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

AvailableUserList.propTypes = {
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  userState: PropTypes.object.isRequired
};

const userStateConnector = usrsStateConnector(AvailableUserList);

export default withPermission(userStateConnector, 'CREATE_UPDATE_AND_DELETE_NETWORK_USERS');
