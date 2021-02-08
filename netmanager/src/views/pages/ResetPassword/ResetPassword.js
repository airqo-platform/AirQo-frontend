/* eslint-disable */
import React, { useState } from "react";
import axios from "axios";
import Alert from "@material-ui/lab/Alert";
import Collapse from "@material-ui/core/Collapse";
import PropTypes from "prop-types";
import { isEqual, isEmpty } from "underscore";

import { Link, useLocation, BrowserRouter as Router } from "react-router-dom";

import classnames from "classnames";
import constants from "../../../config/constants";

const validPasswordRegex = RegExp(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/);

export default function ResetPassword() {
  const passwordInitialState = {
    confirmPassword: "",
    password: "",
  };

  const alertInitialState = {
    open: false,
    message: "",
    severity: "",
  };

  const [newPassword, setNewPassword] = useState(passwordInitialState);

  const [errors, setErrors] = useState(passwordInitialState);

  const [alert, setAlert] = useState(alertInitialState);

  const [updated, setUpdated] = useState(false);

  const query = new URLSearchParams(useLocation().search);

  const isEnabled =
    isEmpty(errors.confirmPassword) &&
    isEmpty(errors.password) &&
    !isEmpty(newPassword.password) &&
    !isEmpty(newPassword.confirmPassword) &&
    isEqual(newPassword.password, newPassword.confirmPassword)
      ? true
      : false;

  const onChange = (e) => {
    const id = e.target.id;
    const value = e.target.value;
    const passwordErrors = {};

    if (id === "password") {
      passwordErrors.password = validPasswordRegex.test(value)
        ? ""
        : "Minimum six characters, at least one uppercase letter, one lowercase letter and one number!";
    }
    if (id === "confirmPassword") {
      passwordErrors.confirmPassword =
        value !== newPassword.password ? "passwords don't match" : "";
    }

    setErrors(passwordErrors);

    setNewPassword({
      ...newPassword,
      [id]: value,
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();

    const { password } = newPassword;

    const token = query.get("token");
    const tenant = query.get("tenant");

    return axios
      .put(
        constants.UPDATE_PWD_URI,
        {
          password,
          resetPasswordToken: token,
        },
        {
          params: {
            tenant,
          },
        }
      )
      .then((response) => {
        console.log("response: ", response.data);
        setNewPassword({
          password: "",
          confirmPassword: "",
        });
        setAlert({
          open: true,
          message: response.data.message,
          severity: "success",
        });
        setUpdated(true);
      })
      .catch((e) => {
        setAlert({
          open: true,
          message: e.response.data.message,
          severity: "error",
        });
        console.log(e.data);
      });
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col s8 offset-s2">
          <div className="col s12" style={{ paddingLeft: "11.250px" }}>
            <h4>
              <b>Reset Password</b>
            </h4>
          </div>

          {!updated && (
            <form noValidate onSubmit={onSubmit}>
              <div className="input-field col s12">
                <Collapse in={alert.open}>
                  <Alert
                    severity={alert.severity}
                    onClose={() => setAlert({ ...alert, open: false })}
                  >
                    {alert.message}
                  </Alert>
                </Collapse>
              </div>
              <div className="input-field col s12">
                <input
                  onChange={onChange}
                  value={newPassword.password}
                  error={errors.password}
                  id="password"
                  type="password"
                  className={classnames("", {
                    invalid: errors.password,
                  })}
                />
                <label htmlFor="password">Password</label>
                <span className="red-text">{errors.password}</span>
              </div>
              <div className="input-field col s12">
                <input
                  onChange={onChange}
                  value={newPassword.confirmPassword}
                  error={errors.confirmPassword}
                  id="confirmPassword"
                  type="password"
                  className={classnames("", {
                    invalid: errors.confirmPassword,
                  })}
                />
                <label htmlFor="confirmPassword">Confirm Password</label>
                <span className="red-text">{errors.confirmPassword}</span>
              </div>
              <div className="col s12" style={{ paddingLeft: "11.250px" }}>
                <button
                  style={{
                    width: "150px",
                    borderRadius: "3px",
                    letterSpacing: "1.5px",
                    marginTop: "1rem",
                  }}
                  type="submit"
                  disabled={!isEnabled}
                  className="btn btn-large waves-effect waves-light hoverable blue accent-3"
                >
                  Reset
                </button>
              </div>
            </form>
          )}
          {updated && (
            <div>
              <Link to="/" className="btn-flat waves-effect">
                <i className="material-icons left">keyboard_backspace</i> Back
                to home
              </Link>
              <p>
                Your password has been successfully reset, please try to login
                again.
              </p>
              <p className="grey-text text-darken-1">
                Navigate to the Login Page <Link to="/login">Log in</Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

ResetPassword.propTypes = {
  errors: PropTypes.object.isRequired,
  match: PropTypes.shape({
    params: PropTypes.shape({
      token: PropTypes.string.isRequired,
    }),
  }),
};

const mapSateToProps = (newPassword) => ({
  errors: newPassword.errors,
});
