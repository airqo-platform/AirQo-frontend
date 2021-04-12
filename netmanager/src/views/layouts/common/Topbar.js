import React, { useState, Component, useEffect } from "react";
import { useDispatch } from "react-redux";
import clsx from "clsx";
import PropTypes from "prop-types";
import { Link as RouterLink, useHistory } from "react-router-dom";
import { connect } from "react-redux";
import { makeStyles, createStyles } from "@material-ui/styles";
import {
  AppBar,
  Collapse,
  Divider,
  Toolbar,
  Badge,
  Hidden,
  IconButton,
  MenuItem,
  Menu,
  ListItemIcon,
  ListItemText,
} from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";
import NotificationsIcon from "@material-ui/icons/NotificationsOutlined";
import CloseIcon from "@material-ui/icons/Close";
import InputIcon from "@material-ui/icons/Input";
import HelpIcon from "@material-ui/icons/Help";
import MoreVertIcon from "@material-ui/icons/MoreVert";
import MenuIcon from "@material-ui/icons/Menu";
import AccountBoxIcon from "@material-ui/icons/AccountBox";
import SettingsIcon from "@material-ui/icons/Settings";
import { logoutUser } from "redux/Join/actions";
import { useOrgData } from "redux/Join/selectors";
import { useMainAlertData } from "redux/MainAlert/selectors";
import { hideMainAlert } from "redux/MainAlert/operations";

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

const useAlertStyles = makeStyles((theme) =>
  createStyles({
    alertRoot: {
      padding: "10px 100px",
      borderRadius: "unset",
    },
    root: {
      width: "100%",
      "& > * + *": {
        marginTop: theme.spacing(2),
      },
    },
  })
);

export const TransitionAlerts = () => {
  const classes = useAlertStyles();
  const mainAlertData = useMainAlertData();
  const dispatch = useDispatch();

  return (
    <div className={classes.root}>
      <Collapse in={mainAlertData.show}>
        <Alert
          className={classes.alertRoot}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                dispatch(hideMainAlert());
              }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          severity={mainAlertData.severity}
        >
          {mainAlertData.message}
        </Alert>
      </Collapse>
    </div>
  );
};

function withMyHook(Component) {
  return function WrappedComponent(props) {
    const classes = useStyles();
    return <Component {...props} classes={classes} />;
  };
}

const Topbar = (props) => {
  const divProps = Object.assign({}, props);
  delete divProps.layout;
  const { className, toggleSidebar, ...rest } = props;
  const history = useHistory();

  const classes = useStyles();

  const [notifications] = useState([]);
  const orgData = useOrgData();

  const logoContainerStyle = {
    display: "flex",
    // justifyContent: "space-around",
    width: "330px",
  };

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
    history.push("/account");
    setAnchorEl(null);
  };

  const handleSettingsClick = () => {
    history.push("/settings");
    setAnchorEl(null);
  };
  const handleDocsClick = () => {
    window.open(
      "https://docs.airqo.net/airqo-handbook/-MHlrqORW-vI38ybYLVC/",
      "_blank"
    );
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
        <Hidden lgUp>
          <MenuIcon onClick={toggleSidebar} />
        </Hidden>
        <Hidden mdDown>
          <div style={logoContainerStyle}>
            {orgData.name !== "airqo" && (
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
                    src={
                      "https://res.cloudinary.com/drgm88r3l/image/upload/v1602488051/airqo_org_logos/" +
                      orgData.name +
                      "_logo.png"
                    }
                  />
                </RouterLink>
              </>
            )}
            {orgData.name === "airqo" && (
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
            )}
          </div>
        </Hidden>
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

        <Hidden mdDown>
          <p style={timer_style}>
            <span>{date.toLocaleString()}</span>
          </p>
        </Hidden>

        <div className={classes.flexGrow} />

        <Hidden lgUp>
          <IconButton
            className={classes.signOutButton}
            color="inherit"
            onClick={handleOpenMenu}
          >
            <MoreVertIcon />
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
            <MenuItem onClick={handleDocsClick}>
              <ListItemIcon>
                <HelpIcon />
              </ListItemIcon>
              <ListItemText primary="Docs" />
            </MenuItem>
            <MenuItem onClick={handleDocsClick}>
              <ListItemIcon>
                <NotificationsIcon />
              </ListItemIcon>
              <ListItemText primary="Notifications" />
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleSettingsClick}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </MenuItem>
            <MenuItem onClick={handleAccountClick}>
              <ListItemIcon>
                <AccountBoxIcon />
              </ListItemIcon>
              <ListItemText primary="Account" />
            </MenuItem>
            <Divider />
            <MenuItem onClick={onLogoutClick}>
              <ListItemIcon>
                <InputIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </MenuItem>
          </Menu>
        </Hidden>
        <Hidden mdDown>
          <IconButton
            color="inherit"
            href="https://docs.airqo.net/airqo-handbook/-MHlrqORW-vI38ybYLVC/"
            target="_blank"
          >
            <Badge
              badgeContent={notifications.length}
              color="primary"
              variant="dot"
            >
              <HelpIcon />
            </Badge>
          </IconButton>

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
            <MenuItem onClick={handleSettingsClick}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </MenuItem>
            <MenuItem onClick={handleAccountClick}>
              <ListItemIcon>
                <AccountBoxIcon />
              </ListItemIcon>
              <ListItemText primary="Account" />
            </MenuItem>
            <Divider />
            <MenuItem onClick={onLogoutClick}>
              <ListItemIcon>
                <InputIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </MenuItem>
          </Menu>
        </Hidden>
      </Toolbar>
      <TransitionAlerts />
    </AppBar>
  );
};

Topbar.propTypes = {
  className: PropTypes.string,
  toggleSidebar: PropTypes.func,
  logoutUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.auth,
});

export default connect(mapStateToProps, { logoutUser })(withMyHook(Topbar));
