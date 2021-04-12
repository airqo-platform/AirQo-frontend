/* eslint-disable */
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import clsx from "clsx";
import { omit } from "underscore";
import { makeStyles } from "@material-ui/styles";
import {
  Button,
  TextField,
  DialogTitle,
  DialogContent,
  Dialog,
  DialogActions,
} from "@material-ui/core";

import { Alert, AlertTitle } from "@material-ui/lab";
import { useMinimalSelectStyles } from "@mui-treasury/styles/select/minimal";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { useOrgData } from "redux/Join/selectors";
import usersStateConnector from "views/stateConnectors/usersStateConnector";


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
    userName: "",
    firstName: "",
    lastName: "",
    organization: orgData.name,
    email: "",
    password: "",
    password2: "",
    privilege: roles[0].value,
    errors: {},
  };

  const [form, setState] = useState(initialState);

  const clearState = () => {
    setState({ ...initialState });
  };

  const classes = useStyles();

  const handleClickOpen = () => {
    setOpen(true);
    props.mappedShowAddDialog();
  };
  //
  const handleClose = () => {
    setOpen(false);
    props.mappedHideAddDialog();
  };

  // const showAddDialog = () => {
  //   props.mappedShowAddDialog();
  // };

  // const hideAddDialog = () => {
  //   props.mappedHideAddDialog();
  // };

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
      case "password":
        errors.password = validPasswordRegex.test(value)
          ? ""
          : "Minimum six characters, at least one uppercase letter, one lowercase letter and one number!";
        break;
      case "email":
        errors.email = validEmailRegex.test(value) ? "" : "Email is not valid!";
        break;
      case "userName":
        errors.userName = value.length === 0 ? "userName is required" : "";
        break;
      case "password2":
        errors.password2 = validPasswordRegex.test(value)
          ? ""
          : "Minimum six characters, at least one uppercase letter, one lowercase letter and one number!";
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

    const { id, value } = e.target;
    let errors = form.errors;

    switch (id) {
      case "firstName":
        errors.firstName = mappedErrors.errors.firstName;
        break;
      case "lastName":
        errors.lastName = mappedErrors.errors.lastName;
        break;
      case "email":
        errors.email = mappedErrors.errors.email;
        break;
      case "password":
        errors.password = mappedErrors.errors.password;
        break;
      case "password2":
        errors.password2 = mappedErrors.errors.password2;
        break;
      case "userName":
        errors.userName = mappedErrors.errors.userName;
        break;
      case "privilege":
        errors.privilege = mappedErrors.errors.privilege;
        break;
      default:
        break;
    }
    const userData = omit(form)
    if (userData.password !== userData.password2) {
      alert("Passwords don't match");
    } else {
      props.mappedAddUser(userData);
      clearState();
    }
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
              {mappeduserState.showAddDialog &&
                !mappeduserState.successMg &&
                !mappeduserState.newUser && (
                  <div>
                    <TextField
                      autoFocus
                      margin="dense"
                      id="email"
                      name="Email Address"
                      type="text"
                      label="email"
                      helperText={form.errors.email}
                      error={form.errors.email}
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
                      helperText={form.errors.firstName}
                      error={form.errors.firstName}
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
                      helperText={form.errors.lastName}
                      error={form.errors.lastName}
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
                      helperText={form.errors.organization}
                      error={form.errors.organization}
                      onChange={onChange}
                      value={form.organization}
                      disabled
                      variant="outlined"
                      fullWidth
                    />

                    <TextField
                      margin="dense"
                      id="userName"
                      name="userName"
                      label="user name"
                      type="text"
                      helperText={form.errors.userName}
                      error={form.errors.userName}
                      onChange={onChange}
                      value={form.userName}
                      variant="outlined"
                      fullWidth
                    />
                    <TextField
                      margin="dense"
                      id="password"
                      name="password"
                      autoComplete="new-password"
                      label="password"
                      helperText={form.errors.password}
                      error={form.errors.password}
                      type="password"
                      onChange={onChange}
                      value={form.password}
                      variant="outlined"
                      fullWidth
                      InputProps={{
                        autocomplete: "new-password",
                        form: {
                          autocomplete: "off",
                        },
                      }}
                    />
                    <TextField
                      margin="dense"
                      id="password2"
                      label="confirm password"
                      name="password2"
                      type="password"
                      onChange={onChange}
                      variant="outlined"
                      value={form.password2}
                      helperText={form.errors.password2}
                      error={form.errors.password2}
                      fullWidth
                      InputProps={{
                        autocomplete: "new-password",
                        form: {
                          autocomplete: "off",
                        },
                      }}
                    />
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
                      helperText={form.errors.privilege}
                      error={form.errors.privilege}
                      variant="outlined"
                    >
                      {roles.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </TextField>
                  </div>
                )}

              {mappeduserState.newUser &&
                !mappeduserState.error &&
                mappeduserState.isFetching &&
                !mappeduserState.successMg && (
                  <Alert severity="success">
                    <strong> Adding user.... </strong>
                  </Alert>
                )}

              {mappeduserState.successMsg &&
                !mappeduserState.isFetching &&
                mappeduserState.newUser && (
                  <Alert severity="success">
                    <AlertTitle>Success</AlertTitle>
                    User <strong> {mappeduserState.successMsg}</strong>
                  </Alert>
                )}
            </DialogContent>

            <DialogActions>
              {!mappeduserState.successMsg && !mappeduserState.isFetching && (
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
              )}
              {mappeduserState.successMsg &&
                !mappeduserState.isFetching &&
                mappeduserState.newUser && (
                  <Button onClick={handleClose}>Close</Button>
                )}
            </DialogActions>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

// UsersToolbar.propTypes = {
//   className: PropTypes.string
// };

// export default UsersToolbar;

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
