import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import Select from 'react-select';
import { Button, Grid, Paper, TextField } from '@material-ui/core';
import Tooltip from '@material-ui/core/Tooltip';
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CancelIcon from '@material-ui/icons/Cancel';
import ErrorIcon from '@material-ui/icons/Error';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import green from '@material-ui/core/colors/green';
import red from '@material-ui/core/colors/red';
import grey from '@material-ui/core/colors/grey';
import { makeStyles } from '@material-ui/styles';
import Hidden from '@material-ui/core/Hidden';
import { isEmpty, omit } from 'underscore';
import {
  deployDeviceApi,
  getDeviceRecentFeedByChannelIdApi,
  recallDeviceApi
} from '../../../apis/deviceRegistry';
import { updateMainAlert } from 'redux/MainAlert/operations';
import { getDateString, getElapsedDurationMapper, getFirstNDurations } from 'utils/dateTime';
import ConfirmDialog from 'views/containers/ConfirmDialog';
import OutlinedSelect from '../../CustomSelects/OutlinedSelect';
import { loadDevicesData } from 'redux/DeviceRegistry/operations';
import { capitalize } from 'utils/string';
import { filterSite } from 'utils/sites';
import { loadSitesData } from 'redux/SiteRegistry/operations';
import { formatDateString, isDateInPast } from 'utils/dateTime';
import { purple } from '@material-ui/core/colors';
import { setLoading } from 'redux/HorizontalLoader/index';
import 'assets/css/dropdown.css';

const customStyles = {
  control: (baseStyles, state) => ({
    ...baseStyles,
    borderColor: '#175df5'
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#0560c9',
    fontWeight: 'bold', // Increase the font weight
    textAlign: 'center',
    justifyContent: 'center'
  })
};

const DEPLOYMENT_STATUSES = {
  deployed: 'deployed',
  notDeployed: 'not deployed',
  recalled: 'recalled'
};

const useStyles = makeStyles((theme) => ({
  root: {
    color: green[500]
  },
  error: {
    color: red[500]
  },
  grey: {
    color: grey[200]
  },
  future: {
    color: purple[900],
    fontWeight: 'bold'
  }
}));

const emptyTestStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '93%'
};

const senorListStyle = {
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  justifyContent: 'space-around',
  width: '100%'
};

const coordinatesActivateStyles = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  fontSize: '.8rem'
};

const spanStyle = {
  width: '30%',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  padding: '0 20px'
};

const defaultSensorRange = { range: { min: Infinity, max: Infinity } };

const sensorFeedNameMapper = {
  pm2_5: { label: 'PM 2.5', range: { min: 1, max: 1000 } },
  pm10: { label: 'PM 10', range: { min: 1, max: 1000 } },
  s2_pm2_5: { label: 'Sensor-2 PM 2.5', range: { min: 1, max: 1000 } },
  s2_pm10: { label: 'Sensor-2 PM 10', range: { min: 1, max: 1000 } },
  latitude: {
    label: 'Latitude',
    range: { min: -90, max: 90 },
    badValues: [0, 1000]
  },
  longitude: {
    label: 'Longitude',
    range: { min: -180, max: 180 },
    badValues: [0, 1000]
  },
  battery: { label: 'Battery', range: { min: 2.7, max: 5 } },
  altitude: {
    label: 'Altitude',
    range: { min: 0, max: Infinity },
    badValues: [0]
  },
  speed: { label: 'Speed', range: { min: 0, max: Infinity }, badValues: [0] },
  satellites: {
    label: 'Satellites',
    range: { min: 0, max: 50 },
    badValues: [0]
  },
  hdop: { label: 'Hdop', range: { min: 0, max: Infinity }, badValues: [0] },
  internalTemperature: {
    label: 'Internal Temperature',
    range: { min: 0, max: 100 }
  },
  externalTemperature: {
    label: 'External Temperature',
    range: { min: 0, max: 100 }
  },
  internalHumidity: { label: 'Internal Humidity', range: { min: 0, max: 100 } },
  ExternalHumidity: { label: 'External Humidity', range: { min: 0, max: 100 } },
  ExternalPressure: { label: 'External Pressure', range: { min: 0, max: 100 } },
  TVOC: { label: 'Total Volatile Organic Compounds', range: { min: 0, max: 5500 } },
  HCHO: { label: 'formaldehyde', range: { min: 0, max: 0.5 } },
  CO2: { label: 'Carbon dioxide', range: { min: 0, max: 50000 } },
  IntakeTemperature: { label: 'Intake Temperature', range: { min: 0, max: 100 } },
  IntakeHumidity: { label: 'Intake Humidity', range: { min: 0, max: 100 } },
  BatteryVoltage: { label: 'Battery Voltage', range: { min: 0, max: 100 } }
};

