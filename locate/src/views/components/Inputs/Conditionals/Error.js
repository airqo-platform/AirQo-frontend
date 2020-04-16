import React, { Component } from "react";
import { Link } from "react-router-dom";

const loading = {
  margin: "1em",
  fontSize: "24px",
};

const title = {
  pageTitle: "Password Reset Screen",
};

export default class Error extends Component {
  render() {
    return (
      <div>
        <div style={loading}>
          <h4>Problem resetting password. Please send another reset link.</h4>
          <Link to="/" className="btn-flat waves-effect">
            <i className="material-icons left">keyboard_backspace</i> Back to
            home
          </Link>
          <div className="col s12" style={{ paddingLeft: "11.250px" }}>
            <h4>
              <b>Reset Password Error</b>
            </h4>
            <p className="grey-text text-darken-1">
              Don't have an account? <Link to="/register">Register</Link>
            </p>
          </div>
          <div className="col s12" style={{ paddingTop: "20px" }}>
            <Link to="/forgot"> Forgotten Password?</Link>
          </div>
        </div>
      </div>
    );
  }
}
