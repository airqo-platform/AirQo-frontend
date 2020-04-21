import React from "react";
import { Link, withRouter } from "react-router-dom";

export default function Updated() {
  return (
    <div>
      <Link to="/" className="btn-flat waves-effect">
        <i className="material-icons left">keyboard_backspace</i> Back to home
      </Link>
      <p>
        Your password has been successfully reset, please try logging in again.
      </p>
      <p className="grey-text text-darken-1">
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
