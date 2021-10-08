/* eslint-disable */
import React, { useState, useEffect } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
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
import { getInitials } from "utils/users";
import CustomMaterialTable from "views/components/Table/CustomMaterialTable";
import usersStateConnector from "views/stateConnectors/usersStateConnector";
import ConfirmDialog from "views/containers/ConfirmDialog";


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
  const [userDelState, setUserDelState] = useState({open: false, user: {}})

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

  const showDeleteDialog = (user) => {
    setUserDelState({open: true, user})
  };

  const hideDeleteDialog = () => {
    setUserDelState({open: false, user: {}})
  };

  const deleteUser = () => {
    props.mappedConfirmDeleteUser(userDelState.user);
    setUserDelState({open: false, user: {}})
  };

  const classes = useStyles();

  useEffect(() => {
    props.fetchUsers();
  }, []);

  return (
    <Card {...rest} className={clsx(classes.root, className)}>
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
                      <Button  style={{color: "red"}} onClick={() => showDeleteDialog(user)}>
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
      <ConfirmDialog
          title={"Delete User"}
          open={userDelState.open}
          message={
            <span>
              Are you sure you want to delete this user —
              <strong>{userDelState.user.firstName}</strong>?
            </span>
          }
          confirm={deleteUser}
          close={hideDeleteDialog}
          error
      />
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
