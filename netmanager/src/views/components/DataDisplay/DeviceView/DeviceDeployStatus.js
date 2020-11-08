import React, { useState, useEffect } from 'react';
import { useDispatch } from "react-redux";
import {Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, Paper, TextField} from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import Input from "@material-ui/core/Input";
import { KeyboardDatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import Tooltip from "@material-ui/core/Tooltip"
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import CancelIcon from '@material-ui/icons/Cancel';
import ErrorIcon from '@material-ui/icons/Error';
import DateFnsUtils from "@date-io/date-fns";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import green from '@material-ui/core/colors/green';
import red from '@material-ui/core/colors/red';
import { makeStyles } from "@material-ui/styles";
import { isEmpty, omit } from "underscore";
import { deployDeviceApi, getDeviceRecentFeedByChannelIdApi, recallDeviceApi } from "../../../apis/deviceRegistry";
import { updateMainAlert } from "redux/MainAlert/operations";


const useStyles = makeStyles(theme => ({
    root: {
        color: green[500],
    },
    error: {
        color: red[500],
    },
}))


const emptyTestStyles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "93%",
}

const senorListStyle = {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-around",
    width: "100%"
}

const coordinatesActivateStyles = {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    fontSize: ".8rem"
}

const defaultSensorRange = {min: Infinity, max: Infinity};

const sensorFeedNameMapper = {
    pm2_5: { label: "PM 2.5", range: {min: 1, max: 1000} },
    pm10: { label: "PM 10", range: {min: 1, max: 1000} },
    s2_pm2_5: { label: "Sensor-2 PM 2.5", range: {min: 1, max: 1000} },
    s2_pm10: { label: "Sensor-2 PM 10", range: {min: 1, max: 1000} },
    latitude: { label: "Latitude", range: {min: -90, max: 90} },
    longitude: { label: "Longitude", range: {min: -180, max: 80} },
    battery: { label: "Battery", range: {min: 2.7, max: 5} },
    altitude: { label: "Altitude", range: {min: 1, max: Infinity} },
    speed: { label: "Speed", range: {min: 1, max: Infinity} },
    satellites: { label: "Satellites", range: {min: 1, max: 50} },
    hdop: { label: "Hdop", range: {min: 1, max: Infinity} },
    internalTemperature: { label: "Internal Temperature", range: {min: 1, max: 100} },
    externalTemperature: { label: "External Temperature", range: {min: 1, max: 100} },
    internalHumidity: { label: "Internal Humidity", range: {min: 1, max: 100} },
    ExternalHumidity: { label: "External Humidity", range: {min: 1, max: 100} },
    ExternalPressure: { label: "External Pressure", range: {min: 1, max: 100} },
}


const isValidSensorValue = (sensorValue, range) => {
    return range.min - 1 <= sensorValue && sensorValue <= range.max;

};

const EmptyDeviceTest = ({loading, onClick}) => {
    return (
        <div style={emptyTestStyles}>
            <span>No devices test results, please click
                <Button
                    color="primary"
                    disabled={loading}
                    onClick={onClick}
                    style={{textTransform: "lowercase"}}
                >
                    run
                </Button> to initiate the test
            </span>
        </div>
    );
};


const RecallDevice = ({deviceData, handleRecall, open, toggleOpen}) => {
    return (
        <Dialog
          open={open}
          onClose={toggleOpen}
          aria-labelledby="form-dialog-title"
          aria-describedby="form-dialog-description"
          style={{padding: "20px 10px"}}
        >
          <DialogTitle
            id="form-dialog-title"
            style={{ textTransform: "uppercase", alignContent: "center", fontSize: "1.1rem" }}
          >
            Recall device
          </DialogTitle>

          <DialogContent>
            Are you sure you want to recall device <strong>{deviceData.name}</strong> from location{" "}
            <strong>{deviceData.locationID}</strong>?
          </DialogContent>

          <DialogActions>
            <Grid
              container
              alignItems="flex-end"
              alignContent="flex-end"
              justify="flex-end"
            >
              <Button
                variant="contained"
                onClick={toggleOpen}
              >
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

    return (
        <div style={{height: "94%"}}>
            <h4>Sensors</h4>
            { runReport.successfulTestRun &&
                <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    margin: "10px 30px",
                }}>
                    {feedKeys.map(key => (
                        <div style={senorListStyle}>
                            {isValidSensorValue(
                                recentFeed[key],
                                sensorFeedNameMapper[key] && sensorFeedNameMapper[key].range || defaultSensorRange
                            )
                                ?
                                <span style={{width: "30%"}}><CheckBoxIcon className={classes.root}/></span>
                                :
                                <Tooltip title={"Value outside the valid range"} >
                                    <span style={{width: "30%"}}><CancelIcon className={classes.error}/></span>
                                </Tooltip>

                            }
                            <span style={{width: "30%"}}>{sensorFeedNameMapper[key] && sensorFeedNameMapper[key].label || key} </span>
                            <span style={{width: "30%"}}>{recentFeed[key]}</span>
                        </div>
                    ))}

                </div>
            }
            { !runReport.successfulTestRun &&
                <div style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "10px 30px",
                    height: "70%",
                    color: "red",
                }}>
                    <ErrorIcon className={classes.error}/> Can not query device
                </div>
            }
        </div>
    );
}


