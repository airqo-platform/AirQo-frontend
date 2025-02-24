/* eslint-disable */
import React, { useState } from "react";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { isEqual } from "underscore";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Divider,
  Button,
  TextField,
} from "@material-ui/core";
import Alert from '@material-ui/lab/Alert';
import { CircularLoader } from "views/components/Loader/CircularLoader";
import { updateUserPasswordApi } from "views/apis/authService";
import { useOrgData } from "redux/Join/selectors";
import usersStateConnector from "views/stateConnectors/usersStateConnector";
import { updateMainAlert } from "redux/MainAlert/operations";

const validPasswordRegex = RegExp(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/);

const useStyles = makeStyles(() => ({
  root: {},
}));

const SettingsPassword = (props) => {
  const { className, mappedAuth, mappeduserState, ...rest } = props;
  const { user } = mappedAuth;
  const dispatch = useDispatch();

  const orgData = useOrgData();

  const classes = useStyles();

  const initialState = {
    currentPassword: "",
    password: "",
    password2: "",
  };

  const alertInitialState = {
    show: false,
    message: "",
    type: "success"
  }

  const [newPassword, setNewPassword] = useState(initialState);
  const [errors, setErrors] = useState(initialState)
  const [alert, setAlert] = useState(alertInitialState)
  const [loading, setLoading] = useState(false);


  const clearState = () => {
    setNewPassword({ ...initialState });
  };

  const closeAlert = () => {
    setAlert(alertInitialState)
  }

  const setFieldError = (error) => {
    setErrors({...errors, ...error})
  }

  const handleChange = (event) => {
    const id = event.target.id;
    const value =event.target.value;
    const newErrors = {}
    if (id === "password") {
      newErrors.password = validPasswordRegex.test(value)
          ? ""
          : "Minimum six characters, at least one uppercase letter, one lowercase letter and one number!";
    }
    if (["password", "password2"].includes(id)) {
      if (value !== newPassword.password) {
        newErrors.password2 = "passwords don't match"
      } else { newErrors.password2 = "" }
    }
    setFieldError({ ...errors, ...newErrors })
    setNewPassword({
      ...newPassword,
      [event.target.id]: event.target.value,
    });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const userId = user._id;
    const tenant = orgData.name
    const userData = {
      ...newPassword,
      old_password: newPassword.currentPassword,
    };
    setLoading(true);
    await updateUserPasswordApi(userId, tenant, userData)
        .then(data => {
          dispatch(updateMainAlert({
            severity: "success",
            show: true,
            message: "Password updated successfully",
          }))
        })
        .catch(err => {

          dispatch(updateMainAlert({
            severity: "error",
            show: true,
            message: err.response.data.message || err.response.data.password2 || "Password update failed",
          }))
        })
    setLoading(false);
    clearState();
  };

  return (
    <Card {...rest} className={clsx(classes.root, className)}>
      <CardHeader subheader="Update password" title="Password" />
      <Divider />
      <CardContent>
        <TextField
          fullWidth
          label="Current Password"
          id="currentPassword"
          onChange={handleChange}
          type="password"
          value={newPassword.currentPassword}
          variant="outlined"
        />
        <TextField
          fullWidth
          label="New Password"
          id="password"
          onChange={handleChange}
          type="password"
          value={newPassword.password}
          variant="outlined"
          style={{ marginTop: "1rem" }}
          error={!!errors.password}
          helperText={errors.password}
        />
        <TextField
          fullWidth
          label="Confirm New Password"
          id="password2"
          onChange={handleChange}
          style={{ marginTop: "1rem" }}
          type="password"
          value={newPassword.password2}
          variant="outlined"
          error={!!errors.password2}
          helperText={errors.password2}
        />
      </CardContent>

      <Divider />

      <CardContent style={alert.show ? {} : {display: "none"}}>
          <Alert severity={alert.type} onClose={closeAlert}>{alert.message}</Alert>
      </CardContent>

      <CardActions>
        <Button color="primary" variant="outlined" onClick={onSubmit} disabled={isEqual(initialState, newPassword)}>
          Update
        </Button>
        <CircularLoader loading={loading} />
      </CardActions>
    </Card>
  );
};

SettingsPassword.propTypes = {
  className: PropTypes.string,
  mappedAuth: PropTypes.object.isRequired,
  mappeduserState: PropTypes.object.isRequired,
  updatePassword: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  userState: state.userState,
});

export default usersStateConnector(SettingsPassword);