const isValidSensorValue = (sensorValue, sensorValidator) => {
  if (sensorValidator.badValues && sensorValidator.badValues.includes(parseFloat(sensorValue))) {
    return false;
  }
  return sensorValidator.range.min <= sensorValue && sensorValue <= sensorValidator.range.max;
};

const EmptyDeviceTest = ({ loading, onClick }) => {
  return (
    <div style={emptyTestStyles}>
      <span>
        No devices test results, please click
        <Button
          color="primary"
          disabled={loading}
          onClick={onClick}
          style={{ textTransform: 'lowercase' }}
        >
          run
        </Button>{' '}
        to initiate the test
      </span>
    </div>
  );
};

EmptyDeviceTest.propTypes = {
  loading: PropTypes.bool.isRequired,
  onClick: PropTypes.func.isRequired
};

const DeviceRecentFeedView = ({ recentFeed, runReport }) => {
  const classes = useStyles();
  const feedKeys = Object.keys(
    omit(recentFeed, 'isCache', 'created_at', 'errors', 'success', 'message')
  );
  const [elapsedDurationSeconds, elapsedDurationMapper] = getElapsedDurationMapper(
    recentFeed.created_at
  );
  const elapseLimit = 5 * 3600; // 5 hours

  return (
    <div style={{ height: '94%' }}>
      <h4>Sensors</h4>
      {runReport.successfulTestRun && (
        <div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              marginBottom: '30px'
            }}
          >
            <span>
              Device last pushed data{' '}
              {isDateInPast(recentFeed.created_at) ? (
                <>
                  <span
                    className={elapsedDurationSeconds > elapseLimit ? classes.error : classes.root}
                  >
                    {getFirstNDurations(elapsedDurationMapper, 2)}
                  </span>{' '}
                  ago.
                </>
              ) : (
                <span className={classes.future}>in the future.</span>
              )}
            </span>
            {!isDateInPast(recentFeed.created_at) && (
              <div className={classes.future}>
                Error: Start date for this device is set to{' '}
                {formatDateString(recentFeed.created_at)}
              </div>
            )}
          </div>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              margin: '10px 30px',
              color: elapsedDurationSeconds > elapseLimit ? 'grey' : 'inherit'
            }}
          >
            {feedKeys.map((key, index) => (
              <div style={senorListStyle} key={index}>
                {isValidSensorValue(
                  recentFeed[key],
                  sensorFeedNameMapper[key] || defaultSensorRange
                ) ? (
                  <span style={spanStyle}>
                    <CheckBoxIcon
                      className={elapsedDurationSeconds > elapseLimit ? classes.grey : classes.root}
                    />
                  </span>
                ) : (
                  <Tooltip arrow title={'Value outside the valid range'}>
                    <span style={{ width: '30%' }}>
                      <CancelIcon className={classes.error} />
                    </span>
                  </Tooltip>
                )}
                <span style={spanStyle}>
                  {(sensorFeedNameMapper[key] && sensorFeedNameMapper[key].label) || key}{' '}
                </span>
                <Tooltip arrow title={recentFeed[key]}>
                  <span style={spanStyle}>{recentFeed[key]}</span>
                </Tooltip>
              </div>
            ))}
          </div>
        </div>
      )}
      {!runReport.successfulTestRun && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '10px 30px',
            height: '70%',
            color: 'red'
          }}
        >
          <ErrorIcon className={classes.error} /> Device test has failed, please cross check the
          functionality of device
        </div>
      )}
    </div>
  );
};

