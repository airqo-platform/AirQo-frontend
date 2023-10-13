import React, { useState, useEffect } from 'react';
import { Button, Grid, LinearProgress } from '@material-ui/core';
import { Link, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { clearErrors, registerCandidate } from 'redux/Join/actions';
import TextField from '@material-ui/core/TextField';
import categories from 'utils/categories';
import { Alert } from '@material-ui/lab';
import { withStyles } from '@material-ui/core';
import usersStateConnector from 'views/stateConnectors/usersStateConnector';
import AlertMinimal from '../../layouts/AlertsMininal';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import Select from 'react-select';
import { createAlertBarExtraContentFromObject } from 'utils/objectManipulators';
import { makeStyles } from '@material-ui/core/styles';
countries.registerLocale(enLocale);

const useStyles = makeStyles({
  root: {
    height: '5px',
    position: 'absolute',
    left: '0',
    bottom: '0',
    width: '100%'
  },
  barColorPrimary: {
    backgroundColor: '#FFCC00'
  }
});

const countryObj = countries.getNames('en', { select: 'official' });

const countryArr = Object.entries(countryObj).map(([key, value]) => ({
  label: value,
  value: key
}));

const countryOptions = countryArr.map(({ label, value }) => ({
  label: label,
  value: value
}));

const categoryOptions = categories.array.map(({ label }) => ({
  label,
  value: label
}));

const styles = (theme) => ({
  root: {
    width: '100%',
    '& > * + *': {
      marginTop: theme.spacing(2)
    }
  }
});

const validEmailRegex = RegExp(
  /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
);

const validWebsiteRegex = RegExp(/^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/);

const tenantMapper = {
  airqo: 'AirQo',
  kcca: 'KCCA'
};

const Register = ({ history, auth, errors, clearErrors, match, registerCandidate }) => {
  const classes = useStyles();
  const tenant = match.params.tenant || 'airqo';
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [state, setState] = useState({
    firstName: '',
    lastName: '',
    email: '',
    jobTitle: '',
    description: '',
    long_organization: '',
    category: '',
    website: '',
    errors: {},
    country: '',
    disabled: false
  });

  useEffect(() => {
    let start = null;
    let timer = null;

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;

      setProgress((oldProgress) => {
        if (!loading) {
          return 100;
        }
        const newProgress = Math.min(oldProgress + elapsed / 30, 100);
        return newProgress;
      });

      if (loading) {
        timer = requestAnimationFrame(animate);
      }
    };

    timer = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(timer);
    };
  }, [loading]);

  useEffect(() => {
    if (auth.isAuthenticated) {
      history.push('/dashboard');
    }
    if (auth.registered) {
      history.push('/login');
    }
    if (errors) {
      setState((prevState) => ({ ...prevState, errors }));
    }
  }, [auth.isAuthenticated, auth.registered, errors]);

  const onChangeDropdown = (selected, { name }) => {
    let updatedErrors = { ...state.errors };
    if (selected === null) {
      updatedErrors[name] = 'This field is required';
      setState((prevState) => ({
        ...prevState,
        errors: updatedErrors,
        [name]: ''
      }));
    } else {
      updatedErrors[name] = '';
      setState((prevState) => ({
        ...prevState,
        errors: updatedErrors,
        [name]: selected.label
      }));
    }
  };

  const requiredFields = {
    email: 'This is not a valid email',
    website: 'This is not a valid website',
    description: 'Description is required',
    long_organization: 'Organization name is required',
    jobTitle: 'Job title is required',
    firstName: 'First name is required',
    lastName: 'Last name is required',
    country: 'Country is required',
    category: 'Category is required'
  };

  const onChange = (e) => {
    const { id, value } = e.target;
    let updatedErrors = { ...state.errors };

    if (requiredFields[id]) {
      if (id === 'email') {
        updatedErrors[id] = validEmailRegex.test(value) ? '' : requiredFields[id];
      } else if (id === 'website') {
        updatedErrors[id] = validWebsiteRegex.test(value) ? '' : requiredFields[id];
      } else {
        updatedErrors[id] = value.length === 0 ? requiredFields[id] : '';
      }
    } else {
      updatedErrors[id] = '';
    }

    setState((prevState) => ({ ...prevState, errors: updatedErrors, [id]: value }));
  };

  const clearState = () => {
    setState((prevState) => ({
      ...prevState,
      firstName: '',
      lastName: '',
      email: '',
      jobTitle: '',
      description: '',
      long_organization: '',
      category: '',
      website: '',
      errors: {},
      country: '',
      disabled: false
    }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setProgress(0);
      const emptyFields = Object.keys(requiredFields).reduce((errors, field) => {
        if (!state[field]) {
          errors[field] = requiredFields[field];
        }
        return errors;
      }, {});

      if (Object.keys(emptyFields).length > 0) {
        setState((prevState) => ({
          ...prevState,
          errors: { ...prevState.errors, ...emptyFields }
        }));
        throw new Error('Please fill in all the required fields');
      }

      setLoading(true);
      setState((prevState) => ({ ...prevState, disabled: true }));

      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });

      let userData = {
        ...state,
        organization: state.long_organization
      };

      await registerCandidate(tenant, userData, clearState);
    } catch (error) {
      console.error(error.message);
    } finally {
      setLoading(false);
      setProgress(0);

      setState((prevState) => ({ ...prevState, disabled: false }));
    }
  };

  const tenantLabel = (tenant) => {
    return tenantMapper[tenant] || 'AirQo';
  };

  const { errors: formErrors } = state;

  const customStyles = {
    control: (base, state) => ({
      ...base,
      height: '55px',
      borderColor: state.isFocused
        ? '#3f51b5'
        : !!formErrors[state.selectProps.name]
        ? '#e53935'
        : '#9a9a9a',
      boxShadow: state.isFocused ? 0 : null,
      '&:hover': {
        borderColor: !!formErrors[state.selectProps.name] ? '#e53935' : 'black'
      }
    }),
    option: (provided, state) => ({
      ...provided,
      borderBottom: '1px dotted pink',
      color: state.isSelected ? 'white' : 'blue',
      textAlign: 'left'
    }),
    input: (provided, state) => ({
      ...provided,
      height: '40px',
      borderColor: state.isFocused ? '#3f51b5' : 'black'
    }),
    placeholder: (provided, state) => ({
      ...provided,
      color: !!formErrors[state.selectProps.name] ? '#e53935' : 'black'
    }),
    menu: (provided, state) => ({
      ...provided,
      zIndex: 9999
    })
  };

  return (
    <AlertMinimal>
      <div
        className="container"
        style={{
          maxWidth: '600px',
          marginTop: '4rem',
          backgroundColor: '#fff'
        }}>
        <div className="row">
          <div
            className=" offset-s2"
            style={{
              backgroundColor: '#3067e2',
              height: '15vh',
              padding: '1em',
              position: 'relative'
            }}>
            {loading && (
              <LinearProgress
                classes={{ barColorPrimary: classes.barColorPrimary, root: classes.root }}
                variant="determinate"
                value={progress}
              />
            )}
          </div>
          <div className="offset-s2" style={{ backgroundColor: '#fff', padding: '1em' }}>
            <div className="col s12" style={{ paddingLeft: '11.250px' }}>
              <h4>
                <b>{tenantLabel(tenant)} Access Request</b>
              </h4>
              <p className="grey-text text-darken-1">
                Already have an account? <Link to="/login">Log in</Link>
              </p>
            </div>
            <form noValidate>
              {errors && errors.data && (
                <Alert severity="error" onClose={clearErrors}>
                  {errors.data.errors
                    ? Object.entries(errors.data.errors).map(([key, value], index) => (
                        <div key={index}>{`${key} - ${value}`}</div>
                      ))
                    : createAlertBarExtraContentFromObject(errors.data.errors)}
                </Alert>
              )}

              <div className="col s12">
                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      onChange={onChange}
                      value={state.firstName}
                      error={!!formErrors.firstName}
                      id="firstName"
                      label="First Name"
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      helperText={formErrors.firstName}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      onChange={onChange}
                      value={state.lastName}
                      error={!!formErrors.lastName}
                      id="lastName"
                      label="Last Name"
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      helperText={formErrors.lastName}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      onChange={onChange}
                      value={state.long_organization}
                      error={!!formErrors.long_organization}
                      id="long_organization"
                      label="Organization"
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      helperText={formErrors.long_organization}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      onChange={onChange}
                      value={state.jobTitle}
                      error={!!formErrors.jobTitle}
                      id="jobTitle"
                      label="Job Title"
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      helperText={formErrors.jobTitle}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      onChange={onChange}
                      value={state.email}
                      error={!!formErrors.email}
                      id="email"
                      label="Official Email"
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      helperText={formErrors.email}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      onChange={onChange}
                      value={state.website}
                      error={!!formErrors.website}
                      id="website"
                      label="Website"
                      fullWidth
                      margin="normal"
                      variant="outlined"
                      helperText={formErrors.website}
                    />
                  </Grid>

                  <Grid item xs={12} sm={12}>
                    <div style={{ marginBottom: '10px' }}>
                      <Select
                        value={countryOptions.find((option) => option.value === state.country)}
                        onChange={onChangeDropdown}
                        isClearable={true}
                        options={countryOptions}
                        isSearchable
                        placeholder="Choose your country"
                        name="country"
                        styles={customStyles}
                      />
                      {formErrors.country && (
                        <div
                          style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            color: 'red',
                            fontSize: '0.8rem',
                            marginTop: '0.25rem',
                            marginLeft: '1rem'
                          }}
                          className="invalid-feedback">
                          {formErrors.country}
                        </div>
                      )}
                    </div>
                  </Grid>

                  <Grid item xs={12} sm={12}>
                    <div>
                      <Select
                        value={categories.array.find((option) => option.value === state.category)}
                        onChange={onChangeDropdown}
                        isClearable={true}
                        options={categoryOptions}
                        isSearchable={false}
                        placeholder="What best describes you?"
                        name="category"
                        styles={customStyles}
                      />
                      {formErrors.category && (
                        <div
                          style={{
                            width: '100%',
                            display: 'flex',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            color: 'red',
                            fontSize: '0.8rem',
                            marginTop: '0.25rem',
                            marginLeft: '1rem'
                          }}
                          className="invalid-feedback">
                          {formErrors.category}
                        </div>
                      )}
                    </div>
                  </Grid>

                  <Grid item xs={12} sm={12}>
                    <TextField
                      id="description"
                      label="Outline in detailed nature your interest in AirQuality"
                      fullWidth
                      multiline
                      rows="5"
                      rowsMax="10"
                      value={state.description}
                      onChange={onChange}
                      margin="normal"
                      variant="outlined"
                      error={!!formErrors.description}
                      helperText={formErrors.description}
                      InputLabelProps={{ style: { fontSize: '0.8rem' } }}
                    />
                  </Grid>
                </Grid>
              </div>

              <div
                className="col s12"
                style={{ paddingLeft: '11.250px', paddingBottom: '20px', paddingTop: '10px' }}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={onSubmit}
                  disabled={state.disabled}
                  className={`${state.disabled ? 'disabled' : ''}`}
                  style={{
                    backgroundColor: state.disabled ? undefined : 'rgb(48, 103, 226)',
                    padding: '10px 30px' // Increase padding as needed
                  }}>
                  REQUEST ACCESS
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AlertMinimal>
  );
};

Register.propTypes = {
  registerCandidate: PropTypes.func.isRequired,
  clearErrors: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  classes: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
  auth: state.auth,
  errors: state.errors
});

export default usersStateConnector(
  connect(mapStateToProps, { registerCandidate, clearErrors })(
    withRouter(withStyles(styles, { withTheme: true })(Register))
  )
);
