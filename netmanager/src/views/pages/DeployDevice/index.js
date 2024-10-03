import React, { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Box,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Checkbox,
  FormControlLabel,
  Snackbar,
  IconButton
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import CloseIcon from '@material-ui/icons/Close';
import OutlinedSelect from '../../components/CustomSelects/OutlinedSelect';
import { Map as LeafletMap, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { batchDeployDevicesApi } from '../../apis/deviceRegistry';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.default,
    minHeight: '100%',
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3)
  },
  container: {
    [theme.breakpoints.up('lg')]: {
      width: '100%',
      paddingLeft: 64,
      paddingRight: 64
    }
  },
  card: {
    marginTop: theme.spacing(3)
  },
  stepper: {
    padding: theme.spacing(3, 0, 5)
  },
  buttons: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: theme.spacing(3)
  },
  button: {
    width: 180,
    marginLeft: theme.spacing(1)
  },
  cardContent: {
    padding: theme.spacing(4)
  },
  formControl: {
    marginBottom: theme.spacing(2)
  },
  labelContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1)
  },
  label: {
    minWidth: 120,
    marginRight: theme.spacing(2)
  },
  siteDetailsContainer: {
    display: 'flex',
    flexDirection: 'column',
    [theme.breakpoints.up('md')]: {
      flexDirection: 'row'
    }
  },
  siteDetailsFields: {
    flex: 1,
    marginBottom: theme.spacing(2),
    [theme.breakpoints.up('md')]: {
      marginRight: theme.spacing(2),
      marginBottom: 0
    }
  },
  mapContainer: {
    height: 250,
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '50%'
    },
    overflow: 'hidden',
    position: 'relative'
  },
  mapPreviewPlaceholder: {
    height: 250,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    border: '1px solid #ccc',
    borderRadius: theme.shape.borderRadius
  },
  infoCard: {
    backgroundColor: theme.palette.grey[100],
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2)
  },
  alert: {
    width: '100%'
  },
  map: {
    height: '100%',
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0
  }
}));

const steps = ['Device Details', 'Site Details', 'Deploy'];

