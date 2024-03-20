/* eslint-disable */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { connect, useDispatch, useSelector } from 'react-redux';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import {
  Button,
  TextField,
  DialogTitle,
  DialogContent,
  Dialog,
  DialogActions
} from '@material-ui/core';
import { useOrgData } from 'redux/Join/selectors';
import usersStateConnector from 'views/stateConnectors/usersStateConnector';
import { addUserApi } from 'views/apis/authService';
import { updateMainAlert } from 'redux/MainAlert/operations';
import { createAlertBarExtraContentFromObject } from 'utils/objectManipulators';
import { isEmpty } from 'underscore';
import { assignUserNetworkApi, assignUserToRoleApi } from '../../../../apis/accessControl';
import { fetchNetworkUsers } from 'redux/AccessControl/operations';
import countries from 'i18n-iso-countries';
import enLocale from 'i18n-iso-countries/langs/en.json';

import { setLoading as loadStatus } from 'redux/HorizontalLoader/index';

countries.registerLocale(enLocale);

const countryObj = countries.getNames('en', { select: 'official' });

const countryArr = Object.entries(countryObj).map(([key, value]) => {
  return {
    label: value,
    value: key
  };
});

// countries
const countryOptions = countryArr.map(({ label, value }) => ({
  label: label,
  value: value
}));

// dropdown component
import Select from 'react-select';

