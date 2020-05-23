/* eslint-disable */
import React, { Component } from "react";
import TextField from "@material-ui/core/TextField";
import axios from "axios";

//new imports
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { forgotPassword } from "../../../redux/Join/actions";
import { Link, withRouter } from "react-router-dom";
import classnames from "classnames";
import { verifyToken } from "../../../redux/Join/utils";
import constants from "../../../config/constants";

const title = {
  pageTitle: "Forgot Password Screen",
};

class ForgotPassword extends Component {
  constructor() {
    super();

    this.state = {
      email: "",
      showError: false,
      messageFromServer: "",
      errors: {},
    };
  }

  async componentDidMount() { }

  onChange = (e) => {
    this.setState({
      [e.target.id]: e.target.value,
    });
  };

  onSubmit = (e) => {
    e.preventDefault();
    const { email } = this.state;
    const userData = {
      email,
    };

    this.props.forgotPassword(userData);
    this.setState({
      email: "",
    });
  };

  render() {
    const { errors } = this.state;

    return (
      <div className="container">
        <div style={{ marginTop: "4rem" }} className="row">
          <div className="col s8 offset-s2">
            <Link to="/" className="btn-flat waves-effect">
              <i className="material-icons left">keyboard_backspace</i> Back to
              home
            </Link>
            <div className="col s12" style={{ paddingLeft: "11.250px" }}>
              <h4>
                <b>Forgot Password</b>
              </h4>
            </div>
            <form noValidate onSubmit={this.onSubmit}>
              <div className="input-field col s12">
                <input
                  onChange={this.onChange}
                  value={this.state.email}
                  error={errors.email}
                  id="email"
                  type="email"
                  className={classnames("", {
                    invalid: errors.email || errors.emailnotfound,
                  })}
                />
                <label htmlFor="email">Email</label>
                <span className="red-text">
                  {errors.email}
                  {errors.emailnotfound}
                </span>
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
                  className="btn btn-large waves-effect waves-light hoverable blue accent-3"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }
}

ForgotPassword.propTypes = {
  forgotPassword: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
};

const mapSateToProps = (state) => ({
  errors: state.errors,
});

export default connect(mapSateToProps, { forgotPassword })(ForgotPassword);

//