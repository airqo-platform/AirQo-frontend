import React, { useState, Component, useEffect } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/styles';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Divider,
  Button,
  TextField
} from '@material-ui/core';

import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { loginUser } from "../../../redux/Join/actions";
import classnames from "classnames";

const useStyles = makeStyles(() => ({
  root: {}
}));


const Login = props => {
  const { className,staticContext, ...rest } = props;
  const classes = useStyles();

  const [errors, setErrors] = useState({});

  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // If logged in and user navigates to Login page, should redirect them to dashboard
    if (props.auth.isAuthenticated) {
      props.history.push("/dashboard");
    }
  },[])
/*
  componentWillReceiveProps(nextProps) {
    if (nextProps.auth.isAuthenticated) {
      this.props.history.push("/dashboard"); // push user to dashboard when they login
    }
    if (nextProps.errors) {
      this.setState({
        errors: nextProps.errors,
      });
    }
  }*/

  const onChange = (e) => {
    //setState({ [e.target.id]: e.target.value });
  };
  const onSubmit = (e) => {
    e.preventDefault();
    const userData = {
      userName: userName,
      password: password,
    };
    console.log(userData);
    this.props.loginUser(userData);
    // since we handle the redirect within our component, we don't need to pass in this.props.history as a parameter
  };

    return (
        <Card
      {...rest}
      className={clsx(classes.root, className)}
    >
      <form noValidate onSubmit={onSubmit}>
        <CardHeader
          subheader="Login"
          title="Login"
        />
        <Divider />
        <CardContent>
        
        <TextField
            fullWidth
            label="Username"
            name="Username"
            onChange={event => setUserName(event.target.value)}
            id="userName"
            type="text"
            value={userName}
            error={errors.userName}
            variant="outlined"
            helperText={errors.userName + ""+ errors.credentialsnotfound}
            className={classnames("", {
                invalid: errors.userName || errors.credentialsnotfound,
              })}
        
          />
          <TextField
            fullWidth
            label="Password"
            name="password"            
            style={{ marginTop: '1rem' }}                       
            variant="outlined"
            onChange={event => setPassword(event.target.value)}
            value={password}
            error={errors.password}
            id="password"
            type="password"
            className={classnames("", {
                    invalid: errors.password || errors.passwordincorrect,
                  })}
            helperText= {errors.password + " "+ errors.passwordincorrect}
          />

        </CardContent>

        <Divider />
        <CardActions>
          <Button
            color="primary"
            variant="outlined"
          >
            Login
          </Button>

          <Link to="/forgot"> Forgotten Password?</Link>
        </CardActions>
      </form>
    </Card>
      
      
    );
  
}
Login.propTypes = {
  loginUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  errors: PropTypes.object.isRequired,
};
const mapStateToProps = (state) => ({
  auth: state.auth,
  errors: state.errors,
});
export default connect(mapStateToProps, { loginUser })(Login);
