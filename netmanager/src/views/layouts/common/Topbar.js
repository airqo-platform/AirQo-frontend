import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import { Link, Link as RouterLink, useHistory } from 'react-router-dom';
import { connect, useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import {
  AppBar,
  Divider,
  Toolbar,
  Badge,
  Hidden,
  IconButton,
  MenuItem,
  Menu,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Button
} from '@material-ui/core';
import { AppsOutlined } from '@material-ui/icons';
import NotificationsIcon from '@material-ui/icons/NotificationsOutlined';
import InputIcon from '@material-ui/icons/Input';
import HelpIcon from '@material-ui/icons/Help';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import MenuIcon from '@material-ui/icons/Menu';
import AccountBoxIcon from '@material-ui/icons/AccountBox';
import SettingsIcon from '@material-ui/icons/Settings';
import { logoutUser } from 'redux/Join/actions';
import { useOrgData } from 'redux/Join/selectors';
import TransitionAlerts from './TransitionAlerts';
import { CALIBRATE_APP_URL } from 'config/urls/externalUrls';
import { formatDateString } from 'utils/dateTime.js';
import AirqoLogo from 'assets/img/icons/airqo_colored_logo.png';
import { isEmpty } from 'underscore';
import { getUserDetails } from 'redux/Join/actions';
import { addActiveNetwork } from 'redux/AccessControl/operations';

const useStyles = makeStyles((theme) => ({
  root: {
    boxShadow: 'none',
    backgroundColor: '#3067e2'
  },
  flexGrow: {
    flexGrow: 1
  },
  barRightStyles: {
    display: 'flex'
  },
  signOutButton: {
    marginLeft: theme.spacing(1)
  },
  menuContentWrapper: {
    width: '20rem',
    height: '410px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  menuTitle: {
    fontSize: '24px',
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
    maxWidth: '240px',
    margin: '24px 0px 12px 0px',
    padding: '0px'
  },
  menuContentText: {
    margin: '0px',
    textAlign: 'center',
    padding: '0px 0px 12px 0px',
    width: ' 100%',
    maxWidth: '240px',
    marginBottom: '12px'
  }
}));

function withMyHook(Component) {
  return function WrappedComponent(props) {
    const classes = useStyles();
    return <Component {...props} classes={classes} />;
  };
}

const Topbar = (props) => {
  const dispatch = useDispatch();
  const activeNetwork = useSelector((state) => state.accessControl.activeNetwork);

  const divProps = Object.assign({}, props);
  delete divProps.layout;
  const { className, toggleSidebar, ...rest } = props;
  const history = useHistory();

  const { user } = props.auth;

  const classes = useStyles();

  const [notifications] = useState([]);
  const orgData = useOrgData();

  const logoContainerStyle = {
    display: 'flex',
    // justifyContent: "space-around",
    width: '330px'
  };

  const logo_style = {
    height: '3.8em',
    width: '5em',
    borderRadius: '15%',
    paddingTop: '.2em',
    marginRight: '.4em'
  };

  const onLogoutClick = (e) => {
    e.preventDefault();
    props.logoutUser();
  };

  const timer_style = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    fontSize: 20,
    fontWeight: 'bold'
  };

  /***
   * Handling the menue details.
   */

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [appsAnchorEl, setAppsAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const openAppsMenu = Boolean(appsAnchorEl);

  const handleOpenMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAppsMenuClose = () => {
    setAppsAnchorEl(null);
  };

  const handleAppsMenuOpen = (event) => {
    setAppsAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleAccountClick = () => {
    history.push('/account');
    setAnchorEl(null);
  };

  const handleSettingsClick = () => {
    history.push('/settings');
    setAnchorEl(null);
  };
  const handleDocsClick = () => {
    window.open('https://docs.airqo.net/airqo-handbook/-MHlrqORW-vI38ybYLVC/', '_blank');
    setAnchorEl(null);
  };

  const handleNotifyClick = () => {
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
      return '0' + n;
    }
    return n;
  }

  function tick() {
    //setDate(new Date());
    let newTime = new Date();
    let time =
      appendLeadingZeroes(newTime.getDate()) +
      '-' +
      appendLeadingZeroes(newTime.getMonth() + 1) +
      '-' +
      newTime.getFullYear() +
      ' ' +
      appendLeadingZeroes(newTime.getHours()) +
      ':' +
      appendLeadingZeroes(newTime.getMinutes()) +
      ':' +
      appendLeadingZeroes(newTime.getSeconds());
    setDate(time);
  }

  useEffect(() => {
    if (!isEmpty(user)) {
      const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));
      getUserDetails(user._id).then((res) => {
        if (isEmpty(activeNetwork)) {
          localStorage.setItem('activeNetwork', JSON.stringify(res.users[0].networks[0]));
          dispatch(addActiveNetwork(res.users[0].networks[0]));
        }
      });
    }
  }, []);

  return (
    <AppBar {...rest} className={clsx(classes.root, className)}>
      <Toolbar>
        <Hidden lgUp>
          <MenuIcon onClick={toggleSidebar} />
        </Hidden>
        <Hidden mdDown>
          <div style={logoContainerStyle}>
            {activeNetwork.net_name !== 'airqo' && (
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
                {activeNetwork.net_name && (
                  <RouterLink to="/">
                    <img
                      alt={orgData.name}
                      style={logo_style}
                      src={
                        'https://res.cloudinary.com/drgm88r3l/image/upload/v1602488051/airqo_org_logos/' +
                        activeNetwork.net_name +
                        '_logo.png'
                      }
                    />
                  </RouterLink>
                )}
              </>
            )}
            {activeNetwork.net_name === 'airqo' && (
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
            textTransform: 'uppercase',
            marginLeft: '10px',
            fontSize: 20,
            fontWeight: 'bold'
          }}
        >
          {activeNetwork.net_name}
        </div>

        <Hidden mdDown>
          <p style={timer_style}>
            <span>{formatDateString(date.toUTCString)}</span>
          </p>
        </Hidden>

        <div className={classes.flexGrow} />
        {!isEmpty(user) ? (
          <div className={classes.barRightStyles}>
            <IconButton
              className={classes.signOutButton}
              color="inherit"
              onClick={handleAppsMenuOpen}
            >
              <Tooltip title={'AirQo Apps'}>
                <AppsOutlined />
              </Tooltip>
            </IconButton>

            <Menu
              id="menu-apps"
              anchorEl={appsAnchorEl}
              keepMounted
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left'
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left'
              }}
              getContentAnchorEl={null}
              open={openAppsMenu}
              onClose={handleAppsMenuClose}
            >
              <div style={{ width: '300px', height: '300px' }}>
                <div style={{ height: '100%', padding: '10px' }}>
                  <a
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                      width: '54px',
                      background: '#3067e2',
                      padding: '2px',
                      borderRadius: '5px',
                      cursor: 'pointer'
                    }}
                    href={CALIBRATE_APP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      alt="airqo.net"
                      style={{ width: '50px', height: 'auto' }}
                      src="https://res.cloudinary.com/drgm88r3l/image/upload/v1602488051/airqo_org_logos/airqo_logo.png"
                    />
                    <span style={{ fontSize: '10px', color: 'white' }}>Calibrate</span>
                  </a>
                </div>
              </div>
            </Menu>

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
                  vertical: 'top',
                  horizontal: 'right'
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right'
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
                <MenuItem onClick={handleNotifyClick}>
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
                <Badge badgeContent={notifications.length} color="primary" variant="dot">
                  <Tooltip title={'Documentation'}>
                    <HelpIcon />
                  </Tooltip>
                </Badge>
              </IconButton>

              <IconButton color="inherit">
                <Badge badgeContent={notifications.length} color="primary" variant="dot">
                  <Tooltip title={'Notifications'}>
                    <NotificationsIcon />
                  </Tooltip>
                </Badge>
              </IconButton>
              <IconButton
                className={classes.signOutButton}
                color="inherit"
                onClick={handleOpenMenu}
              >
                <Tooltip title={'Manage account'}>
                  <InputIcon />
                </Tooltip>
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right'
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right'
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
          </div>
        ) : (
          <div>
            <IconButton
              className={classes.signOutButton}
              color="inherit"
              aria-controls="create-account-menu"
              aria-haspopup="true"
              onClick={handleAppsMenuOpen}
            >
              <AppsOutlined />
            </IconButton>
            <Menu
              id="create-account-menu"
              anchorEl={appsAnchorEl}
              keepMounted
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'left'
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'left'
              }}
              getContentAnchorEl={null}
              open={openAppsMenu}
              onClose={handleAppsMenuClose}
            >
              <div className={classes.menuContentWrapper}>
                <img alt="airqo.net" style={logo_style} src={AirqoLogo} />
                <h1 className={classes.menuTitle}>
                  Sign up to see more air quality insights from around Africa!
                </h1>
                <p className={classes.menuContentText}>
                  Access and export realtime air quality visualisations with data collected from
                  different places in Africa.
                </p>
                <Link
                  to="/request-access"
                  style={{
                    borderRadius: '3px',
                    marginBottom: '15px'
                  }}
                  className="btn btn-large waves-effect waves-light hoverable blue accent-3"
                >
                  Let's start!
                </Link>
                <Link to="/login">Already have an account? Log in here</Link>
              </div>
            </Menu>
          </div>
        )}
      </Toolbar>
      <TransitionAlerts />
    </AppBar>
  );
};

Topbar.propTypes = {
  className: PropTypes.string,
  toggleSidebar: PropTypes.func,
  logoutUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired
};

const mapStateToProps = (state) => ({
  auth: state.auth
});

export default connect(mapStateToProps, { logoutUser })(withMyHook(Topbar));
