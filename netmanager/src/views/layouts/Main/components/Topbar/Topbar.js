import React, { useState, Component, useEffect } from "react";
import clsx from "clsx";
import PropTypes from "prop-types";
import { Link as RouterLink } from "react-router-dom";
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
import { logoutUser } from "redux/Join/actions";
import { useOrgData } from "../../../../../redux/Join/selectors";

const useStyles = makeStyles((theme) => ({
  root: {
    boxShadow: "none",
    backgroundColor: "#3067e2",
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

  const classes = useStyles();

  const [notifications] = useState([]);
  const orgData = useOrgData();

  const logo_style = {
    height: "3.8em",
    width: "5em",
    borderRadius: "15%",
    paddingTop: ".2em",
    marginRight: ".4em",
  };

  const onLogoutClick = (e) => {
    e.preventDefault();
    props.logoutUser();
  };

  const timer_style = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    fontSize: 20,
    fontWeight: "bold",
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

  const handleAccountClick = () => {
    setAnchorEl(null);
  };

  const handleProfileClick = () => {
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
        {orgData.name != 'airqo' && 
          <>
         <RouterLink to="/">
          <img
            alt="mak.ac.ug"
            style={logo_style}
            src="https://res.cloudinary.com/drgm88r3l/image/upload/v1602488051/airqo_org_logos/mak_logo.png"
          />
        </RouterLink>
        <RouterLink to="/">
          <img
            alt="airqo.net"
            style={logo_style}
            src="https://res.cloudinary.com/drgm88r3l/image/upload/v1602488051/airqo_org_logos/airqo_logo.png"
          />
        </RouterLink>
        <RouterLink to="/">
          <img
              alt={orgData.name}
              style={logo_style}
              src={"https://res.cloudinary.com/drgm88r3l/image/upload/v1602488051/airqo_org_logos/" + orgData.name + "_logo.png"}
          />
          </RouterLink>
          </>
        }
        {orgData.name == 'airqo' && 
          <>
          <RouterLink to="/">
          <img
            alt="mak.ac.ug"
            style={logo_style}
            src="https://res.cloudinary.com/drgm88r3l/image/upload/v1602488051/airqo_org_logos/mak_logo.png"
          />
          </RouterLink>
        <RouterLink to="/">
          <img
            alt="airqo.net"
            style={logo_style}
            src="https://res.cloudinary.com/drgm88r3l/image/upload/v1602488051/airqo_org_logos/airqo_logo.png"
          />
        </RouterLink>
        
          </>
        }
        
        <div
          style={{
            textTransform: "uppercase",
            marginLeft: "10px",
            fontSize: 20,
            fontWeight: "bold",
          }}
        >
          {orgData.name}
        </div>
        <p style={timer_style}>
          <span>{date.toLocaleString()}</span>
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
            <MenuItem onClick={handleProfileClick}>Settings</MenuItem>
            <MenuItem onClick={handleAccountClick}>Account</MenuItem>
            <MenuItem onClick={onLogoutClick}>Logout</MenuItem>
          </Menu>
        </Hidden>
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
