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
import { fetchNetworkUsers } from '../../../redux/AccessControl/operations';

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
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);

  // Use Redux state instead of local state
  const { users, total, loading } = useSelector((state) => state.accessControl.networkUsers);
  const roles = useSelector((state) => state.accessControl.rolesSummary);
  const activeNetwork = useSelector((state) => state.accessControl.activeNetwork);

  useEffect(() => {
    if (!activeNetwork) return;
    try {
      dispatch(loadRolesSummary(activeNetwork._id));
      dispatch(
        fetchNetworkUsers(activeNetwork._id, {
          skip: page * pageSize,
          limit: pageSize
        })
      );
    } catch (error) {
      console.error('Error fetching network users:', error);
    }
  }, [activeNetwork]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    try {
      dispatch(
        fetchNetworkUsers(activeNetwork._id, {
          skip: newPage * pageSize,
          limit: pageSize
        })
      );
    } catch (error) {
      console.error('Error fetching network users:', error);
    }
  };

  const handleRowsPerPageChange = (newPageSize) => {
    setPageSize(newPageSize);
    setPage(0);
    try {
      dispatch(
        fetchNetworkUsers(activeNetwork._id, {
          skip: 0,
          limit: newPageSize
        })
      );
    } catch (error) {
      console.error('Error fetching network users:', error);
    }
  };

  return (
    <ErrorBoundary>
      <div className={classes.root}>
        <UsersToolbar roles={roles} />
        <div className={classes.content}>
          <UsersTable
            roles={roles}
            users={users || []}
            loadData={loading}
            totalCount={total || 0}
            pageSize={pageSize || 100}
            currentPage={page || 0}
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
