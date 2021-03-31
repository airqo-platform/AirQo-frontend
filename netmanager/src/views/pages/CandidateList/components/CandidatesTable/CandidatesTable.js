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
  DialogActions,
} from "@material-ui/core";

import { Alert, AlertTitle } from "@material-ui/lab";

import { Check} from "@material-ui/icons";
import { getInitials } from "helpers";
import CandidateEditForm from "views/pages/UserList/components/UserEditForm";
import CustomMaterialTable from "views/components/Table/CustomMaterialTable";
import usersStateConnector from "views/stateConnectors/usersStateConnector";

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

const CandidatesTable = (props) => {
  //the props
  //need to get the ones from the state
  /***
   * if we are to take the prop value which was provided at CandidateList:
   *
   */

  const { className, mappeduserState, ...rest } = props;

  console.log("the mapped user state for CandidatesTable is here:");
  console.dir(mappeduserState);

  const users = mappeduserState.candidates;
  const collaborators = mappeduserState.collaborators;
  const editCandidate = mappeduserState.userToEdit;
  const userToDelete = mappeduserState.userToDelete;

  //the methods
  const hideEditDialog = () => {
    props.mappedhideEditDialog();
  };

  const submitEditCandidate = (e) => {
    e.preventDefault();
    const editForm = document.getElementById("EditCandidateForm");
    const userData = props.mappeduserState;
    if (editForm.userName.value !== "") {
      const data = new FormData();
      data.append("id", userData.userToEdit._id);
      data.append("userName", editForm.userName.value);
      data.append("firstName", editForm.firstName.value);
      data.append("lastName", editForm.lastName.value);
      data.append("email", editForm.email.value);
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
            <CustomMaterialTable
                title={"candidate"}
                userPreferencePaginationKey={"candidates"}
                data={users}
                columns={[
                  {
                    title: "Full Name",
                    render: (user) => {
                      return (
                          <div className={classes.nameContainer}>
                            <Avatar className={classes.avatar} src={user.avatarUrl}>
                              {getInitials(
                                `${user.firstName + " " + user.lastName}`
                              )}
                            </Avatar>
                            <Typography variant="body1">
                              {" "}
                              {user.firstName + " " + user.lastName}
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
                    title: "Description",
                    field: "description",
                  },
                  {
                    title: "Organization",
                    field: "organization",
                  },
                  {
                    title: "Country",
                    field: "country",
                  },
                  {
                    title: "Job Title",
                    field: "jobTitle",
                  },
                  {
                    title: "Phone Number",
                    field: "phoneNumber"
                  },
                  {
                    title: "Action",
                    render: (candidate) => <Button color="primary">Confirm</Button>,
                  },
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
                <strong>{editCandidate.firstName}</strong>{" "}
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
        aria-labelledby="form-dialog-title"
      >
        <DialogContent>
          <DialogContentText>Delete Candidate</DialogContentText>

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
  fetchCandidates: PropTypes.func.isRequired,
};

export default usersStateConnector(CandidatesTable);
