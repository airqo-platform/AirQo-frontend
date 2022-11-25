/* eslint-disable */
import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
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
  DialogContentText,
  DialogActions,
  TextField,
  CircularProgress
} from '@material-ui/core';

import { Alert, AlertTitle } from '@material-ui/lab';

import { Check } from '@material-ui/icons';
import { getInitials } from 'utils/users';
import { formatDateString } from 'utils/dateTime';
import CandidateEditForm from 'views/pages/UserList/components/UserEditForm';
import CustomMaterialTable from 'views/components/Table/CustomMaterialTable';
import usersStateConnector from 'views/stateConnectors/usersStateConnector';
import ConfirmDialog from 'views/containers/ConfirmDialog';
import {
  confirmCandidateApi,
  deleteCandidateApi,
  updateCandidateApi,
  sendUserFeedbackApi
} from 'views/apis/authService';
import { updateMainAlert } from 'redux/MainAlert/operations';

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

const CandidatesTable = (props) => {
  const { className, mappeduserState, ...rest } = props;
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [openDel, setOpenDel] = useState(false);
  const [currentCandidate, setCurrentCandidate] = useState(null);

  const [openNewMessagePopup, setOpenNewMessagePopup] = useState(false);

  const [userFeedbackMessage, setUserFeedbackMessage] = useState('');
  const [messageSubject, setMessageSubject] = useState('');
  const [isLoading, setLoading] = useState(false);

  const users = mappeduserState.candidates;
  const editCandidate = mappeduserState.userToEdit;
  const userToDelete = mappeduserState.userToDelete;

  //the methods
  const hideEditDialog = () => {
    props.mappedhideEditDialog();
  };

  const submitEditCandidate = (e) => {
    e.preventDefault();
    const editForm = document.getElementById('EditCandidateForm');
    const userData = props.mappeduserState;
    if (editForm.userName.value !== '') {
      const data = new FormData();
      data.append('id', userData.userToEdit._id);
      data.append('userName', editForm.userName.value);
      data.append('firstName', editForm.firstName.value);
      data.append('lastName', editForm.lastName.value);
      data.append('email', editForm.email.value);
      //add the role in the near future.
      props.mappedEditCandidate(data);
    } else {
      return;
    }
  };

  const hideDeleteDialog = () => {
    props.mappedHideDeleteDialog();
  };

  const cofirmDeleteCandidate = () => {
    props.mappedConfirmDeleteCandidate(mappeduserState.userToDelete);
  };

  const hideConfirmDialog = () => {
    props.mappedhideConfirmDialog();
  };

  const classes = useStyles();

  useEffect(() => {
    props.fetchCandidates();
  }, []);

  const onConfirmBtnClick = (candidate) => () => {
    setCurrentCandidate(candidate);
    setOpen(true);
  };

  const onDenyBtnClick = (candidate) => () => {
    setCurrentCandidate(candidate);
    setOpenDel(true);
  };

  const confirmCandidate = () => {
    setOpen(false);
    return confirmCandidateApi(currentCandidate)
      .then((res) => {
        props.fetchCandidates();
        dispatch(
          updateMainAlert({
            show: true,
            message: res.message,
            severity: 'success'
          })
        );
      })
      .catch((err) => {
        dispatch(
          updateMainAlert({
            show: true,
            message: 'candidate already exists',
            severity: 'error'
          })
        );
      });
  };

  const deleteCandidate = () => {
    setOpenDel(false);
    return deleteCandidateApi(currentCandidate._id)
      .then((res) => {
        props.fetchCandidates();
        dispatch(
          updateMainAlert({
            show: true,
            message: res.message,
            severity: 'success'
          })
        );
      })
      .catch((err) => {
        dispatch(
          updateMainAlert({
            show: true,
            message: err.response.data.message,
            severity: 'error'
          })
        );
      });
  };

  const modifyCandidate = (id, data) => {
    setOpenDel(false);
    return updateCandidateApi(id, data)
      .then((res) => {
        props.fetchCandidates();
        dispatch(
          updateMainAlert({
            show: true,
            message: res.message,
            severity: 'success'
          })
        );
      })
      .catch((err) => {
        dispatch(
          updateMainAlert({
            show: true,
            message: err.response.data.message,
            severity: 'error'
          })
        );
      });
  };

  const sendUserNewMessage = async (candidate) => {
    setLoading(true);
    if (messageSubject && userFeedbackMessage) {
      const body = {
        email: candidate.email,
        subject: messageSubject,
        message: userFeedbackMessage
      };

      sendUserFeedbackApi(body)
        .then((res) => {
          dispatch(
            updateMainAlert({
              show: true,
              message: res.message,
              severity: 'success'
            })
          );
        })
        .catch((err) => {
          return dispatch(
            updateMainAlert({
              show: true,
              message: err.response.data.message,
              severity: 'error'
            })
          );
        });

      setUserFeedbackMessage('');
      setOpenNewMessagePopup(false);
      setLoading(false);
    }
  };

  return (
    <Card {...rest} className={clsx(classes.root, className)}>
      <CustomMaterialTable
        title={'candidate'}
        userPreferencePaginationKey={'candidates'}
        data={users}
        columns={[
          {
            title: 'Full Name',
            render: (user) => {
              return (
                <div className={classes.nameContainer}>
                  <Avatar className={classes.avatar} src={user.avatarUrl}>
                    {getInitials(`${user.firstName + ' ' + user.lastName}`)}
                  </Avatar>
                  <Typography variant="body1"> {user.firstName + ' ' + user.lastName}</Typography>
                </div>
              );
            }
          },
          {
            title: 'Email',
            field: 'email'
          },
          {
            title: 'Category',
            field: 'category'
          },
          {
            title: 'Description',
            field: 'description'
          },
          {
            title: 'Organization',
            field: 'long_organization'
          },
          {
            title: 'Job Title',
            field: 'jobTitle'
          },
          {
            title: 'Submitted',
            field: 'createdAt',
            render: (candidate) => (
              <span>{candidate.createdAt ? formatDateString(candidate.createdAt) : '---'}</span>
            )
          },
          {
            title: 'Rejected',
            field: 'updatedAt',
            render: (candidate) => {
              const pending = candidate.status === 'pending';
              return (
                <span
                  style={
                    pending
                      ? {
                          padding: '5px',
                          border: '1px solid #e3e3e3',
                          background: '#e3e3e3',
                          fontWeight: 'bold',
                          borderRadius: '5px'
                        }
                      : null
                  }
                >
                  {pending
                    ? 'pending'
                    : formatDateString(candidate.updatedAt, 'DD-MM-YYYY HH:mm:ss')}
                </span>
              );
            }
          },
          {
            title: 'Action',
            render: (candidate) => (
              <div>
                <Button
                  disabled={candidate.status === 'rejected'}
                  color="primary"
                  onClick={onConfirmBtnClick(candidate)}
                >
                  Confirm
                </Button>
                {candidate.status === 'rejected' ? (
                  <Button
                    style={{ color: '#008CBA' }}
                    onClick={() => modifyCandidate(candidate._id, { status: 'pending' })}
                  >
                    Revert
                  </Button>
                ) : (
                  <Button
                    disabled={isLoading}
                    style={{ color: 'red' }}
                    onClick={onDenyBtnClick(candidate)}
                  >
                    Reject
                  </Button>
                )}
              </div>
            )
          },
          {
            title: 'Message',
            render: (candidate) => (
              <div>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setOpenNewMessagePopup(true);
                    setCurrentCandidate(candidate);
                  }}
                >
                  Send message
                </Button>
              </div>
            )
          }
        ]}
        options={{
          search: true,
          searchFieldAlignment: 'left',
          showTitle: false
        }}
      />

      {/*************************** the edit dialog **********************************************/}
      <ConfirmDialog
        open={open}
        close={() => setOpen(false)}
        confirmBtnMsg={'Confirm'}
        confirm={confirmCandidate}
        title={'Confirm candidate'}
        message={'Are you sure you want to grant this user access?'}
      />
      <ConfirmDialog
        open={openDel}
        close={() => setOpenDel(false)}
        confirmBtnMsg={'Reject'}
        confirm={() => modifyCandidate(currentCandidate._id, { status: 'rejected' })}
        title={'Reject candidate'}
        message={
          'Are you sure you want to deny access to this candidate? This process can be reverted'
        }
        error
      />
      <Dialog
        open={props.mappeduserState.showEditDialog}
        onClose={hideEditDialog}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle></DialogTitle>
        <DialogContent></DialogContent>
        <DialogContent>
          <DialogContentText>Edit the user's details</DialogContentText>

          {editCandidate && (
            <CandidateEditForm userData={editCandidate} editCandidate={submitEditCandidate} />
          )}

          {editCandidate && mappeduserState.isFetching && (
            <Alert icon={<Check fontSize="inherit" />} severity="success">
              Updating....
            </Alert>
          )}

          {editCandidate && !mappeduserState.isFetching && mappeduserState.error && (
            <Alert severity="error">
              <AlertTitle>Failed</AlertTitle>
              <strong> {mappeduserState.error} </strong>
            </Alert>
          )}

          {editCandidate && !mappeduserState.isFetching && mappeduserState.successMsg && (
            <Alert severity="success">
              <AlertTitle>Success</AlertTitle>
              <strong>{editCandidate.firstName}</strong> {mappeduserState.successMsg}
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
        aria-labelledby="form-dialog-title"
      >
        <DialogContent>
          <DialogContentText>Delete Candidate</DialogContentText>

          {props.mappeduserState.userToDelete && !userToDelete.error && !userToDelete.isFetching && (
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

          {mappeduserState.userToDelete && !mappeduserState.error && mappeduserState.isFetching && (
            <Alert severity="success">
              <strong> Deleting.... </strong>
            </Alert>
          )}

          {!mappeduserState.userToDelete && !mappeduserState.error && !mappeduserState.isFetching && (
            <Alert severity="success">
              <AlertTitle>Success</AlertTitle>
              Candidate <strong> {mappeduserState.successMsg}</strong>
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          {!mappeduserState.successMsg && !mappeduserState.isFetching && (
            <div>
              <Button onClick={cofirmDeleteCandidate} color="primary">
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
      <Dialog
        fullWidth
        maxWidth={'sm'}
        open={openNewMessagePopup}
        onClose={() => setOpenNewMessagePopup(false)}
        aria-labelledby="form-dialog-title"
      >
        <DialogContent>
          <DialogContentText>Message Candidate</DialogContentText>
          <div style={{ marginBottom: '16px' }}>
            <TextField
              autoFocus
              id="subject"
              onChange={(e) => setMessageSubject(e.target.value)}
              label="Subject"
              type="text"
              variant="outlined"
              fullWidth
            />
          </div>
          <div>
            <TextField
              autoFocus
              id="message"
              onChange={(e) => setUserFeedbackMessage(e.target.value)}
              label="Message Body"
              type="text"
              multiline
              rows={8}
              variant="outlined"
              fullWidth
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            disabled={isLoading}
            onClick={() => setOpenNewMessagePopup(false)}
            variant="outlined"
          >
            Cancel
          </Button>
          <Button
            disabled={isLoading}
            onClick={() => sendUserNewMessage(currentCandidate)}
            color="primary"
          >
            Finish
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

CandidatesTable.propTypes = {
  className: PropTypes.string,
  candidates: PropTypes.array.isRequired,
  fetchCandidates: PropTypes.func.isRequired
};

export default usersStateConnector(CandidatesTable);
