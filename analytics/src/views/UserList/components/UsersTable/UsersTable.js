import React, { useState } from 'react';
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
  Alert,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField
} from '@material-ui/core';

import {Check, CheckCircleOutline} from '@material-ui/icons';

import { connect } from "react-redux";
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

  const { className,mappeduserState, ...rest } = props;
  const userState = mappeduserState;
const users =  userState.actors;
const collaborators= userState.collaborators;
const editUser = userState.actorToEdit;

  //the methods:

  const showEditDialog = (userToEdit) => {
    props.mappedshowEditDialog(userToEdit);
  }

  const hideEditDialog = ()=> {
    props.mappedhideEditDialog();
  }

  const submitEditUser = (e)=> {
    e.preventDefault();
    const editForm = document.getElementById("EditUserForm");
    const userData = this.props.mappeduserState;
    if (editForm.userName.value !== "") {
      const data = new FormData();
      data.append('id', userData.userToEdit._id);
      data.append('userName', editForm.userName.value);
      data.append('firstName', editForm.firstName.value);
      data.append('lastName', editForm.lastName.value);
      data.append('email', editForm.email.value);
      this.props.mappedEditUser(data);
    } else {
      return;
    }
  }

  const showDeleteDialog = (userToDelete)=> {
    props.mappedShowDeleteDialog(userToDelete);
  }

  const hideDeleteDialog = ()=> {
    props.mappedHideDeleteDialog();
  }

  const cofirmDeleteUser = () => {
    props.mappedConfirmDeleteUser(this.props.mappeduserState.userToDelete);
  }

  const showConfirmDialog = (userToConfirm) => {
    props.mappedShowConfirmDialog(userToConfirm);
  }

 const  hideConfirmDialog = () => {
    props.mappedhideConfirmDialog();
  }

  const approveConfirmUser = () => {
    props.mappedApproveConfirmUser(this.props.mappeduserState.userToConfirm);
  }

  const componentWillMount = () => {
    props.fetchUsers();
  }

  const classes = useStyles();
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  const handleSelectAll = event => {
    const { users } = props;

    let selectedUsers;

    if (event.target.checked) {
      selectedUsers = users.map(user => user.id);
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

  return (
    <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      {!users && userState.isFetching && <p>Loading users...</p>}
      {users.length <=0 && !productState.isFetching && <p>No Users Available. And A User to List here</p>}
      
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
                  <TableCell>First Name</TableCell>
                  <TableCell>Last Name</TableCell>
                  <TableCell>email</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {/* this is where we iterate the users array */}
                {users.slice(0, rowsPerPage).map(user => (
                  <TableRow
                    className={classes.tableRow}
                    hover
                    key={user.id}
                    selected={selectedUsers.indexOf(user.firstName) !== -1}
                  >
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
                        <Avatar
                          className={classes.avatar}
                          src={user.avatarUrl}
                        >
                          {getInitials( `${user.firstName+" "+user.lastName}`)}
                        </Avatar>
                        <Typography variant="body1"> {user.firstName+" "+user.lastName}</Typography>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    {/* <TableCell>
                      {moment(user.createdAt).format('DD/MM/YYYY')}
                    </TableCell> */}
                    <TableCell>
                      {user.userName}
                    </TableCell>
                    <TableCell>
                      <Button color="primary" onClick={()=> showEditDialog(user)}>Update</Button> | 
                      <Button onClick={showDeleteDialog(user)}>Delete</Button> | 
                      <Button onClick={showConfirmDialog}>Confirm</Button>
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

{/* the edit dialog */}
<Dialog
open={userState.showEditDialog}
onClose={hideEditDialog}
aria-labelledby="form-dialog-title"
>
  <DialogTitle></DialogTitle>
  <DialogContent></DialogContent>
  <DialogContent>
<DialogContentText>Edit the user's details</DialogContentText>

{
editUser &&
  <UserEditForm
userData={editUser}
editUser={submitEditUser}
/>
}

{
editUser && userState.isFetching && 
<Alert 
  icon={<Check fontSize="inherit"/>}
  severity="success">
Updating....
</Alert>
}

{
editUser && !userState.isFetching && useState.error && 
<Alert severity="error">
<AlertTitle>Failed</AlertTitle>
<strong> {userState.error} </strong>
</Alert>
}

{
  editUser && !userState.isFetching && userState.successMsg && 
  <Alert severity="success">
<AlertTitle>
  Success
</AlertTitle>
<strong>{editUser.firstName}</strong> {userState.successMsg}
  </Alert>
}
  </DialogContent>
  <DialogActions>
    <Button onClick={hideEditDialog} color="primary">
cancel
    </Button>
  </DialogActions>

</Dialog>


    </Card>
  );
};

UsersTable.propTypes = {
  className: PropTypes.string,
  users: PropTypes.array.isRequired,
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, {})(withMyHook(UsersTable));
///afwe