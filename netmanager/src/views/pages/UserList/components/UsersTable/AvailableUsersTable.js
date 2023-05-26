/* eslint-disable */
import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/styles';
import { Card, Avatar, Typography, Button } from '@material-ui/core';
import { getInitials } from 'utils/users';
import { formatDateString } from 'utils/dateTime';
import CustomMaterialTable from 'views/components/Table/CustomMaterialTable';
import usersStateConnector from 'views/stateConnectors/usersStateConnector';
import { isEmpty } from 'underscore';
import { useDispatch } from 'react-redux';
import { assignUserNetworkApi } from '../../../../apis/accessControl';
import { updateMainAlert } from 'redux/MainAlert/operations';
import { fetchAvailableNetworkUsers } from 'redux/AccessControl/operations';
import { createAlertBarExtraContentFromObject } from 'utils/objectManipulators';

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

const AvailableUsersTable = (props) => {
  const { className, mappeduserState, users, ...rest } = props;
  const dispatch = useDispatch();
  const [isLoading, setLoading] = useState(false);
  const classes = useStyles();
  const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork') || {});

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
            title: 'Action',
            render: (user) => {
              return (
                <div>
                  <Button color="primary" onClick={() => submitEditUser(user)} disabled={isLoading}>
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
    </Card>
  );
};

AvailableUsersTable.propTypes = {
  className: PropTypes.string,
  auth: PropTypes.object.isRequired
};

export default usersStateConnector(AvailableUsersTable);
