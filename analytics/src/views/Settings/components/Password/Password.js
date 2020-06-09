/* eslint-disable */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import { updatePassword } from '../../../../redux/Join/actions';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Divider,
  Button,
  TextField
} from '@material-ui/core';

const useStyles = makeStyles(() => ({
  root: {}
}));

const Password = props => {
  const { className, mappedAuth, mappeduserState, ...rest } = props;
  const { user } = mappedAuth;
  const userState = mappeduserState;

  const classes = useStyles();

  const initialState = {
    password: '',
    password2: ''
  };

  const [values, setValues] = useState(initialState);

  const clearState = () => {
    setValues({ ...initialState });
  };

  const handleChange = event => {
    setValues({
      ...values,
      [event.target.id]: event.target.value
    });
  };

  const onSubmit = e => {
    e.preventDefault();
    const userData = {
      id: user._id,
      password: values.password,
      password2: values.password2
    };
    console.log("sending them through...");
    console.log(userData);
    props.mappedUpdatePassword(userData);
    clearState();
  };

  return (
    <Card {...rest} className={clsx(classes.root, className)}>
      <CardHeader subheader="Update password" title="Password" />
      <Divider />
      <CardContent>
        <TextField
          fullWidth
          label="Password"
          id="password"
          onChange={handleChange}
          type="password"
          value={values.password}
          InputProps={{ disableUnderline: true }}
        />
        <TextField
          fullWidth
          label="Confirm password"
          id="password2"
          onChange={handleChange}
          style={{ marginTop: '1rem' }}
          type="password"
          value={values.password2}
          InputProps={{ disableUnderline: true }}
        />
      </CardContent>
      <Divider />
      <CardActions>
        <Button color="primary" variant="outlined" onClick={onSubmit} disabled>
          Update
        </Button>
      </CardActions>
    </Card>
  );
};

Password.propTypes = {
  className: PropTypes.string,
  mappedAuth: PropTypes.object.isRequired,
  mappeduserState: PropTypes.object.isRequired,
  updatePassword: PropTypes.func.isRequired
};

export default Password;
