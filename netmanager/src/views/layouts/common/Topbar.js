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
  Dialog,
  DialogTitle,
  DialogContent,
  Typography,
  Paper,
  Snackbar
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
import { addActiveNetwork } from 'redux/AccessControl/operations';
import SearchIcon from '@material-ui/icons/Search';
import { adminLevelsApi } from '../../apis/metaData';
import { geocoordinatesPredictApi } from '../../apis/predict';
import { LargeCircularLoader } from 'views/components/Loader/CircularLoader';
import CloseIcon from '@material-ui/icons/Close';
import InfoIcon from '@material-ui/icons/Info';
import Slide from '@material-ui/core/Slide';
import moment from 'moment';
import AQSearch from '../../components/AirqualitySearch';
import { AirQuality } from '../../components/AirqualitySearch/aq_data';
import { Alert } from '@material-ui/lab';
import { clearLatAndLng } from 'redux/GooglePlaces/operations';
import 'assets/css/aq_search.css';

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
  },
  searchFormDialog: {
    padding: theme.spacing(4)
  },
  searchDialogTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textTransform: 'capitalize'
  },
  searchDialogSubtitle: {
    marginBottom: theme.spacing(2)
  },
  adminSpacing: {
    paddingLeft: 5
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1
  },
  iconButton: {
    padding: 10
  },
  divider: {
    height: 28,
    margin: 4
  },
  searchRoot: {
    padding: '0px 4px',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    marginBottom: theme.spacing(1)
  },
  closeButton: {
    position: 'absolute',
    right: theme.spacing(1),
    top: theme.spacing(1),
    color: theme.palette.grey[500]
  }
}));

