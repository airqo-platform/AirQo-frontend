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
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { batchDeployDevicesApi } from '../../apis/deviceRegistry';

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
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column'
    }
  },
  siteDetailsFields: {
    flex: 1,
    marginRight: theme.spacing(2),
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    [theme.breakpoints.down('sm')]: {
      marginRight: 0,
      marginBottom: theme.spacing(2)
    }
  },
  mapContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  mapPreview: {
    width: '100%',
    height: 250,
    border: '1px solid #ccc',
    borderRadius: theme.shape.borderRadius,
    overflow: 'hidden',
    position: 'relative'
  },
  mapPreviewPlaceholder: {
    width: '100%',
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
  }
}));

const steps = ['Device Details', 'Site Details', 'Deploy'];

const DeployDevice = () => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const [deviceId, setDeviceId] = useState('');
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
          setDeviceId('');
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

  const isStep0Valid = deviceId && powerType && mountType && height && height > 0 && deviceName;
  const isStep1Valid = latitude && longitude && siteName;

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <div className={classes.labelContainer}>
                  <Typography variant="subtitle1" className={classes.label}>
                    Device ID *
                  </Typography>
                  <TextField
                    fullWidth
                    label="Device ID"
                    variant="outlined"
                    value={deviceId}
                    onChange={(e) => setDeviceId(e.target.value)}
                  />
                </div>
              </Grid>
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
                    onChange={(e) => setDeviceName(e.target.value)}
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
                    label="Height"
                    variant="outlined"
                    type="number"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    helperText={height <= 0 ? 'Height must be greater than 0' : ''}
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
                      onChange={(e) => setLatitude(e.target.value)}
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
                      onChange={(e) => setLongitude(e.target.value)}
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
                      onChange={(e) => setSiteName(e.target.value)}
                    />
                  </div>
                </Grid>
              </Grid>
            </div>
            <div className={classes.mapContainer}>
              {/* {latitude && longitude ? (
                <Map
                  center={[latitude, longitude]}
                  zoom={13}
                  scrollWheelZoom={false}
                  className={classes.mapPreview}
                  ref={mapRef}
                >
                  <TileLayer
                    url='https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}'
                    attribution='Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
                  />
                  <Marker position={[latitude, longitude]}>
                    <Popup>Deployment site</Popup>
                  </Marker>
                </Map>
              ) : (
                <div className={classes.mapPreviewPlaceholder}>
                  <Typography variant="body2" color="textSecondary">
                    Enter latitude and longitude to see the map preview
                  </Typography>
                </div>
              )} */}

              <div className={classes.mapPreviewPlaceholder}>
                <Typography variant="body2" color="textSecondary">
                  Map preview will appear here
                </Typography>
              </div>
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
                <Typography>Device ID: {deviceId}</Typography>
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
