import React, { useState } from 'react';
import { Button, Grid, Paper, TextField } from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import Input from "@material-ui/core/Input";
import { KeyboardDatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import CheckBoxIcon from '@material-ui/icons/CheckBox';
import DateFnsUtils from "@date-io/date-fns";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import green from '@material-ui/core/colors/green';
import { makeStyles } from "@material-ui/styles";
import { isEmpty, omit } from "underscore";
import { getDeviceRecentFeedByChannelIdApi } from "../../../apis/deviceRegistry";


const useStyles = makeStyles(theme => ({
    root: {
        color: green[500],
    }
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

const sensorFeedNameMapper = {
    pm2_5: "PM 2.5",
    pm10: "PM 10",
    s2_pm2_5: "Sensor-2 PM 2.5",
    s2_pm10: "Sensor-2 PM 10",
    latitude: "Latitude",
    longitude: "Longitude",
    battery: "Battery",
    altitude: "Altitude",
    speed: "Speed",
    satellites: "Satellites",
    hdop: "Hdop",
    internalTemperature: "Internal Temp",
    internalHumidity: "Internal Humidity",
}

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


const DeviceRecentFeedView = ({ recentFeed }) => {
    const classes = useStyles();
    const feedKeys = Object.keys(omit(recentFeed, "isCache", "created_at"));

    return (
        <div>
            <h4>Sensors</h4>
            <div style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                margin: "10px 30px",
            }}>
                {feedKeys.map(key => (
                    <div style={senorListStyle}>
                        <span style={{width: "30%"}}><CheckBoxIcon className={classes.root} /></span>
                        <span style={{width: "30%"}}>{sensorFeedNameMapper[key]} </span>
                        <span style={{width: "30%"}}>{recentFeed[key]}</span>
                    </div>
                ))}

            </div>
        </div>
    );
}


export default function DeviceDeployStatus({ deviceData }) {

    const [height, setHeight] = useState("");
    const [power, setPower] = useState("");
    const [installationType, setInstallationType] = useState("");
    const [deploymentDate, setDeploymentDate] = useState(new Date());
    const [primaryChecked, setPrimaryChecked] = useState(true);
    const [collocationChecked, setCollocationChecked] = useState(false);
    const [recentFeed, setRecentFeed] = useState({});
    const [deviceTestLoading, setDeviceTestLoading] = useState(false);
    // const [locationID, setLocationID] = useState("");

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
            })
            .catch(err => err);
        setDeviceTestLoading(false);
    }

    return (
        <>
            <div
                style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    margin: "10px 0",
                }}
            >
                <Button
                  variant="contained"
                  color="primary"
                 > Recall Device
                </Button>
            </div>
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
                          label="Installation Type"
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
                        value={height}
                        onChange={handleHeightChange}
                        fullWidth
                      />

                      <TextField
                        id="standard-basic"
                        label="Latitude"
                        value={height}
                        onChange={handleHeightChange}
                        fullWidth
                      />


                      <div style={{ margin: "10px 0" }}>
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
                        {isEmpty(recentFeed)
                            ?
                            <EmptyDeviceTest loading={deviceTestLoading} onClick={runDeviceTest} />
                            :
                            <DeviceRecentFeedView recentFeed={recentFeed} />
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
                            // onClick={toggleShow}
                          >
                            Cancel
                          </Button>
                          <Button
                              // disabled={loading}
                            variant="contained"
                            color="primary"
                            // onClick={handleSubmit}
                            style={{ marginLeft: "10px" }}
                          >
                            Deploy
                          </Button>
                      </Grid>


                </Grid>
            </Paper>
        </>
    )
}
