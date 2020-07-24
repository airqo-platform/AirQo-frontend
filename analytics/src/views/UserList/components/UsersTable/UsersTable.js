/* eslint-disable */
import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import moment from 'moment';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { makeStyles } from '@material-ui/styles';
import {
  Card,
  CardActions,
  CardContent,
  Avatar,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  TablePagination,
  Button,
  Modal,
  Dialog,
  Switch,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions
} from '@material-ui/core';

import { Alert, AlertTitle } from '@material-ui/lab';

import { Check, CheckCircleOutline } from '@material-ui/icons';

import { connect } from 'react-redux';
import { getInitials } from 'helpers';
import { showEditDialog } from 'redux/Join/actions';
import UserEditForm from 'views/components/Users/UserEditForm';

const useStyles = makeStyles(theme => ({
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
  }
}));

function withMyHook(Component) {
  return function WrappedComponent(props) {
    const classes = useStyles();
    return <Component {...props} classes={classes} />;
  };
}

const UsersTable = props => {
  //the props
  //need to get the ones from the state
  /***
   * if we are to take the prop value which was provided at UserList:
   *
   */

  const { className, mappeduserState, ...rest } = props;

  console.log('the mapped user state for UsersTable is here:');
  console.dir(mappeduserState);

  const users = mappeduserState.users;
  const collaborators = mappeduserState.collaborators;
  const editUser = mappeduserState.userToEdit;
  const userToDelete = mappeduserState.userToDelete;

  //the methods:

  const showEditDialog = userToEdit => {
    props.mappedshowEditDialog(userToEdit);
  };

  const hideEditDialog = () => {
    props.mappedhideEditDialog();
  };

  const submitEditUser = e => {
    e.preventDefault();
    const editForm = document.getElementById('EditUserForm');
    const userData = props.mappeduserState;
    if (editForm.userName.value !== '') {
      const data = new FormData();
      data.append('id', userData.userToEdit._id);
      data.append('userName', editForm.userName.value);
      data.append('firstName', editForm.firstName.value);
      data.append('lastName', editForm.lastName.value);
      data.append('email', editForm.email.value);
      //add the role in the near future.
      props.mappedEditUser(data);
    } else {
      return;
    }
  };

  const showDeleteDialog = userToDelete => {
    props.mappedShowDeleteDialog(userToDelete);
  };

  const hideDeleteDialog = () => {
    props.mappedHideDeleteDialog();
  };

  const cofirmDeleteUser = () => {
    props.mappedConfirmDeleteUser(mappeduserState.userToDelete);
  };

  const showConfirmDialog = userToConfirm => {
    props.mappedShowConfirmDialog(userToConfirm);
  };

  const hideConfirmDialog = () => {
    props.mappedhideConfirmDialog();
  };

  const approveConfirmUser = () => {
    props.mappedApproveConfirmUser(mappeduserState.userToConfirm);
  };

  const classes = useStyles();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  const handleSelectAll = event => {
    let selectedUsers;

    if (event.target.checked) {
      selectedUsers = users.map(user => user._id);
    } else {
      selectedUsers = [];
    }

    setSelectedUsers(selectedUsers);
  };

  const handleSelectOne = (event, id) => {
    const selectedIndex = selectedUsers.indexOf(id);
    let newSelectedUsers = [];

    if (selectedIndex === -1) {
      newSelectedUsers = newSelectedUsers.concat(selectedUsers, id);
    } else if (selectedIndex === 0) {
      newSelectedUsers = newSelectedUsers.concat(selectedUsers.slice(1));
    } else if (selectedIndex === selectedUsers.length - 1) {
      newSelectedUsers = newSelectedUsers.concat(selectedUsers.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelectedUsers = newSelectedUsers.concat(
        selectedUsers.slice(0, selectedIndex),
        selectedUsers.slice(selectedIndex + 1)
      );
    }

    setSelectedUsers(newSelectedUsers);
  };

  const handlePageChange = (event, page) => {
    setPage(page);
  };

  const handleRowsPerPageChange = event => {
    setRowsPerPage(event.target.value);
  };
  //

  useEffect(() => {
    props.fetchUsers();
  }, []);

  return (
    <Card {...rest} className={clsx(classes.root, className)}>
      {/*************************** list all the users **********************************************/}
      {!users && props.mappeduserState.isFetching && <p>Loading users...</p>}
      {users.length <= 0 && !props.mappeduserState.isFetching && (
        <p>No Users Available. And A User to List here</p>
      )}

      {/* for the users */}
      {/* check if this is an super admin or an admin */}
      {/* if super admin, use User Table, if just admin, use Collaborator Table */}
      {/* To use the different tables, it will just have to be different APIs */}

      <CardContent className={classes.content}>
        <PerfectScrollbar>
          <div className={classes.inner}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedUsers.length === users.length}
                      color="primary"
                      indeterminate={
                        selectedUsers.length > 0 &&
                        selectedUsers.length < users.length
                      }
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Full Name</TableCell>
                  <TableCell>email</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Action</TableCell>
                  
                </TableRow>
              </TableHead>
              <TableBody>
                {/* this is where we iterate the users array */}
                {users.slice(0, rowsPerPage).map(user => (
                  <TableRow
                    className={classes.tableRow}
                    hover
                    key={user._id}
                    selected={selectedUsers.indexOf(user.firstName) !== -1}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedUsers.indexOf(user._id) !== -1}
                        color="primary"
                        onChange={event => handleSelectOne(event, user._id)}
                        value="true"
                      />
                    </TableCell>
                    <TableCell>
                      <div className={classes.nameContainer}>
                        <Avatar className={classes.avatar} src={user.avatarUrl}>
                          {getInitials(
                            `${user.firstName + ' ' + user.lastName}`
                          )}
                        </Avatar>
                        <Typography variant="body1">
                          {' '}
                          {user.firstName + ' ' + user.lastName}
                        </Typography>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    {/* <TableCell>
                      {moment(user.createdAt).format('DD/MM/YYYY')}
                    </TableCell> */}
                    <TableCell>{user.userName}</TableCell>
                    <TableCell>{user.privilege}</TableCell>
                    <TableCell>
                      <Button
                        color="primary"
                        onClick={() => showEditDialog(user)}>
                        Update
                      </Button>{' '}
                      |
                      <Button onClick={() => showDeleteDialog(user)}>
                        Delete
                      </Button>{' '}
                      {/* |
                      <Button onClick={() => showConfirmDialog(user)}>
                        Confirm
                      </Button> */}
                    </TableCell>
                  </TableRow>
                ))}
                {/* the map ends here */}
              </TableBody>
            </Table>
          </div>
        </PerfectScrollbar>
      </CardContent>
      <CardActions className={classes.actions}>
        <TablePagination
          component="div"
          count={users.length}
          onChangePage={handlePageChange}
          onChangeRowsPerPage={handleRowsPerPageChange}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />
      </CardActions>

      {/*************************** the edit dialog **********************************************/}
      <Dialog
        open={props.mappeduserState.showEditDialog}
        onClose={hideEditDialog}
        aria-labelledby="form-dialog-title">
        <DialogTitle></DialogTitle>
        <DialogContent></DialogContent>
        <DialogContent>
          <DialogContentText>Edit the user's details</DialogContentText>

          {editUser && (
            <UserEditForm userData={editUser} editUser={submitEditUser} />
          )}

          {editUser && mappeduserState.isFetching && (
            <Alert icon={<Check fontSize="inherit" />} severity="success">
              Updating....
            </Alert>
          )}

          {editUser && !mappeduserState.isFetching && mappeduserState.error && (
            <Alert severity="error">
              <AlertTitle>Failed</AlertTitle>
              <strong> {mappeduserState.error} </strong>
            </Alert>
          )}

          {editUser &&
            !mappeduserState.isFetching &&
            mappeduserState.successMsg && (
              <Alert severity="success">
                <AlertTitle>Success</AlertTitle>
                <strong>{editUser.firstName}</strong>{' '}
                {mappeduserState.successMsg}
              </Alert>
            )}
        </DialogContent>
        <DialogActions>
          <Button onClick={hideEditDialog} color="primary" variant="contained">
            cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/***************************************** deleting a user ***********************************/}

      <Dialog
        open={props.mappeduserState.showDeleteDialog}
        onClose={hideDeleteDialog}
        aria-labelledby="form-dialog-title">
        <DialogContent>
          <DialogContentText>Delete User</DialogContentText>

          {props.mappeduserState.userToDelete &&
            !userToDelete.error &&
            !userToDelete.isFetching && (
              <Alert severity="warning">
                <AlertTitle>Warning</AlertTitle>
                Are you sure you want to delete this user —{' '}
                <strong>{props.mappeduserState.userToDelete.firstName}</strong>?
                <strong> {mappeduserState.error} </strong>
              </Alert>
            )}

          {mappeduserState.userToDelete && mappeduserState.error && (
            <Alert severity="error">
              <AlertTitle>Failed</AlertTitle>
              <strong> {mappeduserState.error} </strong>
            </Alert>
          )}

          {mappeduserState.userToDelete &&
            !mappeduserState.error &&
            mappeduserState.isFetching && (
              <Alert severity="success">
                <strong> Deleting.... </strong>
              </Alert>
            )}

          {!mappeduserState.userToDelete &&
            !mappeduserState.error &&
            !mappeduserState.isFetching && (
              <Alert severity="success">
                <AlertTitle>Success</AlertTitle>
                User <strong> {mappeduserState.successMsg}</strong>
              </Alert>
            )}
        </DialogContent>
        <DialogActions>
          {!mappeduserState.successMsg && !mappeduserState.isFetching && (
            <div>
              <Button onClick={cofirmDeleteUser} color="primary">
                Yes
              </Button>
              <Button onClick={hideDeleteDialog} color="primary">
                No
              </Button>
            </div>
          )}
          {mappeduserState.successMsg && !mappeduserState.isFetching && (
            <Button onClick={hideConfirmDialog}>Close</Button>
          )}
        </DialogActions>
      </Dialog>
    </Card>
  );
};

UsersTable.propTypes = {
  className: PropTypes.string,
  users: PropTypes.array.isRequired,
  auth: PropTypes.object.isRequired,
  fetchUsers: PropTypes.func.isRequired
};

export default UsersTable;
