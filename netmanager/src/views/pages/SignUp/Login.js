import React, { Component } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { CardContent } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import { clearErrors, loginUser } from "../../../redux/Join/actions";
import classnames from "classnames";
import { isEmpty, omit } from "underscore";
import { isFormFullyFilled } from "./utils";
import usrsStateConnector from "views/stateConnectors/usersStateConnector";

class Login extends Component {
  constructor(props) {
    super(props);
    this.query = new URLSearchParams(this.props.location.search);
    this.state = {
      organization: this.query.get("organization") || "",
      userName: "",
      password: "",
      errors: {},
    };
  }

  componentDidMount() {
    var anchorElem = document.createElement("link");
    anchorElem.setAttribute(
      "href",
      "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css"
    );
    anchorElem.setAttribute("rel", "stylesheet");
    anchorElem.setAttribute("id", "logincdn");

    //document.body.appendChild(anchorElem);
    document.getElementsByTagName("head")[0].appendChild(anchorElem);
    // If logged in and user navigates to Login page, should redirect them to dashboard
    if (this.props.auth.isAuthenticated) {
      this.props.history.push("/dashboard");
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.auth.isAuthenticated) {
      this.props.history.push("/dashboard"); // push user to dashboard when they login
    }
    if (nextProps.errors) {
      this.setState({
        errors: nextProps.errors,
      });
    }
  }

  componentWillUnmount() {
    let el = document.getElementById("logincdn");
    el.remove();
  }

  onChange = (e) => {
    e.preventDefault();
    const { id, value } = e.target;
    let errors = this.props.errors;

    if (id === "organization") {
      window.history.pushState(
        {},
        null,
        `${window.location.pathname}?${id}=${value}`
      );
    }

    errors[id] = value.length === 0 ? `${id.toLowerCase()} is required` : "";

    this.setState(
      {
        errors,
        [id]: value,
      },
      () => {
        console.log(errors);
      }
    );
  };

  onSubmit = (e) => {
    e.preventDefault();
    const emptyFields = isFormFullyFilled(this.state);
    const userData = omit(this.state, "errors");

    if (!isEmpty(emptyFields)) {
      this.setState({
        ...this.state,
        errors: {
          ...this.state.errors,
          ...emptyFields,
        },
      });
      return;
    }
    this.props.clearErrors();
    this.props.loginUser(userData);
    // since we handle the redirect within our component, we don't need to pass in this.props.history as a parameter
  };
  render() {
    const { errors } = this.state;
    return (
      <div className="container">
        <div
          className="row"
          style={{
            marginTop: "4rem",
            height: "auto",
            backgroundColor: "#3067e2",
          }}
        >
          <div
            className="col s4"
            style={{
              padding: "1em",
            }}
          ></div>
          <div
            className="col s8"
            style={{ backgroundColor: "#fff", padding: "1em" }}
          >
            <div className="col s12" style={{ paddingLeft: "11.250px" }}>
              <h4>
                <b>Login</b>
              </h4>
              <p className="grey-text text-darken-1">
                Don't have an account?{" "}
                <Link to="/request-access">Request Access</Link>
              </p>
            </div>
            <form noValidate onSubmit={this.onSubmit}>
              <CardContent
                style={
                  isEmpty(this.props.errors.data) ? { display: "none" } : {}
                }
              >
                <Alert
                  severity="error"
                  onClose={() => {
                    this.props.clearErrors();
                  }}
                >
                  {this.props.errors.data && this.props.errors.data.message}
                </Alert>
              </CardContent>
              <div className="input-field col s12">
                <input
                  onChange={this.onChange}
                  value={this.state.organization}
                  error={errors.organization}
                  id="organization"
                  type="text"
                  className={classnames("", {
                    invalid: errors.organization || errors.credentialsnotfound,
                  })}
                />
                <label htmlFor="organization">Organization</label>
                <span className="red-text">
                  {errors.organization}
                  {errors.credentialsnotfound}
                </span>
              </div>
              <div className="input-field col s12">
                <input
                  onChange={this.onChange}
                  value={this.state.userName}
                  error={errors.userName}
                  id="userName"
                  type="text"
                  className={classnames("", {
                    invalid: errors.userName || errors.credentialsnotfound,
                  })}
                />
                <label htmlFor="userName">Username</label>
                <span className="red-text">
                  {errors.userName}
                  {errors.credentialsnotfound}
                </span>
              </div>
              <div className="input-field col s12">
                <input
                  onChange={this.onChange}
                  value={this.state.password}
                  error={errors.password}
                  id="password"
                  type="password"
                  className={classnames("", {
                    invalid: errors.password || errors.passwordincorrect,
                  })}
                />
                <label htmlFor="password">Password</label>
                <span className="red-text">
                  {errors.password}
                  {errors.passwordincorrect}
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
                  Login
                </button>
              </div>
            </form>
            <div></div>
            <div className="col s12" style={{ paddingTop: "20px" }}>
              <Link to="/forgot"> Forgotten Password?</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
Login.propTypes = {
  clearErrors: PropTypes.func.isRequired,
  loginUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  location: PropTypes.object,
};
const mapStateToProps = (state) => ({
  auth: state.auth,
  errors: state.errors,
});
export default usrsStateConnector(
  connect(mapStateToProps, { clearErrors, loginUser })(Login)
);
