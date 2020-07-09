/* eslint-disable */
import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import {registerUser } from "../../../redux/Join/actions";
import classnames from "classnames";
import CustomInput from "../CustomInput/CustomInput";
import Autocomplete from "@material-ui/lab/Autocomplete";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import countries from "../../../utils/countries";
import { Alert, AlertTitle } from '@material-ui/lab';
import {withStyles, InputLabel } from '@material-ui/core'

const defaultProps = {
  options: countries.array,
  getOptionLabel: (option) => option.label,
};

const styles = (theme) => ({
  root: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
});

class Register extends Component {
  constructor() {
    super();
    this.state = {
      firstName: "",
      lastName: "",
      email: "",
      userName: "",
      country: "",
      phoneNumber: "",
      jobTitle: "",
      desc: "",
      errors: {},
    };
  }

  componentDidMount() {
    // If logged in and user navigates to Register page, should redirect them to dashboard
    if (this.props.auth.isAuthenticated) {
      this.props.history.push("/dashboard");
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.errors) {
      this.setState({
        errors: nextProps.errors,
      });
    }
  }

  onChange = (e) => {
    this.setState({ [e.target.id]: e.target.value });
  };
  onSubmit = (e) => {
    e.preventDefault();
    const newUser = {
      firstName: this.state.firstName,
      lastName: this.state.lastName,
      email: this.state.email,
      company: this.state.company,
      jobTitle: this.state.jobTitle,
      phoneNumber: this.state.phoneNumber,
      country: this.state.country,
      desc: this.state.desc,
      errors: {},
    };
    console.log(newUser);
    this.props.registerUser(newUser, this.props.history);
  };
  render() {
    const { errors } = this.state;
    const {classes} = this.props;

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
                <b>Join Analytics</b>
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
                  value={this.state.company}
                  error={errors.company}
                  id="company"
                  type="text"
                  className={classnames("", {
                    invalid: errors.company,
                  })}
                />
                <label htmlFor="jobTitle">company</label>
                <span className="red-text">{errors.company}</span>
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
                <label htmlFor="email">Phone Number</label>
                <span className="red-text">{errors.phoneNumber}</span>
              </div>

              <div className="input-field col s12">
                <InputLabel
                  style={{ color: "#AAAAAA" }}
                >
                  Brief Description
                </InputLabel>
                <CustomInput
                  labelText="Briefly outline your interest in air quality data"
                  formControlProps={{
                    fullWidth: true,
                  }}
                  inputProps={{
                    multiline: true,
                    rows: 5,
                  }}
                  id="desc"
                  onChange={this.onChange}
                  value={this.state.desc}
                  error={errors.desc}
                />
              </div>
              <div className="input-field col s12">
                <Autocomplete
                  {...defaultProps}
                  clearOnEscape
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      id="country"
                      label="Country"
                      margin="normal"
                      onChange={this.onChange}
                      value={this.state.country}
                      error={errors.country}
                    />
                  )}
                />
              </div>
              <div>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={this.state.checkedB}
                      onChange={this.onChange}
                      name="checkedB"
                      color="primary"
                    />
                  }
                  label="Agree to our terms and conditions?"
                />
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
                  JOIN
                </button>
              </div>
          { this.props.auth.newUser && 
          <Alert severity="success">
              <AlertTitle>Success</AlertTitle>
               This is a success alert — <strong>check it out!</strong>
         </Alert>
         }
            </form>
          </div>
        </div>
      </div>
    );
  }
}

Register.propTypes = {
  registerUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
};

//get our state from Redux and map it to Props to use inside components.
const mapStateToProps = (state) => ({
  auth: state.auth,
  errors: state.errors,
});

export default connect(mapStateToProps, { registerUser })(
  withRouter(withStyles(styles, {withTheme:true})(Register))
);
