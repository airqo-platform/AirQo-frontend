/* eslint-disable */
import React, { useState } from "react";
import PropTypes from "prop-types";
import clsx from "clsx";
import { makeStyles } from "@material-ui/styles";
import { isEqual } from "underscore";
import { updatePassword } from "redux/Join/actions";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Divider,
  Button,
  TextField,
} from "@material-ui/core";

const useStyles = makeStyles(() => ({
  root: {},
}));

const Password = (props) => {
  const { className, mappedAuth, mappeduserState, ...rest } = props;
  const { user } = mappedAuth;
  const userState = mappeduserState;

  const classes = useStyles();

  const initialState = {
    password: "",
    password2: "",
  };

  const [newPassword, setNewPassword] = useState(initialState);

  const clearState = () => {
    setNewPassword({ ...initialState });
  };

  const handleChange = (event) => {
    setNewPassword({
      ...newPassword,
      [event.target.id]: event.target.value,
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const userData = {
      id: user._id,
      password: newPassword.password,
      password2: newPassword.password2,
    };
    console.log("sending them through...");
    console.log(userData);
    props.mappedUpdatePassword(userData);
    clearState();
  };

  return (
    <Card {...rest} className={clsx(classes.root, className)}>
      <CardHeader subheader="Update password" title="Password" />
      <Divider />
      <CardContent>
        <TextField
          fullWidth
          label="Password"
          id="password"
          onChange={handleChange}
          type="password"
          value={newPassword.password}
          variant="outlined"
        />
        <TextField
          fullWidth
          label="Confirm password"
          id="password2"
          onChange={handleChange}
          style={{ marginTop: "1rem" }}
          type="password"
          value={newPassword.password2}
          variant="outlined"
        />
      </CardContent>
      <Divider />
      <CardActions>
        <Button color="primary" variant="outlined" onClick={onSubmit} disabled={isEqual(initialState, newPassword)}>
          Update
        </Button>
      </CardActions>
    </Card>
  );
};

Password.propTypes = {
  className: PropTypes.string,
  mappedAuth: PropTypes.object.isRequired,
  mappeduserState: PropTypes.object.isRequired,
  updatePassword: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  userState: state.userState,
});

export default Password;