const DeployDevice = () => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const [powerType, setPowerType] = useState('');
  const [mountType, setMountType] = useState('');
  const [height, setHeight] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [siteName, setSiteName] = useState('');
  const [isPrimaryDevice, setIsPrimaryDevice] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const mapRef = useRef();
  const [openAlert, setOpenAlert] = useState(false);
  const [alertSeverity, setAlertSeverity] = useState('success');
  const [alertMessage, setAlertMessage] = useState('');
  const [latitudeError, setLatitudeError] = useState('');
  const [longitudeError, setLongitudeError] = useState('');
  const [siteNameError, setSiteNameError] = useState('');
  const [deviceNameError, setDeviceNameError] = useState('');

  const powerTypeOptions = [
    { value: 'solar', label: 'Solar' },
    { value: 'mains', label: 'Mains' },
    { value: 'alternator', label: 'Alternator' }
  ];

  const mountTypeOptions = [
    { value: 'faceboard', label: 'Faceboard' },
    { value: 'pole', label: 'Pole' },
    { value: 'rooftop', label: 'Rooftop' },
    { value: 'suspended', label: 'Suspended' },
    { value: 'wall', label: 'Wall' }
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleDeploy = async () => {
    const deployData = [
      {
        date: new Date().toISOString(),
        height: parseFloat(height),
        mountType: mountType.value,
        powerType: powerType.value,
        isPrimaryInLocation: isPrimaryDevice,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        site_name: siteName,
        network: 'airqo',
        deviceName: deviceName
      }
    ];

    try {
      const response = await batchDeployDevicesApi(deployData);

      if (response.success) {
        if (
          response.successful_deployments.length > 0 &&
          response.failed_deployments.length === 0
        ) {
          setAlertSeverity('success');
          setAlertMessage('Device deployed successfully!');

          // Reset form values
          setDeviceName('');
          setPowerType('');
          setMountType('');
          setHeight('');
          setLatitude('');
          setLongitude('');
          setSiteName('');
          setIsPrimaryDevice(false);

          // Reset to first step
          setActiveStep(0);
        } else if (response.failed_deployments.length > 0) {
          setAlertSeverity('error');
          const errorMessage = response.failed_deployments[0].error.message;
          setAlertMessage(`Deployment failed: ${errorMessage}`);
        } else {
          setAlertSeverity('warning');
          setAlertMessage('No deployments were processed. Please try again.');
        }
      } else {
        setAlertSeverity('error');
        setAlertMessage('Deployment failed. Please try again.');
      }
      setOpenAlert(true);
    } catch (error) {
      console.error('Deployment failed:', error);
      setAlertSeverity('error');
      setAlertMessage('An error occurred during deployment. Please try again.');
      setOpenAlert(true);
    }
  };

  const handleCloseAlert = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenAlert(false);
  };

  const isStep0Valid =
    powerType && mountType && height && height > 0 && deviceName && !deviceNameError;
  const isStep1Valid =
    latitude && longitude && siteName && !latitudeError && !longitudeError && !siteNameError;

  const validateCoordinate = (value, setter) => {
    if (value === '') {
      setter('');
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setter('Must be a valid number');
    } else if (!value.includes('.') || value.split('.')[1]?.length < 5) {
      setter('Must have at least 5 decimal places');
    } else {
      setter('');
    }
  };

  const handleLatitudeChange = (e) => {
    const value = e.target.value;
    setLatitude(value);
    validateCoordinate(value, setLatitudeError);
  };

  const handleLongitudeChange = (e) => {
    const value = e.target.value;
    setLongitude(value);
    validateCoordinate(value, setLongitudeError);
  };

  const validateSiteName = (value) => {
    if (value.length <= 3) {
      setSiteNameError('Site name must be longer than 3 characters');
    } else {
      setSiteNameError('');
    }
  };

  const handleSiteNameChange = (e) => {
    const value = e.target.value;
    setSiteName(value);
    validateSiteName(value);
  };

  const validateDeviceName = (value) => {
    if (value.length < 4) {
      setDeviceNameError('Device name must be at least 4 characters long');
    } else {
      setDeviceNameError('');
    }
  };

  const handleDeviceNameChange = (e) => {
    const value = e.target.value;
    setDeviceName(value);
    validateDeviceName(value);
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <div className={classes.labelContainer}>
                  <Typography variant="subtitle1" className={classes.label}>
                    Device Name *
                  </Typography>
                  <TextField
                    fullWidth
                    label="Device Name"
                    variant="outlined"
                    value={deviceName}
                    onChange={handleDeviceNameChange}
                    error={!!deviceNameError}
                    helperText={deviceNameError}
                  />
                </div>
              </Grid>
              <Grid item xs={12}>
                <div className={classes.labelContainer}>
                  <Typography variant="subtitle1" className={classes.label}>
                    Power Type *
                  </Typography>
                  <OutlinedSelect
                    label="Power Type"
                    options={powerTypeOptions}
                    value={powerType}
                    onChange={(selectedOption) => setPowerType(selectedOption)}
                    placeholder="Select Power Type"
                  />
                </div>
              </Grid>
              <Grid item xs={12}>
                <div className={classes.labelContainer}>
                  <Typography variant="subtitle1" className={classes.label}>
                    Mount Type *
                  </Typography>
                  <OutlinedSelect
                    label="Mount Type"
                    options={mountTypeOptions}
                    value={mountType}
                    onChange={(selectedOption) => setMountType(selectedOption)}
                    placeholder="Select Mount Type"
                  />
                </div>
              </Grid>
              <Grid item xs={12}>
                <div className={classes.labelContainer}>
                  <Typography variant="subtitle1" className={classes.label}>
                    Height *
                  </Typography>
                  <TextField
                    fullWidth
                    label="Height (meters)"
                    variant="outlined"
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(parseFloat(e.target.value))}
                    helperText={height && height <= 0 ? 'Height must be greater than 0' : ''}
                  />
                </div>
              </Grid>
              <Grid item xs={12}>
                <div className={classes.infoCard}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={isPrimaryDevice}
                        onChange={(e) => setIsPrimaryDevice(e.target.checked)}
                        color="primary"
                      />
                    }
                    label="Set as primary device of location"
                  />
                </div>
              </Grid>
            </Grid>
          </>
        );
      case 1:
        return (
          <div className={classes.siteDetailsContainer}>
            <div className={classes.siteDetailsFields}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <div className={classes.labelContainer}>
                    <Typography variant="subtitle1" className={classes.label}>
                      Latitude *
                    </Typography>
                    <TextField
                      fullWidth
                      label="Latitude"
                      variant="outlined"
                      value={latitude}
                      onChange={handleLatitudeChange}
                      error={!!latitudeError}
                      helperText={
                        latitudeError ||
                        (latitude && (parseFloat(latitude) < -90 || parseFloat(latitude) > 90)
                          ? 'Latitude must be between -90 and 90'
                          : '')
                      }
                    />
                  </div>
                </Grid>
                <Grid item xs={12}>
                  <div className={classes.labelContainer}>
                    <Typography variant="subtitle1" className={classes.label}>
                      Longitude *
                    </Typography>
                    <TextField
                      fullWidth
                      label="Longitude"
                      variant="outlined"
                      value={longitude}
                      onChange={handleLongitudeChange}
                      error={!!longitudeError}
                      helperText={
                        longitudeError ||
                        (longitude && (parseFloat(longitude) < -180 || parseFloat(longitude) > 180)
                          ? 'Longitude must be between -180 and 180'
                          : '')
                      }
                    />
                  </div>
                </Grid>
                <Grid item xs={12}>
                  <div className={classes.labelContainer}>
                    <Typography variant="subtitle1" className={classes.label}>
                      Site Name *
                    </Typography>
                    <TextField
                      fullWidth
                      label="Site Name"
                      variant="outlined"
                      value={siteName}
                      onChange={handleSiteNameChange}
                      error={!!siteNameError}
                      helperText={siteNameError}
                    />
                  </div>
                </Grid>
              </Grid>
            </div>
            <div className={classes.mapContainer}>
              {latitude && longitude ? (
                <LeafletMap
                  center={[latitude, longitude]}
                  zoom={13}
                  scrollWheelZoom={false}
                  className={classes.map}
                >
                  <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
                    attribution="Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012"
                  />
                  <Marker position={[latitude, longitude]}>
                    <Popup>Deployment site</Popup>
                  </Marker>
                </LeafletMap>
              ) : (
                <div className={classes.mapPreviewPlaceholder}>
                  <Typography variant="body2" color="textSecondary">
                    Map preview will appear here
                  </Typography>
                </div>
              )}
            </div>
          </div>
        );
      case 2:
        return (
          <div>
            <Typography variant="h6" gutterBottom>
              Deployment Preview
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">Device Details</Typography>
                <Typography>Device Name: {deviceName}</Typography>
                <Typography>Power Type: {powerType.label}</Typography>
                <Typography>Mount Type: {mountType.label}</Typography>
                <Typography>Height: {height}</Typography>
                <Typography>Primary Device: {isPrimaryDevice ? 'Yes' : 'No'}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">Site Details</Typography>
                <Typography>Latitude: {latitude}</Typography>
                <Typography>Longitude: {longitude}</Typography>
                <Typography>Site Name: {siteName}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">
                  Please review the details above. Click 'Deploy' to proceed with the deployment.
                </Typography>
              </Grid>
            </Grid>
          </div>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <Box className={classes.root}>
      <Container className={classes.container} maxWidth={false}>
        <Card className={classes.card}>
          <CardHeader title="Device Deployment" />
          <Divider />
          <CardContent className={classes.cardContent}>
            <Stepper activeStep={activeStep} className={classes.stepper}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            {renderStepContent(activeStep)}
            <div className={classes.buttons}>
              {activeStep !== 0 && (
                <Button onClick={handleBack} className={classes.button}>
                  Back
                </Button>
              )}
              <Button
                variant="contained"
                color="primary"
                onClick={activeStep === steps.length - 1 ? handleDeploy : handleNext}
                className={classes.button}
                disabled={
                  (activeStep === 0 && !isStep0Valid) || (activeStep === 1 && !isStep1Valid)
                }
              >
                {activeStep === steps.length - 1 ? 'Deploy' : 'Next'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </Container>
      <Snackbar
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        open={openAlert}
        autoHideDuration={10000}
        onClose={handleCloseAlert}
      >
        <Alert
          elevation={6}
          variant="filled"
          onClose={handleCloseAlert}
          severity={alertSeverity}
          className={classes.alert}
          action={
            <IconButton aria-label="close" color="inherit" size="small" onClick={handleCloseAlert}>
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {alertMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DeployDevice;
