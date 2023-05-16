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
import { assignUserToRoleApi } from '../../../../apis/accessControl';
import { updateMainAlert } from 'redux/MainAlert/operations';
import LoadingOverlay from 'react-loading-overlay';

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

const AvailableUsersTable = (props) => {
  const { className, mappeduserState, users, ...rest } = props;
  const [userDelState, setUserDelState] = useState({ open: false, user: {} });

  const dispatch = useDispatch();
  const collaborators = mappeduserState.collaborators;
  const editUser = mappeduserState.userToEdit;
  const [updatedUser, setUpdatedUser] = useState({});
  const [showEditPopup, setShowEditPopup] = useState(false);
  const [showMoreDetailsPopup, setShowMoreDetailsPopup] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const classes = useStyles();

  const showMoreDetails = (user) => {
    props.mappedshowEditDialog(user);
    setShowMoreDetailsPopup(true);
  };

  const hideMoreDetailsDialog = () => {
    props.mappedhideEditDialog();
    setShowMoreDetailsPopup(false);
  };

  const showEditDialog = (userToEdit) => {};

  const hideEditDialog = () => {};

  const submitEditUser = (e) => {
    setLoading(true);
    e.preventDefault();
    // assign user to network and give them a role
    setLoading(false);
  };

  return (
    <Card {...rest} className={clsx(classes.root, className)}>
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
                    Assign User
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
          aria-labelledby="form-dialog-title"
        >
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
    </Card>
  );
};

AvailableUsersTable.propTypes = {
  className: PropTypes.string,
  auth: PropTypes.object.isRequired
};

export default usersStateConnector(AvailableUsersTable);
