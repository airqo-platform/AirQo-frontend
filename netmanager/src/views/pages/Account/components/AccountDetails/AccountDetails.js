import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
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
import { useOrgData } from "redux/Join/selectors";
import { updateAuthenticatedUserApi } from "views/apis/authService";
import Alert from "@material-ui/lab/Alert";
import { CircularLoader } from "views/components/Loader/CircularLoader";
import { updateAuthenticatedUserSuccess } from "redux/Join/actions";
import usersStateConnector from "views/stateConnectors/usersStateConnector";

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

  const dispatch = useDispatch();

  const initialState = { ...user };

  const alertInitialState = {
    show: false,
    message: "",
    type: "success",
  };

  const orgData = useOrgData();
  const [form, setState] = useState(initialState);
  const [alert, setAlert] = useState(alertInitialState);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    var anchorElem = document.createElement("link");
    anchorElem.setAttribute(
      "href",
      "https://cdnjs.cloudflare.com/ajax/libs/materialize/1.0.0/css/materialize.min.css"
    );
    anchorElem.setAttribute("rel", "stylesheet");
    anchorElem.setAttribute("id", "logincdn");
  });

  const closeAlert = () => {
    setAlert(alertInitialState);
  };

  const handleChange = (e) => {
    setState({
      ...form,
      [e.target.id]: e.target.value,
    });
  };

  const clearState = () => {
    setState({ ...initialState });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const userId = user._id;
    const tenant = orgData.name;
    setLoading(true);
    await updateAuthenticatedUserApi(userId, tenant, form)
      .then((data) => {
        if (data.success) {
          const newUser = { ...user, ...form };
          localStorage.setItem("currentUser", JSON.stringify(newUser));
          dispatch(updateAuthenticatedUserSuccess(newUser, data.message));
          setAlert({
            show: true,
            message: data.message,
            type: "success",
          });
          return;
        }
        setAlert({
          show: true,
          message: data.message,
          type: "error",
        });
      })
      .catch((err) => {
        setAlert({
          show: true,
          message: err.response.message,
          type: "error",
        });
        clearState();
      });
    setLoading(false);
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
        <CardContent style={alert.show ? {} : { display: "none" }}>
          <Alert severity={alert.type} onClose={closeAlert}>
            {alert.message}
          </Alert>
        </CardContent>
        <CardActions>
          <Button
            color="primary"
            variant="contained"
            onClick={onSubmit}
            disabled={isEqual(initialState, form)}
          >
            Save details{" "}
          </Button>{" "}
          <CircularLoader loading={loading} />
        </CardActions>{" "}
      </form>{" "}
    </Card>
  );
};

AccountDetails.propTypes = {
  className: PropTypes.string,
  mappedAuth: PropTypes.object.isRequired,
};

export default usersStateConnector(AccountDetails);
