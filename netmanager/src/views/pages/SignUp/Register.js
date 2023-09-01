import React, { useState, useEffect, useRef } from 'react';
import { Link, withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { clearErrors, registerCandidate } from 'redux/Join/actions';
import TextField from '@material-ui/core/TextField';
import categories from 'utils/categories';
import { Alert, AlertTitle } from '@material-ui/lab';
import { withStyles } from '@material-ui/core';
import { isEmpty, isEqual } from 'underscore';
import { isFormFullyFilled, containsEmptyValues } from './utils';
import usersStateConnector from 'views/stateConnectors/usersStateConnector';
import AlertMinimal from '../../layouts/AlertsMininal';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';
import Select from 'react-select';
import { getNetworkListSummaryApi } from '../../apis/accessControl';

countries.registerLocale(enLocale);

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

const createNetworkOptions = (networksList) => {
  const sortedNetworks = networksList.sort((a, b) => {
    if (a.net_name === 'airqo') return -1; // "airqo" comes first
    if (b.net_name === 'airqo') return 1; // "airqo" comes second
    return a.net_name.localeCompare(b.net_name); // Sort alphabetically
  });

  const options = sortedNetworks.map((network) => ({
    value: network._id,
    label: network.net_name
  }));

  return options;
};

const customStyles = {
  control: (base, state) => ({
    ...base,
    height: '50px',
    borderColor: state.isFocused ? '#3f51b5' : '#9a9a9a',
    '&:hover': {
      borderColor: state.isFocused ? 'black' : 'black'
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
    color: '#000'
  }),
  menu: (provided, state) => ({
    ...provided,
    zIndex: 9999
  })
};

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

const tenantMapper = {
  airqo: 'AirQo',
  kcca: 'KCCA'
};

const Register = ({
  classes,
  history,
  auth,
  errors,
  registerCandidate,
  clearErrors,
  match,
  location
}) => {
  const query = new URLSearchParams(location.search);
  const tenant = match.params.tenant || 'airqo';
  const selectRef = useRef(null);

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
    isChecked: {},
    country: '',
    network_id: ''
  });
  const [networkList, setNetworkList] = useState([]);
  const [defaultNetwork, setDefaultNetwork] = useState({});
  const [showAllNetworks, setShowAllNetworks] = useState(false);

  const fetchNetworks = () => {
    getNetworkListSummaryApi()
      .then((res) => {
        const { networks } = res;
        setNetworkList(createNetworkOptions(networks));
        setState((prevState) => ({
          ...prevState,
          network_id: networks.find((network) => network.net_name === 'airqo')._id,
          errors: {
            ...prevState.errors,
            network: ''
          }
        }));
        setDefaultNetwork({
          value: networks.find((network) => network.net_name === 'airqo')._id,
          label: 'airqo'
        });
      })
      .catch((error) => {
        console.log('error', error);
      });
  };

  useEffect(() => {
    const anchorElem = document.createElement('link');
    anchorElem.setAttribute(
      'href',
      'https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css'
    );
    anchorElem.setAttribute('rel', 'stylesheet');
    anchorElem.setAttribute('id', 'logincdn');
    document.getElementsByTagName('head')[0].appendChild(anchorElem);

    if (auth.isAuthenticated) {
      history.push('/dashboard');
    }
  }, [auth.isAuthenticated, history]);

  useEffect(() => {
    if (auth.registered) {
      history.push('/login');
    }
    if (errors) {
      setState((prevState) => ({
        ...prevState,
        errors: errors
      }));
    }
  }, [auth.registered, errors, history]);

  useEffect(() => {
    fetchNetworks();
  }, []);

  const onChange = (e) => {
    e.preventDefault();
    const { id, value } = e.target;
    let updatedErrors = { ...state.errors };
    if (id === 'email') {
      if (value.length === 0) updatedErrors[id] = 'This field is required';
      else updatedErrors[id] = validEmailRegex.test(value) ? '' : 'This is not a valid email';
    } else {
      updatedErrors[id] = value.length === 0 ? 'This field is required' : '';
    }
    setState((prevState) => ({
      ...prevState,
      errors: updatedErrors,
      [id]: value
    }));
  };

  const onChangeDropdown = (selected, { name }) => {
    if (name === 'network_id') {
      let updatedErrors = { ...state.errors };
      updatedErrors[name] = selected.value.length === 0 ? 'This field is required' : '';
      setState((prevState) => ({
        ...prevState,
        errors: updatedErrors,
        [name]: selected.value
      }));
    } else {
      const { label } = selected;
      let updatedErrors = { ...state.errors };
      updatedErrors[name] = label.length === 0 ? 'This field is required' : '';
      setState((prevState) => ({
        ...prevState,
        errors: updatedErrors,
        [name]: label
      }));
    }
  };

  const handleCheck = (event) => {
    setState((prevState) => ({
      ...prevState,
      isChecked: event.target.checked
    }));
  };

  const getInitialState = () => ({
    firstName: '',
    lastName: '',
    email: '',
    jobTitle: '',
    description: '',
    category: '',
    long_organization: '',
    website: '',
    errors: {},
    isChecked: {},
    country: '',
    network_id: ''
  });

  const clearState = () => {
    setState(getInitialState());
  };

  const validateForm = (errors) => {
    try {
      let valid = true;
      Object.values(errors).forEach(
        // if we have an error string set valid to false
        (val) => val && val.length > 0 && (valid = false)
      );
      return valid;
    } catch (e) {
      console.log('validate form error', e.message);
      return false;
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();

    if (validateForm(state.errors)) {
      console.info('Valid Form');
    } else {
      console.error('Invalid Form');
    }

    const emptyFields = isFormFullyFilled(state, 'This field is required');

    if (!isEmpty(emptyFields)) {
      setState((prevState) => ({
        ...prevState,
        errors: {
          ...prevState.errors,
          ...emptyFields
        }
      }));
      return;
    }

    const updatedErrors = { ...state.errors };

    if (!containsEmptyValues(updatedErrors)) {
      setState((prevState) => ({
        ...prevState,
        errors: updatedErrors
      }));
    } else {
      registerCandidate(tenant, state, clearState);
    }
  };

  const tenantLabel = (tenant) => tenantMapper[tenant.toLowerCase()];

  const { errors: formErrors } = state;

  return (
    <AlertMinimal>
      <div
        className="container"
        style={{
          maxWidth: '600px',
          marginTop: '4rem',
          backgroundColor: '#fff'
        }}
      >
        <div className="row">
          <div
            className=" offset-s2"
            style={{
              backgroundColor: '#3067e2',
              height: '15vh',
              padding: '1em'
            }}
          />
          <div className="offset-s2" style={{ backgroundColor: '#fff', padding: '1em' }}>
            <div className="col s12" style={{ paddingLeft: '11.250px' }}>
              <h4>
                <b>{tenantLabel(tenant)} Access Request</b>
              </h4>
              <p className="grey-text text-darken-1">
                Already have an account? <Link to="/login">Log in</Link>
              </p>
            </div>
            <form noValidate onSubmit={onSubmit}>
              <div style={isEmpty((errors && errors.data) || {}) ? { display: 'none' } : {}}>
                <Alert
                  severity="error"
                  onClose={() => {
                    clearErrors();
                  }}
                >
                  {errors && errors.data && errors.data.message}
                </Alert>
              </div>

              <div className="col s12">
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

                <Select
                  value={countryOptions.find((option) => option.value === state.country)}
                  onChange={onChangeDropdown}
                  options={countryOptions}
                  isSearchable
                  placeholder="Choose your country"
                  name="country"
                  error={!!formErrors.country}
                  styles={customStyles}
                />

                <TextField
                  onChange={onChange}
                  value={state.long_organization}
                  error={!!errors.long_organization}
                  id="long_organization"
                  label="Organization"
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  helperText={errors.long_organization}
                />
                <TextField
                  onChange={onChange}
                  value={state.jobTitle}
                  error={!!errors.jobTitle}
                  id="jobTitle"
                  label="Job Title"
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  helperText={errors.jobTitle}
                />
                <TextField
                  onChange={onChange}
                  value={state.website}
                  error={!!errors.website}
                  id="website"
                  label="Website"
                  fullWidth
                  margin="normal"
                  variant="outlined"
                  helperText={errors.website}
                />

                <Select
                  value={categories.array.find((option) => option.value === state.category)}
                  isSearchable={false}
                  onChange={onChangeDropdown}
                  options={categoryOptions}
                  placeholder="What best describes you?"
                  name="category"
                  error={!!errors.category}
                  styles={{
                    ...customStyles,
                    control: (base, state) => ({
                      ...base,
                      height: '55px',
                      borderColor: state.isFocused ? '#3f51b5' : '#9a9a9a',
                      '&:hover': {
                        borderColor: state.isFocused ? 'black' : 'black'
                      }
                    })
                  }}
                />

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
                  error={!!errors.description}
                  helperText={errors.description}
                  InputLabelProps={{ style: { fontSize: '0.8rem' } }}
                />

                <div style={{ marginTop: '8px', marginBottom: '15px' }}>
                  <label style={{ textAlign: 'left', color: '#000' }}>
                    Choose the organisation you want to request access to
                  </label>
                  <Select
                    ref={selectRef}
                    value={
                      showAllNetworks
                        ? networkList.find((option) => option.value === state.network_id)
                        : defaultNetwork
                    }
                    onChange={onChangeDropdown}
                    options={showAllNetworks ? networkList : [defaultNetwork]}
                    isSearchable
                    name="network_id"
                    placeholder="Network"
                    error={!!formErrors.network_id}
                    styles={customStyles}
                  />
                  <small>
                    <a
                      onClick={() => {
                        setShowAllNetworks(true);
                        selectRef.current.focus();
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      Looking for other organizations? Click to view more in the list
                    </a>
                  </small>
                </div>
              </div>

              <div className="col s12" style={{ paddingLeft: '11.250px' }}>
                {state.isChecked ? (
                  <button
                    style={{
                      width: '150px',
                      borderRadius: '3px',
                      letterSpacing: '1.5px',
                      margin: '1rem'
                    }}
                    type="submit"
                    className="btn btn-large waves-effect waves-light hoverable blue accent-3"
                    disabled={
                      isEqual(getInitialState(), {
                        ...state,
                        errors: {},
                        isChecked: {}
                      }) || !validateForm(formErrors)
                    }
                  >
                    REQUEST
                  </button>
                ) : null}
              </div>
              {auth.newUser && (
                <Alert severity="success">
                  <AlertTitle>Success</AlertTitle>
                  Your request has been successfully received! — <strong>Thank you!</strong>
                </Alert>
              )}
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