export default function DeviceDeployStatus({ deviceData }) {

    const dispatch = useDispatch();
    const [height, setHeight] = useState("");
    const [power, setPower] = useState("");
    const [installationType, setInstallationType] = useState("");
    const [deploymentDate, setDeploymentDate] = useState(new Date());
    const [primaryChecked, setPrimaryChecked] = useState(true);
    const [collocationChecked, setCollocationChecked] = useState(false);
    const [recentFeed, setRecentFeed] = useState({});
    const [runReport, setRunReport] = useState({ranTest: false, successfulTestRun: false});
    const [deviceTestLoading, setDeviceTestLoading] = useState(false);
    const [manualCoordinate, setManualCoordinate] = useState(false);
    const [longitude, setLongitude] = useState("");
    const [latitude, setLatitude] = useState("");
    const [deployLoading, setDeployLoading] = useState(false);
    const [recallOpen, setRecallOpen] = useState(false);

    useEffect(() => {
        if (recentFeed.longitude && recentFeed.latitude) {
            setLongitude(recentFeed.longitude);
            setLatitude(recentFeed.latitude);
        }
    }, [recentFeed])

    const handleHeightChange = (enteredHeight) => {
        let re = /\s*|\d+(\.d+)?/;
        if (re.test(enteredHeight.target.value)) {
          setHeight(enteredHeight.target.value);
        }
    };

    const runDeviceTest = async () => {
        setDeviceTestLoading(true);
        await getDeviceRecentFeedByChannelIdApi(deviceData.channelID)
            .then(responseData => {
                setRecentFeed(responseData);
                setRunReport({ranTest: true, successfulTestRun: true});
            })
            .catch(err => {
               setRunReport({ranTest: true, successfulTestRun: false});
            });
        setDeviceTestLoading(false);
    }

    const handleDeploySubmit = async () => {
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
            .then(responseData => {
                dispatch(updateMainAlert({
                   message: responseData.message,
                   show: true,
                   severity: "success",
                }));
            })
            .catch(err => {
                dispatch(updateMainAlert({
                   message: err.response.data.message,
                   show: true,
                   severity: "error",
                }));
            });
        setDeployLoading(false);
    }

    const handleRecallSubmit = async () => {
        const currentDate = new Date();
        const recallData = {
            deviceName: deviceData.name,
            locationName: deviceData.locationID,
            date: currentDate.toISOString(),
        };

        setRecallOpen(!recallOpen);

        await recallDeviceApi(recallData)
            .then(responseData => {
                dispatch(updateMainAlert({
                   message: responseData.message,
                   show: true,
                   severity: "success",
                }));
            })
            .catch(err => {
                dispatch(updateMainAlert({
                   message: err.response.data.message,
                   show: true,
                   severity: "error",
                }));
            })
    }

    const weightedBool = (primary, secondary) => {
        if (primary) {
            return primary;
        }
        return secondary;
    }

    console.log("device data", deviceData);

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
                         > Recall Device
                        </Button>
                    </span>
                </Tooltip>
            </div>

            <RecallDevice
                deviceData={deviceData}
                open={recallOpen}
                toggleOpen={() => setRecallOpen(!recallOpen)}
                handleRecall={handleRecallSubmit}
            />

            <Paper style={{ margin: "0 auto", minHeight: "400px", padding: "20px 20px", maxWidth: "1500px"}}>
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
                      />

                      <FormControl fullWidth>
                        <InputLabel htmlFor="demo-dialog-native">
                          Power Type
                        </InputLabel>
                        <Select
                          native
                          value={power}
                          onChange={event => setPower(event.target.value)}
                          inputProps={{
                            native: true,
                            style: {height: "40px", marginTop: "10px"},
                          }}
                          input={<Input id="demo-dialog-native" />}
                        >
                          <option aria-label="None" value="" />
                          <option value="Mains">Mains</option>
                          <option value="Solar">Solar</option>
                          <option value="Battery">Battery</option>
                        </Select>
                      </FormControl>

                      <TextField
                          id="standard-basic"
                          label="Mount Type"
                          value={installationType}
                          onChange={event => setInstallationType(event.target .value)}
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
                            onChange={date => setDeploymentDate(date)}
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
                        onChange={event => setLongitude(event.target.value)}
                        fullWidth
                        required
                      />

                      <TextField
                        id="standard-basic"
                        label="Latitude"
                        disabled={!manualCoordinate}
                        value={latitude}
                        onChange={event => setLatitude(event.target.value)}
                        fullWidth
                        required
                      />
                      <span
                          style={coordinatesActivateStyles}
                          onClick={event => setManualCoordinate(!manualCoordinate)}
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
                                onChange={event => setPrimaryChecked(!primaryChecked)}
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
                                onChange={event => setCollocationChecked(!collocationChecked)}
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
                        {isEmpty(recentFeed) && !runReport.ranTest
                            ?
                            <EmptyDeviceTest loading={deviceTestLoading} onClick={runDeviceTest} />
                            :
                            <DeviceRecentFeedView recentFeed={recentFeed} runReport={runReport} />
                        }

                    </Grid>

                      <Grid
                      container
                      alignItems="flex-end"
                      alignContent="flex-end"
                      justify="flex-end"
                      xs={12}
                      >

                              <Button
                                variant="contained"
                              >
                                Cancel
                              </Button>
                          <Tooltip
                              title={deviceData.isActive ? "Device already deployed" : "Run device test to activate" }
                              placement="top"
                              disableFocusListener={runReport.successfulTestRun && !deviceData.isActive}
                              disableHoverListener={runReport.successfulTestRun && !deviceData.isActive}
                              disableTouchListener={runReport.successfulTestRun && !deviceData.isActive}
                          >
                              <span>
                                  <Button
                                    variant="contained"
                                    color="primary"
                                    disabled={
                                        weightedBool(
                                            deployLoading,
                                            deviceData.isActive || !runReport.successfulTestRun
                                        )
                                    }
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
    )
}
