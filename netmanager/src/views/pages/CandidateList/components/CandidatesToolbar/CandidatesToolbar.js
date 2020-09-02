/* eslint-disable */
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import {
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Input,
  MenuItem,
  DialogTitle,
  DialogContent,
  Dialog,
  DialogActions,
  DialogContentText,
} from "@material-ui/core";

import { useMinimalSelectStyles } from "@mui-treasury/styles/select/minimal";

import ExpandMoreIcon from "@material-ui/icons/ExpandMore";

import { SearchInput } from "views/components/SearchInput";

const useStyles = makeStyles((theme) => ({
  root: {},
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
    value: "admin",
    label: "admin",
  },
  {
    value: "user",
    label: "user",
  },
  {
    value: "collaborator",
    label: "collaborator",
  },
];

/***func starts here....... */
const UsersToolbar = (props) => {
  const { className, mappeduserState, ...rest } = props;

  console.log("the mapped state for UsersToolsbar is here:");
  console.dir(mappeduserState);

  const userState = mappeduserState;

  const [open, setOpen] = useState(false);

  const initialState = {
    userName: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    password2: "",
    privilege: "",
  };

  const [form, setState] = useState(initialState);

  const clearState = () => {
    setState({ ...initialState });
  };

  const classes = useStyles();

  const handleClickOpen = () => {
    setOpen(true);
    //I also need to trigger something here which enables updates the newUser state variable
    //update the user action for opening the dialog box of adding a new user.
    //I could now update the state using actions
    props.mappedShowAddDialog();
  };

  const handleClose = () => {
    setOpen(false);
    props.mappedHideAddDialog();
  };

  const hideAddDialog = () => {
    props.mappedHideAddDialog();
  };

  const onChange = (e) => {
    setState({
      ...form,
      [e.target.id]: e.target.value,
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const userData = {
      userName: form.userName,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password,
      password2: form.password2,
      privilege: form.privilege,
    };
    console.log(userData);
    props.mappedAddUser(userData);
    clearState();
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
        <SearchInput
          className={classes.searchInput}
          placeholder="Search user"
        />
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
              <TextField
                autoFocus
                margin="dense"
                id="email"
                name="Email Address"
                type="text"
                label="email"
                onChange={onChange}
                value={form.email}
                fullWidth
                InputProps={{ disableUnderline: true }}
              />

              <TextField
                margin="dense"
                id="firstName"
                name="firstName"
                label="first name"
                type="text"
                onChange={onChange}
                value={form.firstName}
                fullWidth
                InputProps={{ disableUnderline: true }}
              />
              <TextField
                margin="dense"
                id="lastName"
                label="last name"
                name="lastName"
                type="text"
                onChange={onChange}
                value={form.lastName}
                fullWidth
                InputProps={{ disableUnderline: true }}
              />

              <TextField
                margin="dense"
                id="userName"
                name="userName"
                label="user name"
                type="text"
                onChange={onChange}
                value={form.userName}
                fullWidth
                InputProps={{ disableUnderline: true }}
              />
              <TextField
                margin="dense"
                id="password"
                name="password"
                autoComplete="new-password"
                label="password"
                type="password"
                onChange={onChange}
                value={form.password}
                fullWidth
                InputProps={{
                  autocomplete: "new-password",
                  form: {
                    autocomplete: "off",
                  },
                  disableUnderline: true,
                }}
              />
              <TextField
                margin="dense"
                id="password2"
                label="confirm password"
                name="password2"
                type="password"
                onChange={onChange}
                value={form.password2}
                fullWidth
                InputProps={{
                  autocomplete: "new-password",
                  form: {
                    autocomplete: "off",
                  },
                  disableUnderline: true,
                }}
              />
              <TextField
                id="privilege"
                select
                label="Role"
                className={classes.textField}
                value={form.privilege}
                onChange={onChange}
                SelectProps={{
                  native: true,
                  MenuProps: {
                    className: classes.menu,
                  },
                }}
                helperText="Please select your role"
                margin="normal"
                variant="outlined"
              >
                {roles.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </TextField>
            </DialogContent>

            <DialogActions>
              <Button onClick={handleClose} color="primary" variant="outlined">
                Cancel
              </Button>
              <Button onClick={onSubmit} color="primary" variant="outlined">
                Submit
              </Button>
            </DialogActions>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

UsersToolbar.propTypes = {
  className: PropTypes.string,
};

export default UsersToolbar;