// dropdown component styles
const customStyles = {
  control: (base, state) => ({
    ...base,
    height: '45px',
    marginTop: '8px',
    marginBottom: '8px',
    borderColor: state.isFocused ? '#3f51b5' : '#9a9a9a',
    '&:hover': {
      borderColor: state.isFocused ? 'black' : 'black'
    },
    boxShadow: state.isFocused ? '0 0 1px 1px #3f51b5' : null
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

const useStyles = makeStyles((theme) => ({
  root: {
    '&$error': {
      color: 'red'
    }
  },
  error: {},
  row: {
    height: '42px',
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(1)
  },
  spacer: {
    flexGrow: 1
  },
  importButton: {
    marginRight: theme.spacing(1)
  },
  exportButton: {
    marginRight: theme.spacing(1)
  },
  searchInput: {
    marginRight: theme.spacing(1)
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap'
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit
  },
  dense: {
    marginTop: 16
  },
  menu: {
    width: 200
  }
}));

const validEmailRegex = RegExp(
  /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i
);
const validWebsiteRegex = RegExp(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/i);

function capitalize(str) {
  return str.toLowerCase().charAt(0).toUpperCase() + str.slice(1);
}

/***func starts here....... */
const UsersToolbar = (props) => {
  const { className, mappeduserState, mappedErrors, roles, ...rest } = props;
  const { mappedAuth } = props;
  let { user } = mappedAuth;

  const [open, setOpen] = useState(false);
  const orgData = useOrgData();
  const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork') || {});

  const initialState = {
    firstName: '',
    lastName: '',
    email: '',
    role: {},
    errors: {},
    privilege: 'user',
    country: '',
    jobTitle: '',
    website: '',
    long_organization: activeNetwork.net_name,
    organization: activeNetwork.net_name
  };
  const initialStateErrors = {
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    errors: '',
    country: '',
    jobTitle: '',
    website: '',
    long_organization: ''
  };

  const dispatch = useDispatch();
  const [form, setState] = useState(initialState);
  const [errors, setErrors] = useState(initialStateErrors);
  const [loading, setLoading] = useState(false);

  const clearState = () => {
    setState({ ...initialState });
  };

  const classes = useStyles();

  const handleClickOpen = () => {
    setOpen(true);
  };
  //
  const handleClose = () => {
    setOpen(false);
    setErrors(initialStateErrors);
    setState(initialState);
  };

  const onChange = (e) => {
    e.preventDefault();
    const { id, value } = e.target;
    let errors = form.errors;

    switch (id) {
      case 'firstName':
        errors.firstName = value.length === 0 ? 'first name is required' : '';
        break;
      case 'lastName':
        errors.lastName = value.length === 0 ? 'last name is required' : '';
        break;
      case 'email':
        errors.email = validEmailRegex.test(value) ? '' : 'Email is not valid!';
        break;
      case 'userName':
        errors.userName = value.length === 0 ? 'userName is required' : '';
        break;
      case 'jobTitle':
        errors.jobTitle = value.length === 0 ? 'jobTitle is required' : '';
        break;
      case 'website':
        errors.website = validWebsiteRegex.test(value) ? '' : 'website is not valid!';
        break;
      case 'long_organization':
        errors.long_organization = value.length === 0 ? 'long_organization is required' : '';
        break;
      default:
        break;
    }

    setState(
      {
        ...form,
        [id]: value
      },
      () => {
        console.log(errors);
      }
    );
  };

  const onSubmit = (e) => {
    setLoading(true);
    dispatch(loadStatus(true));
    e.preventDefault();
    setOpen(false);
    // register user
    addUserApi(form)
      .then((resData) => {
        const userID = resData.user._id;
        // assign user to network
        if (!isEmpty(activeNetwork)) {
          assignUserNetworkApi(activeNetwork._id, userID).then((response) => {
            assignUserToRoleApi(form.role.id, { user: userID })
              .then((resData) => {
                dispatch(fetchNetworkUsers(activeNetwork._id));
                setErrors(initialStateErrors);
                setState(initialState);
                dispatch(
                  updateMainAlert({
                    message: 'User successfully added to the organisation',
                    show: true,
                    severity: 'success'
                  })
                );
                setLoading(false);
                dispatch(loadStatus(false));
              })
              .catch((error) => {
                const errors = error.response && error.response.data && error.response.data.errors;
                setErrors(errors || initialStateErrors);
                dispatch(
                  updateMainAlert({
                    message: error.response && error.response.data && error.response.data.message,
                    show: true,
                    severity: 'error',
                    extra: createAlertBarExtraContentFromObject(errors || {})
                  })
                );
                setLoading(false);
                dispatch(loadStatus(false));
              });
          });
        }
      })
      .catch((error) => {
        const errors = error.response && error.response.data && error.response.data.errors;
        setErrors(errors || initialStateErrors);
        setLoading(false);
        dispatch(loadStatus(false));
        dispatch(
          updateMainAlert({
            message: error.response && error.response.data && error.response.data.message,
            show: true,
            severity: 'error',
            extra: createAlertBarExtraContentFromObject(errors || {})
          })
        );
      });
  };

  useEffect(() => {
    clearState();
  }, []);

  // role options
  const options =
    (roles && roles.map((role) => ({ value: role._id, label: role.role_name }))) || [];

  // handles role select
  const handleDropdownChange = (selectedOption, { name }) => {
    setState({
      ...form,
      [name]:
        name === 'role'
          ? { id: selectedOption.value, role_name: selectedOption.label }
          : selectedOption.label
    });
  };

  return (
    <div className={clsx(classes.root, className)}>
      \
      <div className={classes.row}>
        <span className={classes.spacer} />
        <div>
          <Button variant="contained" color="primary" onClick={handleClickOpen} disabled={loading}>
            Add new user
          </Button>
          <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
            <DialogTitle id="form-dialog-title">Add User</DialogTitle>
            <DialogContent>
              <div>
                <TextField
                  autoFocus
                  margin="dense"
                  id="email"
                  name="Email Address"
                  type="text"
                  label="email"
                  helperText={errors.email}
                  error={!!errors.email}
                  onChange={onChange}
                  variant="outlined"
                  value={form.email}
                  fullWidth
                />

                <TextField
                  margin="dense"
                  id="firstName"
                  name="firstName"
                  label="first name"
                  type="text"
                  helperText={errors.firstName}
                  error={!!errors.firstName}
                  onChange={onChange}
                  value={form.firstName}
                  variant="outlined"
                  fullWidth
                />
                <TextField
                  margin="dense"
                  id="lastName"
                  label="last name"
                  name="lastName"
                  type="text"
                  helperText={errors.lastName}
                  error={!!errors.lastName}
                  onChange={onChange}
                  value={form.lastName}
                  variant="outlined"
                  fullWidth
                />

                <Select
                  value={countryOptions.find((option) => option.value === form.country)}
                  onChange={handleDropdownChange}
                  options={countryOptions}
                  isSearchable
                  placeholder="Select country"
                  name="country"
                  error={!!errors.country}
                  styles={customStyles}
                  isRequired
                />

                <TextField
                  margin="dense"
                  id="long_organization"
                  label="organization"
                  name="long_organization"
                  type="text"
                  helperText={errors.long_organization}
                  error={!!errors.long_organization}
                  onChange={onChange}
                  value={form.long_organization}
                  variant="outlined"
                  fullWidth
                  disabled
                />

                <TextField
                  margin="dense"
                  id="jobTitle"
                  label="job title"
                  name="jobTitle"
                  type="text"
                  helperText={errors.jobTitle}
                  error={!!errors.jobTitle}
                  onChange={onChange}
                  value={form.jobTitle}
                  variant="outlined"
                  fullWidth
                />

                <TextField
                  margin="dense"
                  id="website"
                  label="website"
                  name="website"
                  type="text"
                  helperText={errors.website}
                  error={!!errors.website}
                  onChange={onChange}
                  value={form.website}
                  fullWidth
                />

                {/* dropdown */}
                <Select
                  name="role"
                  label="role"
                  style={{ marginTop: '15px' }}
                  onChange={handleDropdownChange}
                  value={options.find((option) => option.value === form.value)}
                  options={options}
                  isRequired
                  styles={{
                    ...customStyles,
                    menu: (provided) => ({ ...provided, position: 'relative' })
                  }}
                  isMulti={false}
                  fullWidth
                  placeholder="Select role"
                />
              </div>
            </DialogContent>

            <DialogActions>
              <div>
                <Button onClick={handleClose} color="primary" variant="outlined">
                  Cancel
                </Button>
                <Button
                  style={{ margin: '0 15px' }}
                  onClick={onSubmit}
                  color="primary"
                  variant="contained">
                  Submit
                </Button>
              </div>
            </DialogActions>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

UsersToolbar.propTypes = {
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
  className: PropTypes.string
};
const mapStateToProps = (state) => ({
  auth: state.auth,
  errors: state.errors
});
export default usersStateConnector(connect(mapStateToProps)(UsersToolbar));
