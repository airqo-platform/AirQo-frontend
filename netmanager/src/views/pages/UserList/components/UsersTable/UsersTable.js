/* eslint-disable */
import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import {
  Card,
  Avatar,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
  ListItemText,
  Divider,
  Select
} from '@material-ui/core';
import { RemoveRedEye } from '@material-ui/icons';

import { getInitials } from 'utils/users';
import { formatDateString } from 'utils/dateTime';
import CustomMaterialTable from 'views/components/Table/CustomMaterialTable';
import usersStateConnector from 'views/stateConnectors/usersStateConnector';
import ConfirmDialog from 'views/containers/ConfirmDialog';
import { isEmpty } from 'underscore';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNetworkUsers } from 'redux/AccessControl/operations';
import { assignUserToRoleApi } from '../../../../apis/accessControl';
import { updateMainAlert } from 'redux/MainAlert/operations';
import LoadingOverlay from 'react-loading-overlay';
import UsersListBreadCrumb from '../Breadcrumb';
// dropdown component
import Dropdown from 'react-select';
// Horizontal loader
import HorizontalLoader from 'views/components/HorizontalLoader/HorizontalLoader';

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
  }
}));

function withMyHook(Component) {
  return function WrappedComponent(props) {
    const classes = useStyles();
    return <Component {...props} classes={classes} />;
  };
}

// dropdown component styles
const customStyles = {
  control: (base, state) => ({
    ...base,
    height: '3rem',
    marginTop: '3px',
    borderColor: state.isFocused ? '#3f51b5' : '#9a9a9a',
    '&:hover': {
      borderColor: state.isFocused ? 'black' : 'black'
    },
    boxShadow: state.isFocused ? '0 0 1px 1px #3f51b5' : null
  }),
  option: (provided, state) => ({
    ...provided,
    borderBottom: '1px dotted pink',
    color: state.isSelected ? 'white' : 'blue',
    textAlign: 'left'
  }),
  input: (provided, state) => ({
    ...provided,
    height: '40px',
    borderColor: state.isFocused ? '#3f51b5' : 'black'
  }),
  placeholder: (provided, state) => ({
    ...provided,
    color: '#000'
  }),
  menu: (provided, state) => ({
    ...provided,
    zIndex: 9999
  })
};

