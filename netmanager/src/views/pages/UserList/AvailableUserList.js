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
import { fetchAvailableNetworkUsers } from '../../../redux/AccessControl/operations';

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
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(100);

  // Use Redux state instead of local state
  const { users, total, loading } = useSelector((state) => state.accessControl.availableUsers);
  const activeNetwork = useSelector((state) => state.accessControl.activeNetwork);

  useEffect(() => {
    if (!activeNetwork) return;
    dispatch(
      fetchAvailableNetworkUsers(activeNetwork._id, {
        skip: page * pageSize,
        limit: pageSize
      })
    );
  }, [activeNetwork]);

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
    dispatch(
      fetchAvailableNetworkUsers(activeNetwork._id, {
        skip: newPage * pageSize,
        limit: pageSize
      })
    );
  };

  const handleRowsPerPageChange = (newPageSize) => {
    setPageSize(newPageSize);
    setPage(0);
    dispatch(
      fetchAvailableNetworkUsers(activeNetwork._id, {
        skip: 0,
        limit: newPageSize
      })
    );
  };

  return (
    <ErrorBoundary>
      <div className={classes.root}>
        <div className={classes.content}>
          <AvailableUsersTable
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

AvailableUserList.propTypes = {
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  userState: PropTypes.object.isRequired
};

const userStateConnector = usrsStateConnector(AvailableUserList);

export default withPermission(userStateConnector, 'CREATE_UPDATE_AND_DELETE_NETWORK_USERS');
