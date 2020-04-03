import React, { Component } from "react";
import axios from "axios";

import TextField from "@material-ui/core/TextField";

//new imports
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { updatePassword } from "../../../redux/Join/actions";
import { Link, withRouter } from "react-router-dom";
import classnames from "classnames";

const loading = {
  margin: "1em",
  fontSize: "24px"
};

const title = {
  pageTitle: "Password Reset Screen"
};

class ResetPassword extends Component {
  constructor() {
    super();

    this.state = {
      username: "",
      password: "",
      confirmPassword: "",
      update: false,
      isLoading: true,
      error: false
    };
  }
  //fires as soon as the page is reached
  //extract token and DATE from URL params and
  //passes it back to server's reset route for verification
  async componentDidMount() {
    console.log(this.props.match.params.token);
    const token = {
      params: {
        ResetPasswordToken: this.props.match.params.token
      }
    };
    this.props.verifyToken(token);
  }

  onChange = e => {
    this.setState({
      [e.target.id]: e.target.value
    });
  };

  //if the user is authenticated and allowed to reset their password.
  //update password while logged into the app, as well
  onSubmit = e => {
    e.preventDefault();
    const userData = {
      username: this.state.username,
      password: this.state.password
    };
    this.props.updatePassword(userData);
  };

  render() {
    const { errors } = this.state;

    return (
      <div className="container">
        <div className="row">
          <div className="col s8 offset-s2">
            <Link to="/" className="btn-flat waves-effect">
              <i className="material-icons left">keyboard_backspace</i> Back to
              home
            </Link>
            <div className="col s12" style={{ paddingLeft: "11.250px" }}>
              <h4>
                <b>Reset Password</b>
              </h4>
            </div>
            <form noValidate onSubmit={this.onSubmit}>
              å
              <div className="input-field col s12">
                <input
                  onChange={this.onChange}
                  value={this.state.password}
                  error={errors.password}
                  id="password"
                  type="password"
                  className={classnames("", {
                    invalid: errors.password
                  })}
                />
                <label htmlFor="password">Password</label>
                <span className="red-text">{errors.password}</span>
              </div>
              <div className="input-field col s12">
                <input
                  onChange={this.onChange}
                  value={this.state.password2}
                  error={errors.password2}
                  id="password2"
                  type="password"
                  className={classnames("", {
                    invalid: errors.password2
                  })}
                />
                <label htmlFor="password2">Confirm Password</label>
                <span className="red-text">{errors.password2}</span>
              </div>
              <div className="col s12" style={{ paddingLeft: "11.250px" }}>
                <button
                  style={{
                    width: "150px",
                    borderRadius: "3px",
                    letterSpacing: "1.5px",
                    marginTop: "1rem"
                  }}
                  type="submit"
                  className="btn btn-large waves-effect waves-light hoverable blue accent-3"
                >
                  Reset
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

ResetPassword.propTypes = {
  resetPassword: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired
};

const mapSateToProps = state => ({
  errors: state.errors
});

export default connect(mapSateToProps, { updatePassword })(
  withRouter(ResetPassword)
);
