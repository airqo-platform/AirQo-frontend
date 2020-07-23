/* eslint-disable */
import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { registerCandidate } from "../../../redux/Join/actions";
import classnames from "classnames";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import countries from "../../../utils/countries";
import { Alert, AlertTitle } from "@material-ui/lab";
import { withStyles, InputLabel } from "@material-ui/core";

const styles = (theme) => ({
  root: {
    width: "100%",
    "& > * + *": {
      marginTop: theme.spacing(2),
    },
  },
});

const validEmailRegex = RegExp(
  /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
);

const validateForm = (errors) => {
  let valid = true;
  Object.values(errors).forEach(
    // if we have an error string set valid to false
    (val) => val.length > 0 && (valid = false)
  );
  return valid;
};

class Register extends Component {
  constructor() {
    super();
    this.state = {
      firstName: "",
      lastName: "",
      email: "",
      country: "",
      phoneNumber: "",
      jobTitle: "",
      description: "",
      organization: "",
      errors: {},
      isChecked: {},
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
    if (nextProps.auth.registered) {
      this.props.history.push("/login"); // push user to the landing page after successfull signup
    }
    if (nextProps.errors) {
      this.setState({
        errors: nextProps.errors,
      });
    }
  }

  onChange = (e) => {
    // this.setState({ [e.target.id]: e.target.value });

    e.preventDefault();
    const { id, value } = e.target;
    let errors = this.props.errors;

    switch (id) {
      case "firstName":
        errors.firstName = value.length === 0 ? "first name is required" : "";
        break;
      case "lastName":
        errors.lastName = value.length === 0 ? "last name is required" : "";
        break;
      case "email":
        errors.email = validEmailRegex.test(value) ? "" : "Email is not valid!";
        break;
      case "organization":
        errors.organization =
          value.length === 0 ? "organization is required" : "";
        break;
      case "jobTitle":
        errors.jobTitle = value.length === 0 ? "job title is required" : "";
        break;
      case "phoneNumber":
        errors.phoneNumber =
          value.length === 0 ? "phone number  is required" : "";
        break;
      case "country":
        errors.country = value.length === 0 ? "country is required" : "";
        break;

      default:
        break;
    }

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

  handleCheck = (event) => {
    this.state.isChecked = event.target.checked;
    this.setState({ isChecked: this.state.isChecked });
  };

  clearState = () => {
    const initialState = {
      firstName: "",
      lastName: "",
      email: "",
      country: "",
      phoneNumber: "",
      jobTitle: "",
      description: "",
      organization: "",
      errors: {},
      isChecked: {},
    };
    this.setState(initialState);
  };

  onSubmit = (e) => {
    e.preventDefault();
    if (validateForm(this.state.errors)) {
      console.info("Valid Form");
    } else {
      console.error("Invalid Form");
    }

    const { id, value } = e.target;
    let errors = this.state.errors;
    // const { errors } = this.state;

    switch (id) {
      case "firstName":
        console.log("the firstName error");
        errors.firstName = mappedErrors.errors.firstName;
        console.log(errors.firstName);
        break;
      case "lastName":
        errors.lastName = mappedErrors.errors.lastName;
        break;
      case "email":
        errors.email = mappedErrors.errors.email;
        break;
      case "organization":
        errors.organization = mappedErrors.errors.organization;
        break;
      case "jobTitle":
        errors.jobTitle = mappedErrors.errors.jobTitle;
        break;
      case "phoneNumber":
        errors.phoneNumber = mappedErrors.errors.phoneNumber;
        break;
      case "country":
        errors.country = mappedErrors.errors.country;
        break;
      default:
        break;
    }

    const newUser = {
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      email: this.state.email,
      organization: this.state.company,
      jobTitle: this.state.jobTitle,
      phoneNumber: this.state.phoneNumber,
      country: this.state.country,
      description: this.state.description,
      organization: this.state.organization,
    };
    console.log(newUser);
    this.props.registerCandidate(newUser);
    this.clearState();
    if (errors) {
      this.setState(
        {
          errors,
          [id]: value,
        },
        () => {
          console.log(errors);
        }
      );
    } else {
      this.clearState();
    }
  };
  render() {
    const { errors } = this.state;
    const { classes } = this.props;
    return (
      <div className="container">
        <div className="row">
          <div
            className="col s8 offset-s2"
            style={{
              backgroundColor: "#3067e2",
              height: "15vh",
              padding: "1em",
            }}
          ></div>
          <div
            className="col s8 offset-s2"
            style={{ backgroundColor: "#fff", padding: "1em" }}
          >
            <Link to="/" className="btn-flat waves-effect">
              <i className="material-icons left">keyboard_backspace</i> Back to
              home
            </Link>
            <div className="col s12" style={{ paddingLeft: "11.250px" }}>
              <h4>
                <b>Request Access</b>
              </h4>
              <p className="grey-text text-darken-1">
                Already have an account? <Link to="/login">Log in</Link>
              </p>
            </div>
            <form noValidate onSubmit={this.onSubmit}>
              <div className="input-field col s12">
                <input
                  onChange={this.onChange}
                  value={this.state.firstName}
                  error={errors.firstName}
                  id="firstName"
                  type="text"
                  className={classnames("", {
                    invalid: errors.firstName,
                  })}
                />
                <label htmlFor="firstName">First Name</label>
                <span className="red-text">{errors.firstName}</span>
              </div>
              <div className="input-field col s12">
                <input
                  onChange={this.onChange}
                  value={this.state.lastName}
                  error={errors.lastName}
                  id="lastName"
                  type="text"
                  className={classnames("", {
                    invalid: errors.lastName,
                  })}
                />
                <label htmlFor="lastName">Last Name</label>
                <span className="red-text">{errors.lastName}</span>
              </div>

              <div className="input-field col s12">
                <input
                  onChange={this.onChange}
                  value={this.state.jobTitle}
                  error={errors.jobTitle}
                  id="jobTitle"
                  type="text"
                  className={classnames("", {
                    invalid: errors.jobTitle,
                  })}
                />
                <label htmlFor="jobTitle">Job Title</label>
                <span className="red-text">{errors.jobTitle}</span>
              </div>

              <div className="input-field col s12">
                <input
                  onChange={this.onChange}
                  value={this.state.organization}
                  error={errors.organization}
                  id="organization"
                  type="text"
                  className={classnames("", {
                    invalid: errors.organization,
                  })}
                />
                <label htmlFor="organization">Organization</label>
                <span className="red-text">{errors.organization}</span>
              </div>

              <div className="input-field col s12">
                <input
                  onChange={this.onChange}
                  value={this.state.email}
                  error={errors.email}
                  id="email"
                  type="email"
                  className={classnames("", {
                    invalid: errors.email,
                  })}
                />
                <label htmlFor="email">Email</label>
                <span className="red-text">{errors.email}</span>
              </div>

              <div className="input-field col s12">
                <input
                  onChange={this.onChange}
                  value={this.state.phoneNumber}
                  error={errors.phoneNumber}
                  id="phoneNumber"
                  type="tel"
                  className={classnames("", {
                    invalid: errors.phoneNumber,
                  })}
                />
                <label htmlFor="phoneNumber">Phone Number</label>
                <span className="red-text">{errors.phoneNumber}</span>
              </div>

              <div className="input-field col s12">
                <TextField
                  id="description"
                  label="Description"
                  multiline
                  fullWidth
                  rowsMax="5"
                  value={this.state.description}
                  onChange={this.onChange}
                  className={classes.textField}
                  margin="normal"
                  helperText="Briefly outline your interest in air quality data"
                  variant="outlined"
                  error={errors.description}
                />
                <label htmlFor="description">Description</label>
                <span className="red-text">{errors.description}</span>
              </div>
              <div className="input-field col s12">
                <TextField
                  id="country"
                  select
                  label="Country"
                  className={classes.textField}
                  error={errors.country}
                  value={this.state.country}
                  onChange={this.onChange}
                  SelectProps={{
                    native: true,
                    MenuProps: {
                      className: classes.menu,
                    },
                  }}
                  helperText="Please select your country"
                  margin="normal"
                  variant="outlined"
                >
                  {countries.array.map((option) => (
                    <option key={option.label} value={option.label}>
                      {option.label}
                    </option>
                  ))}
                </TextField>
                <label htmlFor="country">Country</label>
                <span className="red-text">{errors.country}</span>
              </div>
              <div>
                <FormControlLabel
                  control={
                    <Checkbox
                      id="isChecked"
                      value={this.state.isChecked}
                      onChange={this.onChange}
                      color="primary"
                    />
                  }
                  label="Agree to our terms and conditions?"
                />
              </div>
              <div className="col s12" style={{ paddingLeft: "11.250px" }}>
                {this.state.isChecked ? (
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
                    JOIN
                  </button>
                ) : null}
              </div>
              {this.props.auth.newUser && (
                <Alert severity="success">
                  <AlertTitle>Success</AlertTitle>
                  Successfully registered the user —{" "}
                  <strong>check it out!</strong>
                </Alert>
              )}
            </form>
          </div>
        </div>
      </div>
    );
  }
}

Register.propTypes = {
  registerCandidate: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  errors: state.errors,
});

// export default Register;
export default connect(mapStateToProps, { registerCandidate })(
  withRouter(withStyles(styles, { withTheme: true })(Register))
);
