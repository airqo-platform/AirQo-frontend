/* eslint-disable */
import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { registerCandidate } from "redux/Join/actions";
import classnames from "classnames";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import countries from "utils/countries";
import categories from "utils/categories";
import { Alert, AlertTitle } from "@material-ui/lab";
import { withStyles, InputLabel, Typography } from "@material-ui/core";
import { Input } from "@material-ui/core";
import { isEmpty, isEqual, omit } from "underscore";

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
  try {
    let valid = true;
    Object.values(errors).forEach(
        // if we have an error string set valid to false
        (val) => val && val.length > 0 && (valid = false)
    );
    return valid;
  } catch (e) {
    console.log("validate form error", e.message);
  }
};

const isFormFullyFilled = (state) => {
  let errors = {}
  let testState = omit(state, "errors", "isChecked");

  Object.keys(testState).forEach((key) => {
      if(testState[key] === "") {
        errors[key] = `${key} is required`;
      }
  })
  return errors
}

class Register extends Component {
  constructor() {
    super();
    this.state = {
      firstName: "",
      lastName: "",
      email: "",
      jobTitle: "",
      description: "",
      organization: "",
      category: "",
      website: "",
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
      case "category":
        errors.category = value.length === 0 ? "category is required" : "";
        break;
      case "website":
        errors.website = value.length === 0 ? "website is required" : "";
        break;
      case "description":
        errors.description =
          value.length === 0 ? "description is required" : "";
        break;
      default:
        break;
    }
    this.setState(
      {
        ...this.state,
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

  getInitialState = () => {
      return {
        firstName: "",
        lastName: "",
        email: "",
        jobTitle: "",
        description: "",
        category: "",
        organization: "",
        website: "",
        errors: {},
        isChecked: {},
      }
    };

  clearState = () => {

    this.setState(this.getInitialState());
  };

  onSubmit = (e) => {
    e.preventDefault();
    if (validateForm(this.state.errors)) {
      console.info("Valid Form");
    } else {
      console.error("Invalid Form");
    }

    const emptyFields = isFormFullyFilled(this.state)

    if (!isEmpty(emptyFields)) {
      console.log('blocked blocked')
      this.setState({
        ...this.state,
        errors: {
          ...this.state.errors,
          ...emptyFields
        }
      })
      return
    }

    const { id, value } = e.target;
    let errors = this.state.errors;
    // const { errors } = this.state;

    switch (id) {
      case "firstName":
        errors.firstName = mappedErrors.errors.firstName;
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
      case "description":
        errors.description = mappedErrors.errors.description;
        break;
      case "category":
        errors.category = mappedErrors.errors.category;
        break;
      case "website":
        errors.website = mappedErrors.errors.website;
        break;
      default:
        break;
    }

    this.props.registerCandidate(this.state);
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
        <div style={{marginTop: "4rem"}} className="row">
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
                  value={this.state.email}
                  error={errors.email}
                  id="email"
                  type="email"
                  className={classnames("", {
                    invalid: errors.email,
                  })}
                />
                <label htmlFor="email">Official Email</label>
                <span className="red-text">{errors.email}</span>
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

              {/* 
       website */}

              <div className="input-field col s12">
                <input
                  onChange={this.onChange}
                  value={this.state.website}
                  error={errors.website}
                  id="website"
                  type="text"
                  className={classnames("", {
                    invalid: errors.website,
                  })}
                />
                <label htmlFor="website">Website</label>
                <span className="red-text">{errors.website}</span>
              </div>

              {/* What best desribes you? */}
              <div>
                <TextField
                  id="category"
                  select
                  label="category"
                  value={this.state.category}
                  error={errors.category}
                  onChange={this.onChange}
                  fullWidth={true}
                  SelectProps={{
                    native: true,
                  }}
                  helperText="What best describes you?"
                  variant="outlined"
                >
                  {categories.array.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </TextField>
              </div>

              <div
                className={classnames("", {
                  invalid: errors.description,
                })}
              >
                <TextField
                  id="description"
                  label="Outline in detailed nature your interest in AirQuality"
                  multiline
                  fullWidth={true}
                  rowsMax="5"
                  value={this.state.description}
                  onChange={this.onChange}
                  className={classes.textField}
                  margin="normal"
                  helperText="Outline in detailed nature your interest in AirQuality"
                  variant="outlined"
                  error={errors.description}
                />
                <span className="red-text">{errors.description}</span>
              </div>

              {/*<div>*/}
              {/*  <Typography color="textSecondary" variant="body1">*/}
              {/*    <Link*/}
              {/*      color="primary"*/}
              {/*      component={Link}*/}
              {/*      to="#"*/}
              {/*      underline="always"*/}
              {/*      variant="h6"*/}
              {/*    >*/}
              {/*      Terms and Conditions*/}
              {/*    </Link>*/}
              {/*  </Typography>*/}
              {/*</div>*/}

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
                    disabled={
                      isEqual(this.getInitialState(), { ...this.state, errors: {}, isChecked: {} }) ||
                         !validateForm(this.state.errors)
                    }
                  >
                    REQUEST
                  </button>
                ) : null}
              </div>
              {this.props.auth.newUser && (
                <Alert severity="success">
                  <AlertTitle>Success</AlertTitle>
                  Your request has been successfully received! —{" "}
                  <strong>Thank you!</strong>
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
