import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
  TextField,
} from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import Input from "@material-ui/core/Input";
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import Tooltip from "@material-ui/core/Tooltip";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import CancelIcon from "@material-ui/icons/Cancel";
import ErrorIcon from "@material-ui/icons/Error";
import DateFnsUtils from "@date-io/date-fns";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import green from "@material-ui/core/colors/green";
import red from "@material-ui/core/colors/red";
import grey from "@material-ui/core/colors/grey";
import { makeStyles } from "@material-ui/styles";
import { isEmpty, omit } from "underscore";
import {
  deployDeviceApi,
  getDeviceRecentFeedByChannelIdApi,
  recallDeviceApi,
} from "../../../apis/deviceRegistry";
import { updateMainAlert } from "redux/MainAlert/operations";
import { getElapsedDurationMapper } from "utils/dateTime";
import { updateDevice } from "redux/DeviceRegistry/operations";

const useStyles = makeStyles((theme) => ({
  root: {
    color: green[500],
  },
  error: {
    color: red[500],
  },
  grey: {
    color: grey[200],
  },
}));

const getFirstNDurations = (duration, n) => {
  let format = "";
  let count = n;
  const keys = ["year", "month", "week", "day", "hour", "minute", "second"];
  for (const key of keys) {
    const elapsedTime = duration[key];
    if (elapsedTime > 0) {
      format = `${format} ${elapsedTime} ${key}(s),`;
      count -= 1;
    }

    if (count <= 0) break;
  }
  return format;
};

const errorStyles = {
  color: "red",
  margin: 0,
  fontSize: "11px",
  marginTop: "3px",
  textAlign: "left",
  fontFamily: "Roboto, Helvetica, Arial, sans-serif",
  fontWeight: 400,
  lineHeight: "13px",
  letterSpacing: "0.33px",
};

const emptyTestStyles = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "93%",
};

const senorListStyle = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  justifyContent: "space-around",
  width: "100%",
};

const coordinatesActivateStyles = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  fontSize: ".8rem",
};

const spanStyle = {
  width: "30%",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  padding: "0 20px",
};

const defaultSensorRange = { range: { min: Infinity, max: Infinity } };

const sensorFeedNameMapper = {
  pm2_5: { label: "PM 2.5", range: { min: 1, max: 1000 } },
  pm10: { label: "PM 10", range: { min: 1, max: 1000 } },
  s2_pm2_5: { label: "Sensor-2 PM 2.5", range: { min: 1, max: 1000 } },
  s2_pm10: { label: "Sensor-2 PM 10", range: { min: 1, max: 1000 } },
  latitude: {
    label: "Latitude",
    range: { min: -90, max: 90 },
    badValues: [0, 1000],
  },
  longitude: {
    label: "Longitude",
    range: { min: -180, max: 80 },
    badValues: [0, 1000],
  },
  battery: { label: "Battery", range: { min: 2.7, max: 5 } },
  altitude: {
    label: "Altitude",
    range: { min: 0, max: Infinity },
    badValues: [0],
  },
  speed: { label: "Speed", range: { min: 0, max: Infinity }, badValues: [0] },
  satellites: {
    label: "Satellites",
    range: { min: 0, max: 50 },
    badValues: [0],
  },
  hdop: { label: "Hdop", range: { min: 0, max: Infinity }, badValues: [0] },
  internalTemperature: {
    label: "Internal Temperature",
    range: { min: 0, max: 100 },
  },
  externalTemperature: {
    label: "External Temperature",
    range: { min: 0, max: 100 },
  },
  internalHumidity: { label: "Internal Humidity", range: { min: 0, max: 100 } },
  ExternalHumidity: { label: "External Humidity", range: { min: 0, max: 100 } },
  ExternalPressure: { label: "External Pressure", range: { min: 0, max: 100 } },
};

const isValidSensorValue = (sensorValue, sensorValidator) => {
  if (
    sensorValidator.badValues &&
    sensorValidator.badValues.includes(parseFloat(sensorValue))
  ) {
    return false;
  }
  return (
    sensorValidator.range.min <= sensorValue &&
    sensorValue <= sensorValidator.range.max
  );
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
          style={{ textTransform: "lowercase" }}
        >
          run
        </Button>{" "}
        to initiate the test
      </span>
    </div>
  );
};

