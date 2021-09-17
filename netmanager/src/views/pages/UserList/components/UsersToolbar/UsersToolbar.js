/* eslint-disable */
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {connect, useDispatch} from "react-redux";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import {
  Button,
  TextField,
  DialogTitle,
  DialogContent,
  Dialog,
  DialogActions,
} from "@material-ui/core";

import { useMinimalSelectStyles } from "@mui-treasury/styles/select/minimal";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { useOrgData } from "redux/Join/selectors";
import usersStateConnector from "views/stateConnectors/usersStateConnector";
import { addUserApi } from "views/apis/authService";
import { updateMainAlert } from "redux/MainAlert/operations";
import { createAlertBarExtraContentFromObject } from "utils/objectManipulators";
import { fetchUsers } from "redux/Join/actions";


const useStyles = makeStyles((theme) => ({
  root: {
    "&$error": {
      color: "red",
    },
  },
  error: {},
  row: {
    height: "42px",
    display: "flex",
    alignItems: "center",
    marginTop: theme.spacing(1),
  },
  spacer: {
    flexGrow: 1,
  },
  importButton: {
    marginRight: theme.spacing(1),
  },
  exportButton: {
    marginRight: theme.spacing(1),
  },
  searchInput: {
    marginRight: theme.spacing(1),
  },
  container: {
    display: "flex",
    flexWrap: "wrap",
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  },
  dense: {
    marginTop: 16,
  },
  menu: {
    width: 200,
  },
}));

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

const validPasswordRegex = RegExp(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/);
const validEmailRegex = RegExp(
  /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
);