const UsersTable = (props) => {
  //the props
  //need to get the ones from the state
  /***
   * if we are to take the prop value which was provided at UserList:
   *
   */

  const { className, mappeduserState, roles, ...rest } = props;
  const [userDelState, setUserDelState] = useState({ open: false, user: {} });

  const dispatch = useDispatch();
  const collaborators = mappeduserState.collaborators;
  const editUser = mappeduserState.userToEdit;
  const [updatedUser, setUpdatedUser] = useState({});
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showMoreDetailsPopup, setShowMoreDetailsPopup] = useState(false);
  const userToDelete = mappeduserState.userToDelete;
  const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));
  const [isLoading, setLoading] = useState(false);
  const classes = useStyles();
  const users = useSelector((state) => state.accessControl.networkUsers);
  // for horizontal loader
  const [loading, setIsLoading] = useState(false);

  //the methods:

  const handleUpdateUserChange = (field) => (event) => {
    event.preventDefault();
    setUpdatedUser({ ...updatedUser, [field]: event.target.value });
  };

  const showMoreDetails = (user) => {
    props.mappedshowEditDialog(user);
    setShowMoreDetailsPopup(true);
  };

  const hideMoreDetailsDialog = () => {
    props.mappedhideEditDialog();
    setShowMoreDetailsPopup(false);
  };

  const showEditDialog = (userToEdit) => {
    props.mappedshowEditDialog(userToEdit);
    if (userToEdit.role) {
      setUpdatedUser({ ...userToEdit, role: userToEdit.role._id });
    } else {
      setUpdatedUser(userToEdit);
    }

    setShowEditPopup(true);
  };

  const hideEditDialog = () => {
    props.mappedhideEditDialog();
    setUpdatedUser({});
    setShowEditPopup(false);
  };

  const submitEditUser = (e) => {
    setIsLoading(true);
    setLoading(true);
    e.preventDefault();
    if (updatedUser.userName !== '') {
      const data = { ...updatedUser, id: props.mappeduserState.userToEdit._id };
      // update user role
      if (props.mappeduserState.userToEdit.role) {
        if (updatedUser.role !== props.mappeduserState.userToEdit.role._id) {
          assignUserToRoleApi(updatedUser.role, {
            user: props.mappeduserState.userToEdit._id
          }).then((res) => {
            dispatch(fetchNetworkUsers(activeNetwork._id));
            setIsLoading(false);
            dispatch(
              updateMainAlert({
                message: 'User successfully added to the organisation',
                show: true,
                severity: 'success'
              })
            );
            setLoading(false);
          });
        }
      }
      hideEditDialog();
      props.mappedEditUser(data);
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    setLoading(false);
  };

  const showDeleteDialog = (user) => {
    setUserDelState({ open: true, user });
  };

  const hideDeleteDialog = () => {
    setUserDelState({ open: false, user: {} });
  };

  // delete user function
  const deleteUser = async () => {
    // Set loading to true when deleting
    setIsLoading(true);
    try {
      await props.mappedConfirmDeleteUser(userDelState.user);
      hideDeleteDialog();
      await dispatch(fetchNetworkUsers(activeNetwork._id));
    } catch (error) {
      console.error(error);
    } finally {
      // Set loading to false when done
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    if (!isEmpty(activeNetwork)) {
      dispatch(fetchNetworkUsers(activeNetwork._id));
    }
    setLoading(false);
  }, []);

  // If roles is null or undefined will return empty array
  const options = roles?.map((role) => ({ value: role._id, label: role.role_name })) ?? [];

  // checking if userToEdit is undefined or null
  const [selectedOption, setSelectedOption] = useState(
    props.mappeduserState.userToEdit?.role
      ? {
          value: props.mappeduserState.userToEdit.role._id,
          label: props.mappeduserState.userToEdit.role.role_name
        }
      : null
  );

  const handleRoleChange = (selectedOption) => {
    setSelectedOption(selectedOption);
    setUpdatedUser({ ...updatedUser, role: selectedOption.value });
  };

  return (
    <>
      <UsersListBreadCrumb category={'Users'} usersTable={'Assigned Users'} />
      <Card {...rest} className={clsx(classes.root, className)}>
        {/* custome Horizontal loader indicator */}
        <HorizontalLoader
          color="#FFCC00"
          loading={loading}
          initial={0}
          target={100}
          duration={1500}
        />
        <CustomMaterialTable
          title={'Users'}
          userPreferencePaginationKey={'users'}
          data={!isEmpty(users) ? users : []}
          columns={[
            {
              title: 'Full Name',
              render: (rowData) => {
                return (
                  <div className={classes.nameContainer}>
                    <Avatar className={classes.avatar} src={rowData.profilePicture}>
                      {getInitials(`${rowData.firstName + ' ' + rowData.lastName}`)}
                    </Avatar>
                    <Typography variant="body1">
                      {' '}
                      {rowData.firstName + ' ' + rowData.lastName}
                    </Typography>
                  </div>
                );
              }
            },
            {
              title: 'Email',
              field: 'email'
            },
            {
              title: 'Username',
              field: 'userName'
            },
            {
              title: 'Role',
              render: (user) => {
                return <span>{user.role ? user.role.role_name : '---'}</span>;
              }
            },
            {
              title: 'Joined',
              field: 'createdAt',
              render: (candidate) => (
                <span>{candidate.createdAt ? formatDateString(candidate.createdAt) : '---'}</span>
              )
            },
            {
              title: 'More Details',
              render: (user) => (
                <RemoveRedEye style={{ color: 'green' }} onClick={() => showMoreDetails(user)} />
              )
            },
            {
              title: 'Action',
              render: (user) => {
                return (
                  <div>
                    <Button color="primary" onClick={() => showEditDialog(user)}>
                      Update
                    </Button>

                    <Button style={{ color: 'red' }} onClick={() => showDeleteDialog(user)}>
                      Delete
                    </Button>
                  </div>
                );
              }
            }
          ]}
          options={{
            search: true,
            searchFieldAlignment: 'left',
            showTitle: false
          }}
        />

        {/*************************** the more details dialog **********************************************/}
        {editUser && (
          <Dialog
            open={showMoreDetailsPopup}
            onClose={hideMoreDetailsDialog}
            aria-labelledby="form-dialog-title">
            <DialogTitle>User request details</DialogTitle>
            <DialogContent>
              <div style={{ minWidth: 500 }}>
                <ListItemText primary="Job Title" secondary={editUser.jobTitle || 'Not provided'} />
                <Divider />
                <ListItemText primary="Country" secondary={editUser.country || 'Not provided'} />
                <Divider />
                <ListItemText primary="Category" secondary={editUser.category || 'Not provided'} />
                <Divider />
                <ListItemText primary="Website" secondary={editUser.website || 'Not provided'} />
                <Divider />
                <ListItemText
                  primary="Description"
                  secondary={editUser.description || 'Not provided'}
                />
              </div>
            </DialogContent>
            <DialogActions>
              <div>
                <Button color="primary" variant="outlined" onClick={hideMoreDetailsDialog}>
                  Close
                </Button>
              </div>
            </DialogActions>
          </Dialog>
        )}

        {/*************************** the edit dialog **********************************************/}
        {editUser && (
          <Dialog open={showEditPopup} onClose={hideEditDialog} aria-labelledby="form-dialog-title">
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
                  value={updatedUser.email}
                  onChange={handleUpdateUserChange('email')}
                  fullWidth
                />
                <TextField
                  margin="dense"
                  id="firstName"
                  name="firstName"
                  label="first name"
                  type="text"
                  value={updatedUser.firstName}
                  onChange={handleUpdateUserChange('firstName')}
                  variant="outlined"
                  fullWidth
                />
                <TextField
                  margin="dense"
                  id="lastName"
                  label="last name"
                  name="lastName"
                  type="text"
                  value={updatedUser.lastName}
                  onChange={handleUpdateUserChange('lastName')}
                  variant="outlined"
                  fullWidth
                />
                <TextField
                  margin="dense"
                  id="userName"
                  name="userName"
                  label="user name"
                  type="text"
                  value={updatedUser.userName}
                  onChange={handleUpdateUserChange('userName')}
                  variant="outlined"
                  fullWidth
                />

                {/* dropdown */}
                <Dropdown
                  name="role"
                  label="role"
                  onChange={handleRoleChange}
                  value={selectedOption}
                  options={options}
                  variant="outlined"
                  styles={customStyles}
                  isMulti={false}
                  fullWidth
                  placeholder={selectedOption ? selectedOption.label : 'Select role'}
                />

                <TextField
                  margin="dense"
                  id="jobTitle"
                  name="jobTitle"
                  label="jobTitle"
                  type="text"
                  value={updatedUser.jobTitle}
                  onChange={handleUpdateUserChange('jobTitle')}
                  variant="outlined"
                  fullWidth
                />
                <TextField
                  margin="dense"
                  id="organization"
                  name="organization"
                  label="organization"
                  type="text"
                  value={updatedUser.organization}
                  onChange={handleUpdateUserChange('organization')}
                  variant="outlined"
                  fullWidth
                />
                <TextField
                  margin="dense"
                  id="category"
                  name="category"
                  label="category"
                  type="text"
                  value={updatedUser.category}
                  onChange={handleUpdateUserChange('category')}
                  variant="outlined"
                  fullWidth
                />
                <TextField
                  margin="dense"
                  id="description"
                  name="description"
                  label="description"
                  type="text"
                  value={updatedUser.description}
                  onChange={handleUpdateUserChange('description')}
                  variant="outlined"
                  fullWidth
                  multiline
                />
                <TextField
                  margin="dense"
                  id="website"
                  name="website"
                  label="website"
                  type="text"
                  value={updatedUser.website}
                  onChange={handleUpdateUserChange('website')}
                  variant="outlined"
                  fullWidth
                />
                <TextField
                  margin="dense"
                  id="country"
                  name="country"
                  label="country"
                  type="text"
                  value={updatedUser.country}
                  onChange={handleUpdateUserChange('country')}
                  variant="outlined"
                  fullWidth
                />
              </div>
            </DialogContent>
            <DialogActions>
              <div>
                <Button color="primary" variant="outlined" onClick={hideEditDialog}>
                  Cancel
                </Button>
                <Button
                  style={{ margin: '0 15px' }}
                  onClick={submitEditUser}
                  color="primary"
                  variant="contained">
                  Submit
                </Button>
              </div>
            </DialogActions>
          </Dialog>
        )}
        {/***************************************** deleting a user ***********************************/}
        <ConfirmDialog
          title={'Delete User'}
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
    </>
  );
};

UsersTable.propTypes = {
  className: PropTypes.string,
  auth: PropTypes.object.isRequired
};

export default usersStateConnector(UsersTable);
