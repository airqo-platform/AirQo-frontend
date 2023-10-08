import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@material-ui/styles';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  InputBase,
  Paper,
  Snackbar,
  Typography
} from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import InfoIcon from '@material-ui/icons/Info';
import moment from 'moment';
import AQSearch from '../../components/AirqualitySearch';
import { AirQuality } from '../../components/AirqualitySearch/aq_data';
import { Alert } from '@material-ui/lab';
import { clearLatAndLng } from 'redux/GooglePlaces/operations';
import { adminLevelsApi } from '../../apis/metaData';
import { geocoordinatesPredictApi } from '../../apis/predict';
import 'assets/css/aq_search.css';
import { LargeCircularLoader } from 'views/components/Loader/CircularLoader';
import CloseIcon from '@material-ui/icons/Close';
import Slide from '@material-ui/core/Slide';
import { isEmpty } from 'underscore';

const useStyles = makeStyles((theme) => ({
  paperRoot: {
    padding: '8px 4px',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    borderColor: '#eee',
    maxHeight: '44px',
    height: '44px',
    padding: '0px',
    fontSize: '14px'
  },
  input: {
    marginLeft: theme.spacing(1),
    width: '100%',
    marginBottom: '-4px'
  },
  iconButton: {
    // padding: 10,
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

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DashboardSearchBar = () => {
  const classes = useStyles();
  const dispatch = useDispatch();
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

  const handleErrorToastClose = () => {
    setAlertMessage('');
    setShowAlert(false);
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
    <>
      <Paper component="form" className={classes.paperRoot}>
        <InputBase
          className={classes.input}
          placeholder="Search air quality for any location"
          inputProps={{ 'aria-label': 'search google maps' }}
          onMouseDown={() => setOpenSearchDialog(true)}
        />
        <IconButton
          className={classes.iconButton}
          aria-label="search"
          onClick={() => setOpenSearchDialog(true)}
        >
          <SearchIcon />
        </IconButton>
      </Paper>

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
    </>
  );
};

export default DashboardSearchBar;