DeviceRecentFeedView.propTypes = {
  recentFeed: PropTypes.object.isRequired,
  runReport: PropTypes.object.isRequired
};

export default function DeviceDeployStatus({ deviceData, handleRecall, siteOptions }) {
  const dispatch = useDispatch();
  const [height, setHeight] = useState((deviceData.height && String(deviceData.height)) || '');
  const [power, setPower] = useState(capitalize(deviceData.powerType || ''));
  const [installationType, setInstallationType] = useState(deviceData.mountType || '');
  const [deploymentDate, setDeploymentDate] = useState(getDateString(deviceData.deployment_date));
  const [primaryChecked, setPrimaryChecked] = useState(deviceData.isPrimaryInLocation || false);
  const [isLoading, setIsLoading] = useState(false);

  const RecallButton = ({ handleRecall, recallLoading }) => {
    const [selectedRecallType, setSelectedRecallType] = useState('');
    const [selectVisible, setSelectVisible] = useState(false);

    const options = [
      { value: 'errors', label: 'Errors' },
      { value: 'disconnected', label: 'Disconnected' }
    ];

    const handleRecallChange = (selectedOption) => {
      setSelectedRecallType(selectedOption);
    };

    const handleRecallClick = async () => {
      setSelectVisible(true);
      if (selectedRecallType) {
        setSelectVisible(false);
        setrecallLoading(true);
        await handleRecall(selectedRecallType);
        window.location.reload();
        setrecallLoading(false);
        setSelectedRecallType('');
      }
    };

    return (
      <div
        style={{
          maxWidth: '500px',
          width: '100%'
        }}
      >
        <div className="dropdown-rapper-recall">
          {selectVisible && ( // Only render the select when selectVisible is true
            <Select
              value={selectedRecallType}
              onChange={handleRecallChange}
              options={options}
              styles={customStyles}
              isClearable
              placeholder="Select Recall Type"
            />
          )}
        </div>
        <Tooltip
          arrow
          title={recallLoading ? 'Recalling' : 'Recall Device'}
          placement="top"
          disableFocusListener={false}
          disableHoverListener={false}
          disableTouchListener={false}
        >
          <span>
            <Button
              variant="contained"
              color="primary"
              disabled={!deviceData.isActive || recallLoading}
              onClick={handleRecallClick}
            >
              {recallLoading ? 'Recalling' : 'Recall Device'}
            </Button>
          </span>
        </Tooltip>
      </div>
    );
  };

  const checkColocation = () => {
    if (typeof deviceData.isPrimaryInLocation === 'boolean') {
      return !deviceData.isPrimaryInLocation;
    }
    return undefined;
  };
  const [collocationChecked, setCollocationChecked] = useState(checkColocation());
  const [recentFeed, setRecentFeed] = useState({});
  const [runReport, setRunReport] = useState({
    ranTest: false,
    successfulTestRun: false,
    error: false
  });
  const [deviceTestLoading, setDeviceTestLoading] = useState(false);
  const [site, setSite] = useState(filterSite(siteOptions, deviceData.site && deviceData.site._id));
  const [deployLoading, setDeployLoading] = useState(false);
  const [deployed, setDeployed] = useState(false);
  const [recallLoading, setrecallLoading] = useState(false);
  const [recallOpen, setRecallOpen] = useState(false);
  const [errors, setErrors] = useState({
    height: '',
    powerType: '',
    mountType: '',
    site_id: ''
  });
  const [inputErrors, setInputErrors] = useState(false);

  const deviceStatus = !deviceData.status
    ? deviceData.isActive === true
      ? 'deployed'
      : 'not deployed'
    : deviceData.status;

  const handleHeightChange = (enteredHeight) => {
    let re = /\s*|\d+(\.d+)?/;
    if (re.test(enteredHeight.target.value)) {
      setHeight(enteredHeight.target.value);
      setInputErrors(false);
      setErrors({
        ...errors,
        height: enteredHeight.target.value.length > 0 ? '' : errors.height
      });
    }
  };

  const runDeviceTest = async () => {
    setDeviceTestLoading(true);
    await getDeviceRecentFeedByChannelIdApi(deviceData.device_number)
      .then((responseData) => {
        setRecentFeed(responseData);
        setRunReport({ ranTest: true, successfulTestRun: true, error: false });
      })
      .catch((err) => {
        setRunReport({ ranTest: true, successfulTestRun: false, error: true });
      });
    setDeviceTestLoading(false);
  };

  const checkErrors = () => {
    const state = {
      height,
      mountType: installationType,
      powerType: power,
      site_id: site
    };
    let newErrors = {};
    Object.keys(state).map((key) => {
      if (isEmpty(state[key])) {
        newErrors[key] = 'This field is required';
      }
      if (key === 'site') {
        if (!state[key].value && !state[key].label) newErrors[key] = 'This field is required';
      }
    });
    if (!isEmpty(newErrors)) {
      setErrors({ ...errors, ...newErrors });
      return true;
    }
    return false;
  };

  const handleDeploySubmit = async () => {
    setDeployLoading(true);
    dispatch(setLoading(true));
    if (checkErrors()) {
      setInputErrors(true);
      setDeployLoading(false);
      dispatch(setLoading(false));
      return;
    }

    const storedData = localStorage.getItem('currentUser');
    if (!storedData) {
      console.error('Error: No user data found in local storage');
      return;
    }

    const parsedData = JSON.parse(storedData);

    const deployData = {
      mountType: installationType,
      height: height,
      powerType: power,
      date: new Date(deploymentDate).toISOString(),
      isPrimaryInLocation: primaryChecked,
      isUsedForCollocation: collocationChecked,
      site_id: site.value,
      userName: parsedData.email,
      email: parsedData.email,
      firstName: parsedData.firstName,
      lastName: parsedData.lastName
    };

    // Add user_id only if it exists
    if (parsedData._id) {
      deployData.user_id = parsedData._id;
    }

    await deployDeviceApi(deviceData.name, deployData)
      .then((responseData) => {
        dispatch(
          updateMainAlert({
            message: responseData.message,
            show: true,
            severity: 'success'
          })
        );
        setDeployed(true);
        setInputErrors(false);

        setTimeout(() => {
          window.location.reload();
        }, 2000);
      })
      .catch((err) => {
        const errors = (err.response && err.response.data && err.response.data.errors) || {};
        setErrors(errors);
        dispatch(
          updateMainAlert({
            message: err.response.data.message,
            show: true,
            severity: 'error'
          })
        );
      });
    setDeployLoading(false);
    dispatch(setLoading(false));
    setIsLoading(false);
  };

  const handleRecallSubmit = async (selectedOption) => {
    setRecallOpen(false);
    setrecallLoading(true);
    const storedData = localStorage.getItem('currentUser');
    if (!storedData) {
      console.error('Error: No user data found in local storage');
      return;
    }

    const parsedData = JSON.parse(storedData);

    const responseData = {
      recallType: selectedOption.value,
      userName: parsedData.email,
      email: parsedData.email,
      firstName: parsedData.firstName,
      lastName: parsedData.lastName
    };

    // Add user_id only if it exists
    if (parsedData._id) {
      responseData.user_id = parsedData._id;
    }

    await recallDeviceApi(deviceData.name, responseData)
      .then((responseData) => {
        dispatch(
          updateMainAlert({
            message: responseData.message,
            show: true,
            severity: 'success'
          })
        );
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      })
      .catch((err) => {
        dispatch(
          updateMainAlert({
            message: err.response && err.response.data && err.response.data.message,
            show: true,
            severity: 'error'
          })
        );
      });
    setrecallLoading(false);
  };

  const weightedBool = (primary, secondary) => {
    if (primary) {
      return primary;
    }
    return secondary;
  };

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          // maxWidth: '2500px',
          padding: '40px 0px 10px 0px',
          margin: '0 auto',
          alignItems: 'baseline',
          justifyContent: 'flex-end'
        }}
      >
        <span
          style={{
            display: 'flex',
            alignItems: 'bottom',
            justifyContent: 'flex-end'
          }}
        >
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '1.2rem',
              marginRight: '10px'
            }}
          >
            <span
              style={{
                fontSize: '0.7rem',
                marginRight: '10px',
                background: '#ffffff',
                border: '1px solid #ffffff',
                borderRadius: '5px',
                padding: '0 5px'
              }}
            >
              Deploy status
            </span>{' '}
            <span
              style={{
                color: deviceStatus === 'deployed' ? 'green' : 'red',
                textTransform: 'capitalize'
              }}
            >
              {deviceStatus}
            </span>
          </span>
          <RecallButton handleRecall={handleRecallSubmit} recallLoading={recallLoading} />
        </span>
      </div>

      <Paper
        style={{
          margin: '0 auto',
          minHeight: '400px',
          padding: '20px 20px',
          maxWidth: '1500px'
        }}
      >
        <Grid container spacing={1}>
          <Grid items xs={12} sm={6}>
            <div style={{ marginBottom: '15px' }}>
              <OutlinedSelect
                label="Site"
                options={siteOptions}
                value={site}
                onChange={(newValue, actionMeta) => {
                  setSite(newValue);
                  setInputErrors(false);
                  setErrors({ ...errors, site: '' });
                }}
              />
              {errors.site_id && (
                <div
                  style={{
                    color: 'red',
                    textAlign: 'left',
                    fontSize: '0.7rem'
                  }}
                >
                  {errors.site_id}
                </div>
              )}
            </div>

            <TextField
              label="Height"
              value={height}
              onChange={handleHeightChange}
              style={{ marginBottom: '15px' }}
              fullWidth
              required
              error={!!errors.height}
              helperText={errors.height}
              variant="outlined"
              InputProps={{
                native: true,
                style: { width: '100%', height: '100%' }
              }}
            />

            <TextField
              select
              fullWidth
              required
              label="Power type"
              style={{ marginBottom: '15px' }}
              value={power}
              error={!!errors.powerType}
              helperText={errors.powerType}
              onChange={(event) => {
                setPower(event.target.value);
                setInputErrors(false);
                setErrors({
                  ...errors,
                  power: event.target.value.length > 0 ? '' : errors.power
                });
              }}
              SelectProps={{
                native: true,
                style: { width: '100%', height: '50px' }
              }}
              variant="outlined"
            >
              <option value="" />
              <option value="Mains">Mains</option>
              <option value="Solar">Solar</option>
              <option value="Alternator">Alternator</option>
            </TextField>

            <TextField
              select
              label="Mount Type"
              required
              variant="outlined"
              style={{ marginBottom: '15px' }}
              value={capitalize(installationType)}
              error={!!errors.mountType}
              helperText={errors.mountType}
              onChange={(event) => {
                setInstallationType(event.target.value);
                setInputErrors(false);
                setErrors({
                  ...errors,
                  installationType: event.target.value.length > 0 ? '' : errors.installationType
                });
              }}
              SelectProps={{
                native: true,
                style: { width: '100%', height: '50px' }
              }}
              fullWidth
            >
              <option value="" />
              <option value="Faceboard">Faceboard</option>
              <option value="Pole">Pole</option>
              <option value="Rooftop">Rooftop</option>
              <option value="Suspended">Suspended</option>
              <option value="Wall">Wall</option>
            </TextField>

            <TextField
              autoFocus
              margin="dense"
              variant="outlined"
              id="deployment_date"
              label="Deployment Date"
              type="date"
              style={{ marginBottom: '15px' }}
              InputLabelProps={{ shrink: true }}
              defaultValue={deploymentDate}
              onChange={(event) => setDeploymentDate(event.target.value) && setInputErrors(false)}
              error={!!errors.deployment_date}
              helperText={errors.deployment_date}
              fullWidth
            />

            <div style={{ margin: '30px 0 20px 0' }}>
              <Grid container item xs={12} spacing={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={primaryChecked}
                      onChange={(event) => {
                        setPrimaryChecked(!primaryChecked);
                        setCollocationChecked(primaryChecked);
                      }}
                      name="primaryDevice"
                      color="primary"
                    />
                  }
                  label="Primary device in this site"
                  style={{ margin: '10px 0 0 5px', width: '100%' }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={collocationChecked}
                      onChange={(event) => {
                        setCollocationChecked(!collocationChecked);
                        setPrimaryChecked(collocationChecked);
                      }}
                      name="collocation"
                      color="primary"
                    />
                  }
                  label="Formal collocation in this site"
                  style={{ marginLeft: '5px' }}
                />
              </Grid>{' '}
            </div>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Hidden smUp>
              <Grid container alignItems="center" alignContent="center" justify="center">
                <Button
                  color="primary"
                  disabled={deviceTestLoading}
                  onClick={runDeviceTest}
                  style={{ marginLeft: '10px 10px' }}
                >
                  Run device test
                </Button>
              </Grid>
            </Hidden>
            <Hidden xsDown>
              <Grid container alignItems="flex-end" alignContent="flex-end" justify="flex-end">
                <Button
                  color="primary"
                  disabled={deviceTestLoading}
                  onClick={runDeviceTest}
                  style={{ marginLeft: '10px 10px' }}
                >
                  Run device test
                </Button>
              </Grid>
              {isEmpty(recentFeed) && !runReport.ranTest && (
                <EmptyDeviceTest loading={deviceTestLoading} onClick={runDeviceTest} />
              )}
            </Hidden>
            {!isEmpty(recentFeed) && runReport.ranTest && (
              <DeviceRecentFeedView recentFeed={recentFeed} runReport={runReport} />
            )}
            {runReport.error && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  color: 'red'
                }}
              >
                Could not fetch device feeds
              </div>
            )}
          </Grid>

          <Grid container alignItems="flex-end" alignContent="flex-end" justify="flex-end" xs={12}>
            <Button variant="contained">Cancel</Button>
            <Tooltip
              arrow
              title={
                deviceStatus === 'deployed'
                  ? primaryChecked
                    ? 'Device is deployable'
                    : "Can't deploy device"
                  : deviceStatus !== 'deployed'
                  ? 'Run device test to activate'
                  : 'Device already deployed'
              }
              placement="top"
              disableFocusListener={runReport.successfulTestRun && !deviceData.isActive}
              disableHoverListener={runReport.successfulTestRun && !deviceData.isActive}
              disableTouchListener={runReport.successfulTestRun && !deviceData.isActive}
            >
              <span>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={weightedBool(deployLoading, deviceData.isActive || inputErrors)}
                  onClick={handleDeploySubmit}
                  style={{ marginLeft: '10px' }}
                >
                  {deployLoading ? 'Deploying' : deployed ? 'Deployed' : 'Deploy'}
                </Button>
              </span>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
}

DeviceDeployStatus.propTypes = {
  deviceData: PropTypes.object.isRequired
};