/***func starts here....... */
const UsersToolbar = (props) => {
  const { className, mappeduserState, mappedErrors, ...rest } = props;

  const [open, setOpen] = useState(false);
 const orgData = useOrgData();

  const initialState = {
    firstName: "",
    lastName: "",
    organization: orgData.name,
    long_organization: orgData.name,
    email: "",
    privilege: roles[0].value,
    errors: {},
  };
  const initialStateErrors = {
    firstName: "",
    lastName: "",
    organization: "",
    email: "",
    privilege: "",
    errors: "",
  };

  const dispatch = useDispatch();
  const [form, setState] = useState(initialState);
  const [errors, setErrors] = useState(initialStateErrors);

  const clearState = () => {
    setState({ ...initialState });
  };

  const classes = useStyles();

  const handleClickOpen = () => {
    setOpen(true);
  };
  //
  const handleClose = () => {
    setOpen(false);
    setErrors(initialStateErrors)
      setState(initialState)
  };

  const onChange = (e) => {
    e.preventDefault();
    const { id, value } = e.target;
    let errors = form.errors;

    switch (id) {
      case "firstName":
        errors.firstName = value.length === 0 ? "first name is required" : "";
        break;
      case "lastName":
        errors.lastName = value.length === 0 ? "last name is required" : "";
        break;
      case "email":
        errors.email = validEmailRegex.test(value) ? "" : "Email is not valid!";
        break;
      case "userName":
        errors.userName = value.length === 0 ? "userName is required" : "";
        break;
      case "privilege":
        errors.privilege = value.length === 0 ? "role is required" : "";
        break;

      default:
        break;
    }

    setState(
      {
        ...form,
        [id]: value,
      },
      () => {
        console.log(errors);
      }
    );
  };

  const onSubmit = (e) => {
    e.preventDefault();
    setOpen(false)
    addUserApi(form).then(resData => {
      dispatch(fetchUsers())
      setErrors(initialStateErrors)
      setState(initialState)
      dispatch(
          updateMainAlert({
            message: resData.message,
            show: true,
            severity: "success",
          })
        );
    }).catch(error => {
      const errors =
          error.response && error.response.data && error.response.data.errors;
      setErrors(errors || initialStateErrors);
      dispatch(
          updateMainAlert({
            message:
              error.response &&
              error.response.data &&
              error.response.data.message,
            show: true,
            severity: "error",
            extra: createAlertBarExtraContentFromObject(
              errors || {}),
          })
        );
    })
  };

  const minimalSelectClasses = useMinimalSelectStyles();

  useEffect(() => {
    clearState();
  }, []);

  const iconComponent = (props) => {
    return (
      <ExpandMoreIcon
        className={props.className + " " + minimalSelectClasses.icon}
      />
    );
  };

  // moves the menu below the select input
  const menuProps = {
    classes: {
      paper: minimalSelectClasses.paper,
      list: minimalSelectClasses.list,
    },
    anchorOrigin: {
      vertical: "bottom",
      horizontal: "left",
    },
    transformOrigin: {
      vertical: "top",
      horizontal: "left",
    },
    getContentAnchorEl: null,
  };

  return (
    <div
      // {...rest}
      className={clsx(classes.root, className)}
    >
      <div className={classes.row}>
        <span className={classes.spacer} />
        <div>
          <Button variant="contained" color="primary" onClick={handleClickOpen}>
            Add User
          </Button>
          <Dialog
            open={open}
            onClose={handleClose}
            aria-labelledby="form-dialog-title"
          >
            <DialogTitle id="form-dialog-title">Add User</DialogTitle>
            <DialogContent>
              <div>
                <TextField
                  autoFocus
                  margin="dense"
                  id="email"
                  name="Email Address"
                  type="text"
                  label="email"
                  helperText={errors.email}
                  error={!!errors.email}
                  onChange={onChange}
                  variant="outlined"
                  value={form.email}
                  fullWidth
                />

                <TextField
                  margin="dense"
                  id="firstName"
                  name="firstName"
                  label="first name"
                  type="text"
                  helperText={errors.firstName}
                  error={!!errors.firstName}
                  onChange={onChange}
                  value={form.firstName}
                  variant="outlined"
                  fullWidth
                />
                <TextField
                  margin="dense"
                  id="lastName"
                  label="last name"
                  name="lastName"
                  type="text"
                  helperText={errors.lastName}
                  error={!!errors.lastName}
                  onChange={onChange}
                  value={form.lastName}
                  variant="outlined"
                  fullWidth
                />

                <TextField
                  margin="dense"
                  id="organization"
                  label="organization"
                  name="organization"
                  type="text"
                  helperText={errors.organization}
                  error={!!errors.organization}
                  onChange={onChange}
                  value={form.organization}
                  disabled
                  variant="outlined"
                  fullWidth
                />

                {/*<TextField*/}
                {/*  margin="dense"*/}
                {/*  id="userName"*/}
                {/*  name="userName"*/}
                {/*  label="user name"*/}
                {/*  type="text"*/}
                {/*  helperText={errors.userName}*/}
                {/*  error={!!errors.userName}*/}
                {/*  onChange={onChange}*/}
                {/*  value={form.userName}*/}
                {/*  variant="outlined"*/}
                {/*  fullWidth*/}
                {/*/>*/}
                <TextField
                  id="privilege"
                  select
                  fullWidth
                  label="Role"
                  style={{marginTop: "15px"}}
                  value={form.privilege}
                  onChange={onChange}
                  SelectProps={{
                    native: true,
                    style: { width: "100%", height: "50px" },
                    MenuProps: {
                      className: classes.menu,
                    },
                  }}
                  helperText={errors.privilege}
                  error={!!errors.privilege}
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
                  onClick={handleClose}
                  color="primary"
                  variant="outlined"
                >
                  Cancel
                </Button>
                <Button style={{margin: "0 15px"}} onClick={onSubmit} color="primary" variant="contained">
                  Submit
                </Button>
              </div>
            </DialogActions>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

UsersToolbar.propTypes = {
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  className: PropTypes.string,
};
const mapStateToProps = (state) => ({
  auth: state.auth,
  errors: state.errors,
});
export default usersStateConnector(connect(mapStateToProps)(UsersToolbar));