const RecallDevice = ({ deviceData, handleRecall, open, toggleOpen }) => {
  return (
    <Dialog
      open={open}
      onClose={toggleOpen}
      aria-labelledby="form-dialog-title"
      aria-describedby="form-dialog-description"
      style={{ padding: "20px 10px" }}
    >
      <DialogTitle
        id="form-dialog-title"
        style={{
          textTransform: "uppercase",
          alignContent: "center",
          fontSize: "1.1rem",
        }}
      >
        Recall device
      </DialogTitle>

      <DialogContent>
        Are you sure you want to recall device{" "}
        <strong>{deviceData.name}</strong> from location{" "}
        <strong>{deviceData.locationID}</strong>?
      </DialogContent>

      <DialogActions>
        <Grid
          container
          alignItems="flex-end"
          alignContent="flex-end"
          justify="flex-end"
        >
          <Button variant="contained" onClick={toggleOpen}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleRecall}
            style={{ margin: "0 15px" }}
          >
            Recall device
          </Button>
        </Grid>
      </DialogActions>
    </Dialog>
  );
};

const DeviceRecentFeedView = ({ recentFeed, runReport }) => {
  const classes = useStyles();
  const feedKeys = Object.keys(omit(recentFeed, "isCache", "created_at"));
  const [
    elapsedDurationSeconds,
    elapsedDurationMapper,
  ] = getElapsedDurationMapper(recentFeed.created_at);
  const elapseLimit = 5 * 3600; // 5 hours

  return (
    <div style={{ height: "94%" }}>
      <h4>Sensors</h4>
      {runReport.successfulTestRun && (
        <div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "center",
              width: "100%",
              marginBottom: "30px",
            }}
          >
            <span>
              Device last pushed data{" "}
              <span
                className={
                  elapsedDurationSeconds > elapseLimit
                    ? classes.error
                    : classes.root
                }
              >
                {getFirstNDurations(elapsedDurationMapper, 2)}
              </span>{" "}
              ago.
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              margin: "10px 30px",
              color: elapsedDurationSeconds > elapseLimit ? "grey" : "inherit",
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
                      className={
                        elapsedDurationSeconds > elapseLimit
                          ? classes.grey
                          : classes.root
                      }
                    />
                  </span>
                ) : (
                  <Tooltip arrow title={"Value outside the valid range"}>
                    <span style={{ width: "30%" }}>
                      <CancelIcon className={classes.error} />
                    </span>
                  </Tooltip>
                )}
                <span style={spanStyle}>
                  {(sensorFeedNameMapper[key] &&
                    sensorFeedNameMapper[key].label) ||
                    key}{" "}
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
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "center",
            margin: "10px 30px",
            height: "70%",
            color: "red",
          }}
        >
          <ErrorIcon className={classes.error} /> Can not query device
        </div>
      )}
    </div>
  );
};

