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
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  Typography,
  TextField,
  InputAdornment
} from '@material-ui/core';
import { AppsOutlined, SearchOutlined } from '@material-ui/icons';
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
import SearchIcon from '@material-ui/icons/Search';
import LocationOnIcon from '@material-ui/icons/LocationOn';
import { Loader } from '@googlemaps/js-api-loader';
import { adminLevelsApi } from '../../apis/metaData';

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
    padding: 16
  },
  searchInputField: {
    width: '100%',
    marginBottom: 16
  },
  location: {
    backgroundColor: 'lightblue',
    height: 35,
    width: 35,
    borderRadius: '100%',
    marginRight: 10,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  locationList: {
    listStyle: 'none'
  },
  adminSpacing: {
    paddingLeft: 5
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

  const [openSearchDialog, setOpenSearchDialog] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [predictionResults, setPredictionResults] = useState([]);
  const [locationLatitude, setLocationLatitude] = useState('');
  const [locationLongitude, setLocationLongitude] = useState('');
  const [locationId, setLocationId] = useState('');
  const [adminLevels, setAdminLevels] = useState(null);

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
    const loader = new Loader({
      apiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY,
      version: 'weekly', // You can specify a specific version or 'weekly' for the latest version
      libraries: ['places'] // Add any additional libraries you need
    });

    loader.load().then(() => {
      // GOOGLE PLACES API loaded to get place predictions given a search string
      const autocompleteService = new window.google.maps.places.AutocompleteService();
      autocompleteService.getPlacePredictions({ input: searchValue }, (predictions, status) => {
        if (status != window.google.maps.places.PlacesServiceStatus.OK || !predictions) {
          alert(status);
          return;
        }

        const results = [];

        predictions.forEach((prediction) => {
          results.push(prediction);
        });

        setPredictionResults(results);
      });
    });
  }, [searchValue]);

  const getPlaceGeometry = (placeId) => {
    setLocationId(placeId);
    setPredictionResults([]);
    const placesService = new window.google.maps.places.PlacesService(
      document.createElement('div')
    );
    placesService.getDetails({ placeId }, (place, status) => {
      if (status != window.google.maps.places.PlacesServiceStatus.OK || !place) {
        alert(status);
        return;
      }
      setLocationLatitude(place.geometry.location.lat());
      setLocationLongitude(place.geometry.location.lng());
    });
  };

  // useEffect(() => {
  //   if (locationLatitude && locationLongitude) {
  //     const params = {

  //     }
  //     adminLevelsApi()
  //   }
  // }, [locationLatitude, locationLongitude]);

  useEffect(() => {
    if (locationId !== '') {
      const params = {
        place_id: locationId
      };
      adminLevelsApi(params)
        .then((res) => {
          setAdminLevels(res.data.administrative_levels);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  }, [locationId]);

  /**
   * call places api to return lat and lng(done)
   * call metadata api which takes in the place id and returns the admin levels to show to the user (done)
   * call the air quality search api which takes in the lat and lng and returns the air quality data
   * Test within Kira airqloud
   */

  const onSearch = () => {
    setOpenSearchDialog(true);
  };

  const hideSearchDialog = () => {
    setOpenSearchDialog(false);
  };

  const handleSearchChange = async (e) => {
    const { value } = e.target;

    if (value.length > 0) {
      setSearchValue(value);
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
        open={openSearchDialog}
        onClose={hideSearchDialog}
        aria-labelledby="form-dialog-title"
        className={classes.searchFormDialog}
      >
        <Typography className={classes.searchFormDialog}>
          <h5>Find the air quality of any place</h5>
          <p>Search for any location below</p>
        </Typography>

        <DialogContent>
          <div style={{ minWidth: 500 }}>
            <TextField
              type="search"
              variant="outlined"
              className={classes.searchInputField}
              placeholder="Try Kira Town, Uganda"
              id="outlined-search"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
              onChange={handleSearchChange}
            />
            {predictionResults && searchValue && (
              <ul className={classes.locationList}>
                {predictionResults.map((location) => (
                  <li
                    onClick={() => getPlaceGeometry(location.place_id)}
                    style={{
                      marginBottom: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <div className={classes.location}>
                      <LocationOnIcon fontSize="20" color="blue" />
                    </div>
                    <div style={{ width: '70%' }}>{location.description}</div>
                  </li>
                ))}
              </ul>
            )}

            {adminLevels && (
              <div style={{ display: 'flex' }}>
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
          </div>
        </DialogContent>
        <DialogActions>
          <div>
            <Button color="primary" variant="outlined" onClick={hideSearchDialog}>
              Close
            </Button>
          </div>
        </DialogActions>
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
