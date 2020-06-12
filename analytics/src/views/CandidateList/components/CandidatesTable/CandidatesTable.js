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
import CandidateEditForm from 'views/components/Users/UserEditForm';

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

const CandidatesTable = props => {
  //the props
  //need to get the ones from the state
  /***
   * if we are to take the prop value which was provided at CandidateList:
   *
   */

  const { className, mappeduserState, ...rest } = props;

  console.log('the mapped user state for CandidatesTable is here:');
  console.dir(mappeduserState);

  const users = mappeduserState.candidates;
  const collaborators = mappeduserState.collaborators;
  const editCandidate = mappeduserState.userToEdit;
  const userToDelete = mappeduserState.userToDelete;

  //the methods:

  const showEditDialog = userToEdit => {
    props.mappedshowEditDialog(userToEdit);
  };

  const hideEditDialog = () => {
    props.mappedhideEditDialog();
  };

  const submitEditCandidate = e => {
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

  const showDeleteDialog = userToDelete => {
    props.mappedShowDeleteDialog(userToDelete);
  };

  const hideDeleteDialog = () => {
    props.mappedHideDeleteDialog();
  };

  const cofirmDeleteCandidate = () => {
    props.mappedConfirmDeleteCandidate(mappeduserState.userToDelete);
  };

  const showConfirmDialog = userToConfirm => {
    props.mappedShowConfirmDialog(userToConfirm);
  };

  const hideConfirmDialog = () => {
    props.mappedhideConfirmDialog();
  };

  const approveConfirmCandidate = () => {
    props.mappedApproveConfirmCandidate(mappeduserState.userToConfirm);
  };

  const classes = useStyles();
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [page, setPage] = useState(0);

  const handleSelectAll = event => {
    let selectedCandidates;

    if (event.target.checked) {
      selectedCandidates = users.map(user => user._id);
    } else {
      selectedCandidates = [];
    }

    setSelectedCandidates(selectedCandidates);
  };

  const handleSelectOne = (event, id) => {
    const selectedIndex = selectedCandidates.indexOf(id);
    let newSelectedCandidates = [];

    if (selectedIndex === -1) {
      newSelectedCandidates = newSelectedCandidates.concat(
        selectedCandidates,
        id
      );
    } else if (selectedIndex === 0) {
      newSelectedCandidates = newSelectedCandidates.concat(
        selectedCandidates.slice(1)
      );
    } else if (selectedIndex === selectedCandidates.length - 1) {
      newSelectedCandidates = newSelectedCandidates.concat(
        selectedCandidates.slice(0, -1)
      );
    } else if (selectedIndex > 0) {
      newSelectedCandidates = newSelectedCandidates.concat(
        selectedCandidates.slice(0, selectedIndex),
        selectedCandidates.slice(selectedIndex + 1)
      );
    }

    setSelectedCandidates(newSelectedCandidates);
  };

  const handlePageChange = (event, page) => {
    setPage(page);
  };

  const handleRowsPerPageChange = event => {
    setRowsPerPage(event.target.value);
  };
  //

  useEffect(() => {
    props.fetchCandidates();
  }, []);

  return (
    <Card {...rest} className={clsx(classes.root, className)}>
      {/*************************** list all the users **********************************************/}
      {!users && props.mappeduserState.isFetching && <p>Loading users...</p>}
      {users.length <= 0 && !props.mappeduserState.isFetching && (
        <p>No Candidates Available. And A Candidate to List here</p>
      )}

      {/* for the users */}
      {/* check if this is an super admin or an admin */}
      {/* if super admin, use Candidate Table, if just admin, use Collaborator Table */}
      {/* To use the different tables, it will just have to be different APIs */}

      <CardContent className={classes.content}>
        <PerfectScrollbar>
          <div className={classes.inner}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedCandidates.length === users.length}
                      color="primary"
                      indeterminate={
                        selectedCandidates.length > 0 &&
                        selectedCandidates.length < users.length
                      }
                      onChange={handleSelectAll}
                    />
                  </TableCell>
                  <TableCell>Full Name</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Organization</TableCell>
                  <TableCell>Country</TableCell>
                  <TableCell>Job Title</TableCell>
                  <TableCell>Phone Number</TableCell>
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
                    selected={
                      selectedCandidates.indexOf(user.firstName) !== -1
                    }>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedCandidates.indexOf(user._id) !== -1}
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
                    <TableCell>{user.description}</TableCell>
                    <TableCell>{user.organization}</TableCell>
                    <TableCell>{user.country}</TableCell>
                    <TableCell>{user.jobTitle}</TableCell>
                    <TableCell>{user.phoneNumber}</TableCell>
                    <TableCell>
                      <Button color="primary">Confirm</Button>{' '}
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

          {editCandidate && (
            <CandidateEditForm
              userData={editCandidate}
              editCandidate={submitEditCandidate}
            />
          )}

          {editCandidate && mappeduserState.isFetching && (
            <Alert icon={<Check fontSize="inherit" />} severity="success">
              Updating....
            </Alert>
          )}

          {editCandidate &&
            !mappeduserState.isFetching &&
            mappeduserState.error && (
              <Alert severity="error">
                <AlertTitle>Failed</AlertTitle>
                <strong> {mappeduserState.error} </strong>
              </Alert>
            )}

          {editCandidate &&
            !mappeduserState.isFetching &&
            mappeduserState.successMsg && (
              <Alert severity="success">
                <AlertTitle>Success</AlertTitle>
                <strong>{editCandidate.firstName}</strong>{' '}
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
          <DialogContentText>Delete Candidate</DialogContentText>

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
    </Card>
  );
};

CandidatesTable.propTypes = {
  className: PropTypes.string,
  candidates: PropTypes.array.isRequired,
  fetchCandidates: PropTypes.func.isRequired
};

export default CandidatesTable;
