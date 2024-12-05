/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import PropTypes from 'prop-types';
import usrsStateConnector from 'views/stateConnectors/usersStateConnector';
import ErrorBoundary from 'views/ErrorBoundary/ErrorBoundary';
import { useDispatch, useSelector } from 'react-redux';
import { isEmpty } from 'underscore';
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
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(0);
  const activeNetwork = useSelector((state) => state.accessControl.activeNetwork);

  const fetchUsers = async (page, limit) => {
    if (!activeNetwork) return;
    setLoading(true);
    try {
      const res = await getAvailableNetworkUsersListApi(activeNetwork._id, {
        page: page + 1, // API expects 1-based pages
        limit
      });
      setUsers(res.available_users);
      setTotalCount(res.total || 0);
    } catch (error) {
      let errorMessage = 'An error occurred';
      if (error.response?.status >= 500) {
        errorMessage = 'An error occurred. Please try again later';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
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
    fetchUsers(currentPage, pageSize);
  }, [activeNetwork]);

  const handlePageChange = (newPage, newPageSize) => {
    setCurrentPage(newPage);
    setPageSize(newPageSize);
    fetchUsers(newPage, newPageSize);
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
            currentPage={currentPage}
            onPageChange={handlePageChange}
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
