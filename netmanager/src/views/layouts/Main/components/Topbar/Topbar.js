import React, { useState, Component, useEffect } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import { makeStyles } from "@material-ui/styles";
import {
  AppBar,
  Toolbar,
  Badge,
  Hidden,
  IconButton,
  Typography,
  MenuItem,
  Menu,
} from "@material-ui/core";
import MenuIcon from "@material-ui/icons/Menu";
import NotificationsIcon from "@material-ui/icons/NotificationsOutlined";
import InputIcon from "@material-ui/icons/Input";
import { logoutUser } from "../../../../../redux/Join/actions";

const useStyles = makeStyles((theme) => ({
  root: {
    boxShadow: "none",
  },
  flexGrow: {
    flexGrow: 1,
  },
  signOutButton: {
    marginLeft: theme.spacing(1),
  },
}));

function withMyHook(Component) {
  return function WrappedComponent(props) {
    const classes = useStyles();
    return <Component {...props} classes={classes} />;
  };
}

const Topbar = (props) => {
  const divProps = Object.assign({}, props);
  delete divProps.layout;
  const { className, onSidebarOpen, ...rest } = props;
  const { user } = props.auth;

  const classes = useStyles();

  const [notifications] = useState([]);
  const logo_style = {
    height: "4em",
    width: "4em",
    borderRadius: "50%",
    paddingTop: ".2em",
    marginRight: ".4em",
  };
  const airqo_logo_style = {
    height: "4em",
    width: "4em",
    paddingTop: ".2em",
    marginRight: ".4em",
  };

  const onLogoutClick = (e) => {
    e.preventDefault();
    props.logoutUser();
  };

  /***
   * Handling the menue details.
   */

  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const [date, setDate] = React.useState(new Date());
  useEffect(() => {
    var timerID = setInterval(() => tick(), 1000);

    return function cleanup() {
      clearInterval(timerID);
    };
  }, []);
  function appendLeadingZeroes(n) {
    if (n <= 9) {
      return "0" + n;
    }
    return n;
  }

  function tick() {
    //setDate(new Date());
    let newTime = new Date();
    let time =
      appendLeadingZeroes(newTime.getDate()) +
      "-" +
      appendLeadingZeroes(newTime.getMonth() + 1) +
      "-" +
      newTime.getFullYear() +
      " " +
      appendLeadingZeroes(newTime.getHours()) +
      ":" +
      appendLeadingZeroes(newTime.getMinutes()) +
      ":" +
      appendLeadingZeroes(newTime.getSeconds());
    setDate(time);
  }

  return (
    <AppBar {...rest} className={clsx(classes.root, className)}>
      <Toolbar>
        <p style={{ fontSize: 20, marginLeft: "50%", fontWeight: "bold" }}>
          {date.toLocaleString()}
        </p>
        <div className={classes.flexGrow} />
        <Hidden mdDown>
          <IconButton color="inherit">
            <Badge
              badgeContent={notifications.length}
              color="primary"
              variant="dot"
            >
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton
            className={classes.signOutButton}
            color="inherit"
            onClick={handleOpenMenu}
          >
            <InputIcon />
          </IconButton>
          <Menu
            id="menu-appbar"
            anchorEl={anchorEl}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            keepMounted
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            open={open}
            onClose={handleCloseMenu}
          >
            <MenuItem onClick={handleCloseMenu}>Profile</MenuItem>
            <MenuItem onClick={handleCloseMenu}>My account</MenuItem>
            <MenuItem onClick={onLogoutClick}>Logout</MenuItem>
          </Menu>
        </Hidden>
        {/* <Hidden lgUp>
          <IconButton color="inherit" onClick={onLogoutClick}>
            <MenuIcon />
          </IconButton>
        </Hidden> */}
      </Toolbar>
    </AppBar>
  );
};

Topbar.propTypes = {
  className: PropTypes.string,
  onSidebarOpen: PropTypes.func,
  logoutUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, { logoutUser })(withMyHook(Topbar));