export default function DeviceDeployStatus({ deviceData }) {
  const dispatch = useDispatch();
  const [height, setHeight] = useState("");
  const [power, setPower] = useState("");
  const [installationType, setInstallationType] = useState("");
  const [deploymentDate, setDeploymentDate] = useState(new Date());
  const [primaryChecked, setPrimaryChecked] = useState(true);
  const [collocationChecked, setCollocationChecked] = useState(false);
  const [recentFeed, setRecentFeed] = useState({});
  const [runReport, setRunReport] = useState({
    ranTest: false,
    successfulTestRun: false,
  });
  const [deviceTestLoading, setDeviceTestLoading] = useState(false);
  const [manualCoordinate, setManualCoordinate] = useState(false);
  const [longitude, setLongitude] = useState("");
  const [latitude, setLatitude] = useState("");
  const [deployLoading, setDeployLoading] = useState(false);
  const [recallOpen, setRecallOpen] = useState(false);
  const [errors, setErrors] = useState({
    height: "",
    power: "",
    installationType: "",
    longitude: "",
    latitude: "",
  });

  useEffect(() => {
    if (recentFeed.longitude && recentFeed.latitude) {
      setLongitude(recentFeed.longitude);
      setLatitude(recentFeed.latitude);
    }
  }, [recentFeed]);

  const handleHeightChange = (enteredHeight) => {
    let re = /\s*|\d+(\.d+)?/;
    if (re.test(enteredHeight.target.value)) {
      setHeight(enteredHeight.target.value);
      setErrors({
        ...errors,
        height: enteredHeight.target.value.length > 0 ? "" : errors.height,
      });
    }
  };

  const runDeviceTest = async () => {
    setDeviceTestLoading(true);
    await getDeviceRecentFeedByChannelIdApi(deviceData.channelID)
      .then((responseData) => {
        setRecentFeed(responseData);
        setRunReport({ ranTest: true, successfulTestRun: true });
      })
      .catch((err) => {
        setRunReport({ ranTest: true, successfulTestRun: false });
      });
    setDeviceTestLoading(false);
  };

  const checkErrors = () => {
    const state = { height, installationType, power, longitude, latitude };
    let newErrors = {};

    Object.keys(state).map((key) => {
      if (isEmpty(state[key])) {
        newErrors[key] = "This field is required";
      }
    });
    ["longitude", "latitude"].map((key) => {
      if (
        !isValidSensorValue(
          state[key],
          sensorFeedNameMapper[key] || defaultSensorRange
        )
      ) {
        newErrors[key] = `Invalid ${key} value`;
      }
    });
    if (!isEmpty(newErrors)) {
      setErrors({ ...errors, ...newErrors });
      return true;
    }
    return false;
  };

  const handleDeploySubmit = async () => {
    if (checkErrors()) {
      return;
    }
    const deployData = {
      deviceName: deviceData.name,
      mountType: installationType,
      height: height,
      powerType: power,
      date: deploymentDate.toISOString(),
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      isPrimaryInLocation: primaryChecked,
      isUserForCollocaton: collocationChecked,
    };

    setDeployLoading(true);
    await deployDeviceApi(deployData)
      .then((responseData) => {
        dispatch(
          updateMainAlert({
            message: responseData.message,
            show: true,
            severity: "success",
          })
        );
        dispatch(updateDevice(deviceData.id, {isActive: true}));
      })
      .catch((err) => {
        dispatch(
          updateMainAlert({
            message: err.response.data.message,
            show: true,
            severity: "error",
          })
        );
      });
    setDeployLoading(false);
  };

  const handleRecallSubmit = async () => {
    const currentDate = new Date();
    const recallData = {
      deviceName: deviceData.name,
      locationName: deviceData.locationID,
      date: currentDate.toISOString(),
    };

    setRecallOpen(!recallOpen);

    await recallDeviceApi(recallData)
      .then((responseData) => {
        dispatch(
          updateMainAlert({
            message: responseData.message,
            show: true,
            severity: "success",
          })
        );
        dispatch(updateDevice(deviceData.id, {isActive: false}));
      })
      .catch((err) => {
        dispatch(
          updateMainAlert({
            message: err.response.data.message,
            show: true,
            severity: "error",
          })
        );
      });
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
          display: "flex",
          justifyContent: "flex-end",
          margin: "10px 0",
        }}
      >
        <Tooltip
          arrow
          title={"Device is not yet deployed"}
          disableTouchListener={deviceData.isActive}
          disableHoverListener={deviceData.isActive}
          disableFocusListener={deviceData.isActive}
        >
          <span>
            <Button
              variant="contained"
              color="primary"
              disabled={!deviceData.isActive}
              onClick={() => setRecallOpen(!recallOpen)}
            >
              {" "}
              Recall Device
            </Button>
          </span>
        </Tooltip>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "flex-end",
          margin: "0 auto",
          padding: "10px 20px",
          maxWidth: "1500px",
          fontSize: "1.2rem",
        }}
      >
        <span
          style={{
            fontSize: "0.7rem",
            marginRight: "10px",
            background: "#ffffff",
            border: "1px solid #ffffff",
            borderRadius: "5px",
            padding: "0 5px",
          }}
        >
          Deploy status
        </span>{" "}
        {deviceData.isActive ? (
          <span style={{ color: "green" }}>Deployed</span>
        ) : (
          <span style={{ color: "red" }}>Not Deployed</span>
        )}
      </div>

      <RecallDevice
        deviceData={deviceData}
        open={recallOpen}
        toggleOpen={() => setRecallOpen(!recallOpen)}
        handleRecall={handleRecallSubmit}
      />

      <Paper
        style={{
          margin: "0 auto",
          minHeight: "400px",
          padding: "20px 20px",
          maxWidth: "1500px",
        }}
      >
        <Grid container spacing={1}>
          <Grid items xs={6}>
            <TextField
              id="standard-basic"
              label="Device Name"
              disabled
              value={deviceData.name}
              required
              fullWidth
            />

            <TextField
              id="standard-basic"
              label="Height"
              value={height}
              onChange={handleHeightChange}
              fullWidth
              required
              error={!!errors.height}
              helperText={errors.height}
            />

            <FormControl required fullWidth error={!!errors.power}>
              <InputLabel htmlFor="demo-dialog-native">Power Type</InputLabel>
              <Select
                native
                required
                value={power}
                onChange={(event) => {
                  setPower(event.target.value);
                  setErrors({
                    ...errors,
                    power: event.target.value.length > 0 ? "" : errors.power,
                  });
                }}
                inputProps={{
                  native: true,
                  style: { height: "40px", marginTop: "10px" },
                }}
                input={<Input id="demo-dialog-native" />}
              >
                <option aria-label="None" value="" />
                <option value="Mains">Mains</option>
                <option value="Solar">Solar</option>
                <option value="Battery">Battery</option>
              </Select>
            </FormControl>
            {errors.power && <div style={errorStyles}>{errors.power}</div>}

            <TextField
              id="standard-basic"
              label="Mount Type"
              required
              value={installationType}
              error={!!errors.installationType}
              helperText={errors.installationType}
              onChange={(event) => {
                setInstallationType(event.target.value);
                setErrors({
                  ...errors,
                  installationType:
                    event.target.value.length > 0
                      ? ""
                      : errors.installationType,
                });
              }}
              fullWidth
            />

            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <KeyboardDatePicker
                fullWidth
                disableToolbar
                format="yyyy-MM-dd"
                id="deploymentDate"
                label="Date of Deployment"
                value={deploymentDate}
                onChange={(date) => setDeploymentDate(date)}
                required
                KeyboardButtonProps={{
                  "aria-label": "change date",
                }}
              />
            </MuiPickersUtilsProvider>

            <TextField
              id="standard-basic"
              label="Longitude"
              disabled={!manualCoordinate}
              value={longitude}
              onChange={(event) => {
                setLongitude(event.target.value);
                setErrors({
                  ...errors,
                  longitude:
                    event.target.value.length > 0 ? "" : errors.longitude,
                });
              }}
              fullWidth
              error={!!errors.longitude}
              helperText={errors.longitude}
              required
            />

            <TextField
              id="standard-basic"
              label="Latitude"
              disabled={!manualCoordinate}
              value={latitude}
              onChange={(event) => {
                setLatitude(event.target.value);
                setErrors({
                  ...errors,
                  latitude:
                    event.target.value.length > 0 ? "" : errors.latitude,
                });
              }}
              fullWidth
              error={!!errors.latitude}
              helperText={errors.latitude}
              required
            />
            <span
              style={coordinatesActivateStyles}
              onClick={(event) => setManualCoordinate(!manualCoordinate)}
            >
              Manually fill in coordinates
              <Checkbox
                checked={manualCoordinate}
                name="primaryDevice"
                color="primary"
              />
            </span>

            <div style={{ margin: "30px 0 20px 0" }}>
              <Grid container item xs={12} spacing={3}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={primaryChecked}
                      onChange={(event) => setPrimaryChecked(!primaryChecked)}
                      name="primaryDevice"
                      color="primary"
                    />
                  }
                  label="I wish to make this my primary device in this location"
                  style={{ margin: "10px 0 0 5px", width: "100%" }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={collocationChecked}
                      onChange={(event) =>
                        setCollocationChecked(!collocationChecked)
                      }
                      name="collocation"
                      color="primary"
                    />
                  }
                  label="This deployment is a formal collocation"
                  style={{ marginLeft: "5px" }}
                />
              </Grid>{" "}
            </div>
          </Grid>
          <Grid item xs={6}>
            <Grid
              container
              alignItems="flex-end"
              alignContent="flex-end"
              justify="flex-end"
            >
              <Button
                color="primary"
                disabled={deviceTestLoading}
                onClick={runDeviceTest}
                style={{ marginLeft: "10px 10px" }}
              >
                Run device test
              </Button>
            </Grid>
            {isEmpty(recentFeed) && !runReport.ranTest ? (
              <EmptyDeviceTest
                loading={deviceTestLoading}
                onClick={runDeviceTest}
              />
            ) : (
              <DeviceRecentFeedView
                recentFeed={recentFeed}
                runReport={runReport}
              />
            )}
          </Grid>

          <Grid
            container
            alignItems="flex-end"
            alignContent="flex-end"
            justify="flex-end"
            xs={12}
          >
            <Button variant="contained">Cancel</Button>
            <Tooltip
              arrow
              title={
                deviceData.isActive
                  ? "Device already deployed"
                  : "Run device test to activate"
              }
              placement="top"
              disableFocusListener={
                runReport.successfulTestRun && !deviceData.isActive
              }
              disableHoverListener={
                runReport.successfulTestRun && !deviceData.isActive
              }
              disableTouchListener={
                runReport.successfulTestRun && !deviceData.isActive
              }
            >
              <span>
                <Button
                  variant="contained"
                  color="primary"
                  disabled={weightedBool(
                    deployLoading,
                    deviceData.isActive || !runReport.successfulTestRun
                  )}
                  onClick={handleDeploySubmit}
                  style={{ marginLeft: "10px" }}
                >
                  Deploy
                </Button>
              </span>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
}
