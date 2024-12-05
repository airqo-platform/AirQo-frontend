/* eslint-disable */
import React, { useState } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import {
  Card,
  Avatar,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Paper
} from '@material-ui/core';
import { getInitials } from 'utils/users';
import { formatDateString } from 'utils/dateTime';
import { isEmpty } from 'underscore';
import { useDispatch, useSelector } from 'react-redux';
import { assignUserNetworkApi } from '../../../../apis/accessControl';
import { updateMainAlert } from 'redux/MainAlert/operations';
import { fetchAvailableNetworkUsers } from 'redux/AccessControl/operations';
import { createAlertBarExtraContentFromObject } from 'utils/objectManipulators';
import UsersListBreadCrumb from '../Breadcrumb';
import usersStateConnector from '../../../../stateConnectors/usersStateConnector';
import {
  FirstPage as FirstPageIcon,
  KeyboardArrowLeft,
  KeyboardArrowRight,
  LastPage as LastPageIcon
} from '@material-ui/icons';
import { IconButton } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {},
  content: {
    padding: 0
  },
  inner: {
    minWidth: 1050
  },
  nameContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  avatar: {
    marginRight: theme.spacing(2)
  },
  actions: {
    justifyContent: 'flex-end'
  },
  tableContainer: {
    maxHeight: 440
  }
}));

const AvailableUsersTable = (props) => {
  const {
    className,
    users,
    loadData,
    totalCount,
    pageSize,
    currentPage,
    onPageChange,
    onChangeRowsPerPage,
    ...rest
  } = props;
  const dispatch = useDispatch();
  const [isLoading, setLoading] = useState(false);
  const classes = useStyles();
  const activeNetwork = useSelector((state) => state.accessControl.activeNetwork);

  const submitEditUser = (user) => {
    setLoading(true);
    const userID = user._id;
    // assign user to network
    if (!isEmpty(activeNetwork) && !isEmpty(userID)) {
      assignUserNetworkApi(activeNetwork._id, userID)
        .then((response) => {
          dispatch(fetchAvailableNetworkUsers(activeNetwork._id));
          dispatch(
            updateMainAlert({
              message: 'User successfully added to the organisation. Check in assigned users table',
              show: true,
              severity: 'success'
            })
          );
          setLoading(false);
        })
        .catch((error) => {
          const errors = error.response && error.response.data && error.response.data.errors;
          dispatch(
            updateMainAlert({
              message: error.response && error.response.data && error.response.data.message,
              show: true,
              severity: 'error',
              extra: createAlertBarExtraContentFromObject(errors || {})
            })
          );
          setLoading(false);
        });
    }
    setLoading(false);
  };

  return (
    <>
      <UsersListBreadCrumb category={'Users'} usersTable={'Available Users'} />
      <Card {...rest} className={clsx(classes.root, className)}>
        <Paper>
          <TableContainer>
            <Table aria-label="available users table">
              <TableHead>
                <TableRow>
                  <TableCell>Full Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loadData ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : !isEmpty(users) ? (
                  users.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <div className={classes.nameContainer}>
                          <Avatar className={classes.avatar} src={user.profilePicture}>
                            {getInitials(`${user.firstName} ${user.lastName}`)}
                          </Avatar>
                          <Typography variant="body1">
                            {user.firstName} {user.lastName}
                          </Typography>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.userName}</TableCell>
                      <TableCell>
                        {user.createdAt ? formatDateString(user.createdAt) : '---'}
                      </TableCell>
                      <TableCell>
                        <Button
                          color="primary"
                          onClick={() => submitEditUser(user)}
                          disabled={isLoading}
                        >
                          Assign User
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      No users available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={totalCount}
            page={currentPage}
            rowsPerPage={pageSize}
            rowsPerPageOptions={[5, 10, 25]}
            onPageChange={onPageChange}
            onRowsPerPageChange={onChangeRowsPerPage}
            ActionsComponent={(props) => (
              <TablePaginationActions {...props} onPageChange={onPageChange} />
            )}
          />
        </Paper>
      </Card>
    </>
  );
};

function TablePaginationActions(props) {
  const { count, page, rowsPerPage, onPageChange } = props;
  console.log('TablePaginationActions props:', {
    count,
    page,
    rowsPerPage,
    hasOnPageChange: !!onPageChange
  });

  const handleFirstPageButtonClick = (event) => {
    if (onPageChange) {
      onPageChange(event, 0);
    }
  };

  const handleBackButtonClick = (event) => {
    if (onPageChange) {
      onPageChange(event, page - 1);
    }
  };

  const handleNextButtonClick = (event) => {
    console.log('Next button clicked, current page:', page);
    console.log('onPageChange exists:', !!onPageChange);
    if (onPageChange) {
      console.log('Calling onPageChange with:', page + 1);
      onPageChange(event, page + 1);
    }
  };

  const handleLastPageButtonClick = (event) => {
    if (onPageChange) {
      onPageChange(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
    }
  };

  return (
    <div style={{ flexShrink: 0, marginLeft: 20 }}>
      <IconButton
        onClick={handleFirstPageButtonClick}
        disabled={page === 0}
        aria-label="first page"
      >
        <FirstPageIcon />
      </IconButton>
      <IconButton onClick={handleBackButtonClick} disabled={page === 0} aria-label="previous page">
        <KeyboardArrowLeft />
      </IconButton>
      <IconButton
        onClick={handleNextButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="next page"
      >
        <KeyboardArrowRight />
      </IconButton>
      <IconButton
        onClick={handleLastPageButtonClick}
        disabled={page >= Math.ceil(count / rowsPerPage) - 1}
        aria-label="last page"
      >
        <LastPageIcon />
      </IconButton>
    </div>
  );
}

TablePaginationActions.propTypes = {
  count: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired
};

AvailableUsersTable.propTypes = {
  className: PropTypes.string,
  auth: PropTypes.object.isRequired,
  users: PropTypes.array.isRequired,
  loadData: PropTypes.bool,
  totalCount: PropTypes.number,
  pageSize: PropTypes.number,
  currentPage: PropTypes.number,
  onPageChange: PropTypes.func,
  onChangeRowsPerPage: PropTypes.func
};

export default usersStateConnector(AvailableUsersTable);