function withMyHook(Component) {
  return function WrappedComponent(props) {
    const classes = useStyles();
    return <Component {...props} classes={classes} />;
  };
}

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

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

  const geometry = useSelector((state) => state.googlePlaces.geometry);

  const [openSearchDialog, setOpenSearchDialog] = useState(false);
  const [locationLatitude, setLocationLatitude] = useState('');
  const [locationLongitude, setLocationLongitude] = useState('');
  const [adminLevels, setAdminLevels] = useState(null);
  const [airQualityDetails, setAirQualityDetails] = useState(null);
  const [noAirQualityMsg, setNoAirQualityMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleErrorToastClose = () => {
    setAlertMessage('');
    setShowAlert(false);
  };

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
    const activeNetwork = JSON.parse(localStorage.getItem('activeNetwork'));
    if (!isEmpty(activeNetwork)) {
      dispatch(addActiveNetwork(activeNetwork));
    }
  }, []);

  useEffect(() => {
    if (!isEmpty(geometry)) {
      setLocationLatitude(geometry.lat);
      setLocationLongitude(geometry.lng);
    }
  }, [geometry]);

  useEffect(() => {
    if (locationLatitude !== '' && locationLongitude !== '') {
      const params = {
        latitude: locationLatitude,
        longitude: locationLongitude
      };
      setLoading(true);

      geocoordinatesPredictApi(params)
        .then((res) => {
          if (!isEmpty(res.data)) {
            setAirQualityDetails(res.data);
            setNoAirQualityMsg('');
          } else {
            setAirQualityDetails(null);
            setNoAirQualityMsg('No air quality data for this location');
          }
          setLoading(false);
        })
        .catch((err) => {
          setAlertMessage('Server error. Please try again later.');
          setShowAlert(true);
          setLoading(false);
          setNoAirQualityMsg('Server error. Please try again later.');
        });
    }
  }, [locationLatitude, locationLongitude]);

  useEffect(() => {
    if (!isEmpty(geometry)) {
      const params = {
        place_id: geometry.place_id
      };
      adminLevelsApi(params)
        .then((res) => {
          setAdminLevels(res.data.administrative_levels);
        })
        .catch((err) => {
          setAlertMessage('Server error. Please try again later.');
          setShowAlert(true);
          setLoading(false);
        });
    }
  }, [geometry]);

  const onSearch = () => {
    setOpenSearchDialog(true);
  };

  const hideSearchDialog = () => {
    setOpenSearchDialog(false);
    setLoading(false);
    setAirQualityDetails(null);
    setNoAirQualityMsg('');
    setAdminLevels(null);
    dispatch(clearLatAndLng());
  };

  const renderAirQualityDetails = (aq_reading) => {
    for (const condition in AirQuality) {
      const { minimumValue, maximumValue, description, svgEmoji, color } = AirQuality[condition];
      if (aq_reading >= minimumValue && aq_reading <= maximumValue) {
        return (
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                backgroundColor: color,
                borderRadius: '8px',
                padding: '10px',
                flexWrap: 'wrap'
              }}
            >
              <div>
                <h4
                  style={{
                    textTransform: 'capitalize',
                    margin: 0,
                    padding: 0,
                    paddingBottom: '5px'
                  }}
                >
                  {condition}
                </h4>
                <h2 style={{ margin: 0, padding: 0 }}>
                  {airQualityDetails.pm2_5.toFixed(2)}{' '}
                  <span style={{ fontSize: '18px' }}>
                    µg/m<sup>3</sup>
                  </span>
                </h2>
              </div>
              <img src={svgEmoji} className="emojiImg" />
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                marginTop: '12px'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'flex-start' }}>
                <InfoIcon color="#145DFF" />
                <p style={{ marginLeft: '10px' }}>{description}</p>
              </span>
              <p>
                Last updated on{' '}
                {moment(airQualityDetails.timestamp).format('MMMM Do YYYY, h:mm:ss a')}
              </p>
            </div>
          </div>
        );
      }
    }
  };

  return (
    <AppBar {...rest} className={clsx(classes.root, className)}>
      <Toolbar>
        <Hidden lgUp>
          <MenuIcon onClick={toggleSidebar} />
        </Hidden>

        <Hidden mdDown>
          <div style={logoContainerStyle}>
            {activeNetwork.net_name !== 'airqo' ? (
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
            ) : (
              <>
                <RouterLink to="/">
                  <img
                    alt={orgData.name}
                    style={logo_style}
                    src={`https://res.cloudinary.com/drgm88r3l/image/upload/v1602488051/airqo_org_logos/${activeNetwork.net_name}_logo.png`}
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
          {activeNetwork && activeNetwork.net_name}
        </div>

        <Hidden mdDown>
          <p style={timer_style}>
            <span>{formatDateString(date.toUTCString)}</span>
          </p>
        </Hidden>

        <div className={classes.flexGrow} />
        {!isEmpty(user) ? (
          <div className={classes.barRightStyles}>
            <IconButton onClick={onSearch} style={{ color: 'white' }}>
              <SearchIcon />
            </IconButton>
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

      <Dialog
        fullScreen
        TransitionComponent={Transition}
        open={openSearchDialog}
        onClose={hideSearchDialog}
        aria-labelledby="form-dialog-title"
        className={classes.searchFormDialog}
      >
        <DialogTitle>
          <IconButton aria-label="close" className={classes.closeButton} onClick={hideSearchDialog}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {/* Error toast */}
          <Snackbar
            open={showAlert}
            autoHideDuration={6000}
            onClose={handleErrorToastClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert onClose={handleErrorToastClose} severity="error">
              {alertMessage}
            </Alert>
          </Snackbar>

          <Typography>
            <h5 className={classes.searchDialogTitle}>Find the air quality of any place</h5>
          </Typography>
          <p className={classes.searchDialogSubtitle}>Search for any location below</p>
          <div>
            <AQSearch />

            <div>
              {adminLevels && (
                <div style={{ display: 'flex', marginTop: '10px', marginBottom: '10px' }}>
                  <span className={classes.adminSpacing}>
                    {adminLevels.country} {adminLevels.country && '/'}
                  </span>
                  <span className={classes.adminSpacing}>
                    {adminLevels.administrative_level_1} {adminLevels.administrative_level_1 && '/'}
                  </span>
                  <span className={classes.adminSpacing}>
                    {adminLevels.locality} {adminLevels.locality && '/'}
                  </span>
                  <span className={classes.adminSpacing}>
                    {adminLevels.sub_locality} {adminLevels.sub_locality && '/'}
                  </span>
                  <span className={classes.adminSpacing}>{adminLevels.route}</span>
                </div>
              )}

              {loading && <LargeCircularLoader loading={loading} height={'30px'} />}

              {airQualityDetails && renderAirQualityDetails(airQualityDetails.pm2_5)}

              {noAirQualityMsg && (
                <p style={{ color: 'lightgrey', textAlign: 'center', marginTop: '40px' }}>
                  {noAirQualityMsg}
                </p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
