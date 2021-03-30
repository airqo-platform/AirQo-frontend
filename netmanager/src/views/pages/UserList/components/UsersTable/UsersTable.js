/* eslint-disable */
import React, { useState, useEffect } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import PerfectScrollbar from "react-perfect-scrollbar";
import { makeStyles } from "@material-ui/styles";
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  TextField,
  DialogActions,
} from "@material-ui/core";

import { Alert, AlertTitle } from "@material-ui/lab";
import { getInitials } from "helpers";
import CustomMaterialTable from "views/components/Table/CustomMaterialTable";
import usersStateConnector from "views/stateConnectors/usersStateConnector";


const roles = [
  {
    value: "user",
    label: "user",
  },
  {
    value: "collaborator",
    label: "collaborator",
  },
  {
    value: "netmanager",
    label: "netmanager",
  },
  {
    value: "admin",
    label: "admin",
  },
];

const useStyles = makeStyles((theme) => ({
  root: {},
  content: {
    padding: 0,
  },
  inner: {
    minWidth: 1050,
  },
  nameContainer: {
    display: "flex",
    alignItems: "center",
  },
  avatar: {
    marginRight: theme.spacing(2),
  },
  actions: {
    justifyContent: "flex-end",
  },
}));

function withMyHook(Component) {
  return function WrappedComponent(props) {
    const classes = useStyles();
    return <Component {...props} classes={classes} />;
  };
}

const UsersTable = (props) => {
  //the props
  //need to get the ones from the state
  /***
   * if we are to take the prop value which was provided at UserList:
   *
   */

  const { className, mappeduserState, ...rest } = props;

  console.log("the mapped user state for UsersTable is here:");
  console.dir(mappeduserState);

  const users = mappeduserState.users;
  const collaborators = mappeduserState.collaborators;
  const editUser = mappeduserState.userToEdit;
  const [updatedUser, setUpdatedUser] = useState({});
  const [showEditPopup, setShowEditPopup] = useState(false);
  const userToDelete = mappeduserState.userToDelete;

  //the methods:

  const handleUpdateUserChange = (field) => (event) => {
    event.preventDefault();
    setUpdatedUser({ ...updatedUser, [field]: event.target.value });
  }

  const showEditDialog = (userToEdit) => {
    props.mappedshowEditDialog(userToEdit);
    setShowEditPopup(true);
  };

  const hideEditDialog = () => {
    props.mappedhideEditDialog();
    setUpdatedUser({});
    setShowEditPopup(false)
  };

  const submitEditUser = (e) => {
    e.preventDefault();
    if (updatedUser.userName !== "") {
      const data = { ...updatedUser, id: props.mappeduserState.userToEdit._id };
      hideEditDialog()
      props.mappedEditUser(data);
    }
  };

  const showDeleteDialog = (userToDelete) => {
    props.mappedShowDeleteDialog(userToDelete);
  };

  const hideDeleteDialog = () => {
    props.mappedHideDeleteDialog();
  };

  const cofirmDeleteUser = () => {
    props.mappedConfirmDeleteUser(mappeduserState.userToDelete);
  };

  const classes = useStyles();

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
            <CustomMaterialTable
                title={"Users"}
                userPreferencePaginationKey={"users"}
                data={users}
                columns={[
                  {
                    title: "Full Name",
                    render: (rowData) => {
                      return (
                          <div className={classes.nameContainer}>
                            <Avatar className={classes.avatar} src={rowData.profilePicture}>
                              {getInitials(
                                `${rowData.firstName + " " + rowData.lastName}`
                              )}
                            </Avatar>
                            <Typography variant="body1">
                              {" "}
                              {rowData.firstName + " " + rowData.lastName}
                            </Typography>
                          </div>
                      )
                    }
                  },
                  {
                    title: "Email",
                    field: "email",
                  },
                  {
                    title: "Username",
                    field: "userName",
                  },
                  {
                    title: "Role",
                    field: "privilege",
                  },
                  {
                    title: "Action",
                    render: (user) => {
                      return (
                          <div>
                          <Button
                            color="primary"
                            onClick={() => showEditDialog(user)}
                          >
                            Update
                          </Button>
                          |
                          <Button onClick={() => showDeleteDialog(user)}>
                            Delete
                          </Button>
                          </div>
                      )
                    }
                  }
                ]}
                options={{
                  search: true,
                  searchFieldAlignment: "left",
                  showTitle: false,
                }}
            />
          </div>
        </PerfectScrollbar>
      </CardContent>

      {/*************************** the edit dialog **********************************************/}
      {editUser &&
      <Dialog
          open={showEditPopup}
          onClose={hideEditDialog}
          aria-labelledby="form-dialog-title"
      >
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>

          <div>
            <TextField
                margin="dense"
                id="email"
                name="Email Address"
                type="text"
                label="email"
                variant="outlined"
                value={updatedUser && updatedUser.email || editUser.email}
                onChange={handleUpdateUserChange("email")}
                fullWidth
            />
            <TextField
                margin="dense"
                id="firstName"
                name="firstName"
                label="first name"
                type="text"
                value={updatedUser && updatedUser.firstName || editUser.firstName}
                onChange={handleUpdateUserChange("firstName")}
                variant="outlined"
                fullWidth
            />
            <TextField
                margin="dense"
                id="lastName"
                label="last name"
                name="lastName"
                type="text"
                value={updatedUser && updatedUser.lastName || editUser.lastName}
                onChange={handleUpdateUserChange("lastName")}
                variant="outlined"
                fullWidth
            />
            <TextField
                margin="dense"
                id="userName"
                name="userName"
                label="user name"
                type="text"
                value={updatedUser && updatedUser.userName || editUser.userName}
                onChange={handleUpdateUserChange("userName")}
                variant="outlined"
                fullWidth
            />
            <TextField
                id="privilege"
                select
                fullWidth
                label="Role"
                style={{marginTop: "15px"}}
                value={updatedUser && updatedUser.privilege || editUser.privilege}
                onChange={handleUpdateUserChange("privilege")}
                SelectProps={{
                  native: true,
                  style: {width: "100%", height: "50px"},
                  MenuProps: {
                    className: classes.menu,
                  },
                }}

                variant="outlined"
            >
              {roles.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
              ))}
            </TextField>
          </div>

        </DialogContent>
        <DialogActions>
          <div>
            <Button
                color="primary"
                variant="outlined"
                onClick={hideEditDialog}
            >
              Cancel
            </Button>
            <Button
                style={{margin: "0 15px"}}
                onClick={submitEditUser}
                color="primary"
                variant="contained">
              Submit
            </Button>
          </div>

        </DialogActions>
      </Dialog>
      }
      {/***************************************** deleting a user ***********************************/}

      <Dialog
        open={props.mappeduserState.showDeleteDialog}
        onClose={hideDeleteDialog}
        aria-labelledby="form-dialog-title"
      >
        <DialogContent>
          <DialogContentText>Delete User</DialogContentText>

          {props.mappeduserState.userToDelete &&
            !userToDelete.error &&
            !userToDelete.isFetching && (
              <Alert severity="warning">
                <AlertTitle>Warning</AlertTitle>
                Are you sure you want to delete this user —{" "}
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
            <Button onClick={hideDeleteDialog}>Close</Button>
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
  fetchUsers: PropTypes.func.isRequired,
};

export default usersStateConnector(UsersTable);
