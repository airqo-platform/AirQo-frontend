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
  const [limit, setLimit] = useState(10);
  const [skip, setSkip] = useState(0);
  const activeNetwork = useSelector((state) => state.accessControl.activeNetwork);

  const fetchUsers = async (skipCount, limitCount) => {
    if (!activeNetwork) return;
    setLoading(true);
    try {
      const res = await getAvailableNetworkUsersListApi(activeNetwork._id, {
        skip: skipCount,
        limit: limitCount
      });
      setUsers(res.available_users);
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
        <div className={classes.content}>
          <AvailableUsersTable
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

AvailableUserList.propTypes = {
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  userState: PropTypes.object.isRequired
};

const userStateConnector = usrsStateConnector(AvailableUserList);

export default withPermission(userStateConnector, 'CREATE_UPDATE_AND_DELETE_NETWORK_USERS');
