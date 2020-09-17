import React, { useState, useEffect } from "react";
import { isEqual } from "underscore";
import clsx from "clsx";
import PropTypes from "prop-types";
import { makeStyles } from "@material-ui/styles";
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Divider,
  Grid,
  Button,
  TextField,
} from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  container: {
    display: "flex",
    flexWrap: "wrap",
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  },
  dense: {
    marginTop: 16,
  },
  menu: {
    width: 200,
  },
  root: {},
}));

const AccountDetails = (props) => {
  const { className, mappedAuth, ...rest } = props;

  const { user } = mappedAuth;

  const classes = useStyles();

  const initialState = {
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phoneNumber: "",
  };

  const [form, setState] = useState(initialState);

  useEffect(() => {
    var anchorElem = document.createElement("link");
    anchorElem.setAttribute(
      "href",
      "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css"
    );
    anchorElem.setAttribute("rel", "stylesheet");
    anchorElem.setAttribute("id", "logincdn");
  });

  const handleChange = (e) => {
    setState({
      ...form,
      [e.target.id]: e.target.value,
    });
  };

  const clearState = () => {
    setState({ ...initialState });
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const userData = {
      id: user._id,
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      phoneNumber: form.phoneNumber,
    };
    props.mappedUpdateAuthenticatedUser(userData);
    clearState();
  };

  return (
    <Card {...rest} className={clsx(classes.root, className)}>
      <form autoComplete="off" noValidate>
        <CardHeader subheader="The information can be edited" title="Profile" />
        <Divider />
        <CardContent>
          <Grid container spacing={3}>
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                helperText="Please specify the first name"
                label="First name"
                margin="dense"
                id="firstName"
                onChange={handleChange}
                required
                value={form.firstName}
                variant="outlined"
              />
            </Grid>{" "}
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="Last name"
                margin="dense"
                id="lastName"
                onChange={handleChange}
                required
                value={form.lastName}
                variant="outlined"
              />
            </Grid>{" "}
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                margin="dense"
                id="email"
                onChange={handleChange}
                required
                value={form.email}
                variant="outlined"
              />
            </Grid>{" "}
            <Grid item md={6} xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                margin="dense"
                id="phoneNumber"
                onChange={handleChange}
                value={form.phoneNumber}
                variant="outlined"
              />
            </Grid>{" "}
          </Grid>{" "}
        </CardContent>{" "}
        <Divider />
        <CardActions>
          <Button
            color="primary"
            variant="contained"
            onClick={onSubmit}
            disabled={isEqual(initialState, form)}
          >
            Save details{" "}
          </Button>{" "}
        </CardActions>{" "}
      </form>{" "}
    </Card>
  );
};

AccountDetails.propTypes = {
  className: PropTypes.string,
  mappedAuth: PropTypes.object.isRequired,
};

export default AccountDetails;
