import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import {
  Box,
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  TextField,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Divider,
  IconButton
} from '@material-ui/core';
import OutlinedSelect from '../../components/CustomSelects/OutlinedSelect';
import LocationOnIcon from '@material-ui/icons/LocationOn';
// import { DEPLOY_DEVICE_URI } from 'src/config/urls/deviceRegistry';

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
    justifyContent: 'flex-end'
  },
  button: {
    marginTop: theme.spacing(3),
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
    overflow: 'hidden'
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
  }
}));

const steps = ['Device Details', 'Site Details', 'Deploy'];

const DeployDevice = () => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const [deviceChoice, setDeviceChoice] = useState({
    value: 'existing',
    label: 'Select Existing Device'
  });
  const [device, setDevice] = useState(null);
  const [newDeviceName, setNewDeviceName] = useState('');
  const [newDeviceNetwork, setNewDeviceNetwork] = useState('');
  const [newDeviceDescription, setNewDeviceDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [visibility, setVisibility] = useState({ value: 'public', label: 'Public' });
  const [mapUrl, setMapUrl] = useState('');

  const mapview = process.env.REACT_APP_MAP_PREVIEW;

  useEffect(() => {
    if (latitude && longitude) {
      setMapUrl(`${mapview}/?mlat=${latitude}&mlon=${longitude}&zoom=13`);
    } else {
      setMapUrl('');
    }
  }, [latitude, longitude]);

  // Mock data for cohorts and devices
  const deviceOptions = [
    { value: 'device1', label: 'Device 1' },
    { value: 'device2', label: 'Device 2' },
    { value: 'device3', label: 'Device 3' }
  ];

  const visibilityOptions = [
    { value: 'public', label: 'Public' },
    { value: 'private', label: 'Private' }
  ];

  const deviceChoiceOptions = [
    { value: 'existing', label: 'Select Existing Device' },
    { value: 'new', label: 'Create New Device' }
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleDeploy = () => {
    // Implement the deploy logic here
    console.log('Deploying device...');
    // You can use DEPLOY_DEVICE_URI here for API calls related to device deployment
  };

  const openMap = () => {
    if (latitude && longitude) {
      window.open(`${mapview}/?mlat=${latitude}&mlon=${longitude}&zoom=13`, '_blank');
    }
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
                    Device Selection
                  </Typography>
                  <OutlinedSelect
                    label="Device Selection"
                    options={deviceChoiceOptions}
                    value={deviceChoice}
                    onChange={(selectedOption) => setDeviceChoice(selectedOption)}
                    placeholder="Select Device Option"
                  />
                </div>
              </Grid>
            </Grid>
            {deviceChoice.value === 'existing' ? (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <div className={classes.labelContainer}>
                    <Typography variant="subtitle1" className={classes.label}>
                      Select Device
                    </Typography>
                    <OutlinedSelect
                      label="Device"
                      options={deviceOptions}
                      value={device}
                      onChange={(selectedOption) => setDevice(selectedOption)}
                      placeholder="Select Device"
                    />
                  </div>
                </Grid>
              </Grid>
            ) : (
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <div className={classes.labelContainer}>
                    <Typography variant="subtitle1" className={classes.label}>
                      Device Name
                    </Typography>
                    <TextField
                      fullWidth
                      label="Device Name"
                      variant="outlined"
                      value={newDeviceName}
                      onChange={(e) => setNewDeviceName(e.target.value)}
                    />
                  </div>
                </Grid>
                <Grid item xs={12}>
                  <div className={classes.labelContainer}>
                    <Typography variant="subtitle1" className={classes.label}>
                      Network
                    </Typography>
                    <TextField
                      fullWidth
                      label="Network"
                      variant="outlined"
                      value={newDeviceNetwork}
                      onChange={(e) => setNewDeviceNetwork(e.target.value)}
                    />
                  </div>
                </Grid>
                <Grid item xs={12}>
                  <div className={classes.labelContainer}>
                    <Typography variant="subtitle1" className={classes.label}>
                      Description
                    </Typography>
                    <TextField
                      fullWidth
                      label="Description"
                      variant="outlined"
                      multiline
                      rows={4}
                      value={newDeviceDescription}
                      onChange={(e) => setNewDeviceDescription(e.target.value)}
                    />
                  </div>
                </Grid>
              </Grid>
            )}
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
                      Latitude
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
                      Longitude
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
                      Device Visibility
                    </Typography>
                    <OutlinedSelect
                      label="Visibility"
                      options={visibilityOptions}
                      value={visibility}
                      onChange={(selectedOption) => setVisibility(selectedOption)}
                      placeholder="Select Visibility"
                    />
                  </div>
                </Grid>
              </Grid>
            </div>
            <div className={classes.mapContainer}>
              {mapUrl ? (
                <iframe
                  title="Location Preview"
                  src={mapUrl}
                  className={classes.mapPreview}
                  frameBorder="0"
                  scrolling="no"
                  marginHeight="0"
                  marginWidth="0"
                />
              ) : (
                <div className={classes.mapPreviewPlaceholder}>
                  <Typography variant="body2" color="textSecondary">
                    Enter latitude and longitude to see the map preview
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
                <Typography>
                  Device Name: {deviceChoice.value === 'existing' ? device?.label : newDeviceName}
                </Typography>
                <Typography>
                  Network: {deviceChoice.value === 'existing' ? device?.network : newDeviceNetwork}
                </Typography>
                {deviceChoice.value === 'new' && (
                  <Typography>Description: {newDeviceDescription}</Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1">Site Details</Typography>
                <Typography>Latitude: {latitude}</Typography>
                <Typography>Longitude: {longitude}</Typography>
                <Typography>Visibility: {visibility.label}</Typography>
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
              >
                {activeStep === steps.length - 1 ? 'Deploy' : 'Next'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
};

export default DeployDevice;
