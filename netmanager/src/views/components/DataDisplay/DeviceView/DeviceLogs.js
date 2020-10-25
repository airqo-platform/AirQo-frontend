import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { isEmpty } from "underscore";
import {
    Button,
    Grid,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableRow
} from "@material-ui/core";
import CardHeader from "../../Card/CardHeader";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import Input from "@material-ui/core/Input";
import MenuItem from "@material-ui/core/MenuItem";
import Checkbox from "@material-ui/core/Checkbox";
import ListItemText from "@material-ui/core/ListItemText";
import {KeyboardDatePicker, MuiPickersUtilsProvider} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import MaintenanceLogsTable from "./Table";
import { loadDeviceMaintenanceLogs } from "redux/DeviceRegistry/operations";
import { useDeviceLogsData } from "redux/DeviceRegistry/selectors";
import { addMaintenanceLogApi } from "../../../apis/deviceRegistry";

const logsColumns = [
    { title: "Activity Type", field: "activityType"},
    { title: "Description", field: "description"},
    { title: "Next Maintenance", field: "nextMaintenance"},
]

const titleStyles = {
    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
}

const wrapperStyles = {
    display: "flex",
    justifyContent: "space-between",
}

const TableTitle = ({ deviceName }) => {
    return (
        <div style={titleStyles}>
            Maintenance logs for <strong>{deviceName || ""}</strong>
        </div>
    )
}

const LogDetailView = ({ log }) => {

    return (
        <div>
            <TableContainer component={Paper} >
                <CardHeader >
                  <h4>Log Details</h4>
                </CardHeader>
                 <Table stickyHeader  aria-label="sticky table" alignItems="left" alignContent="left">
                   <TableBody style = {{alignContent:"left", alignItems:"left"}} >
                     <TableRow style={{ align: 'left' }} >
                       <TableCell><b>Activity Type</b></TableCell>
                       <TableCell>{log.activityType}</TableCell>
                     </TableRow>
                     <TableRow>
                       <TableCell ><b>Description</b></TableCell>
                       <TableCell >{log.description}</TableCell>
                     </TableRow>
                     <TableRow>
                       <TableCell><b>Location</b></TableCell>
                       <TableCell>{log.location}</TableCell>
                     </TableRow>
                     <TableRow>
                      <TableCell><b>Next Maintenance</b></TableCell>
                      <TableCell>{log.nextMaintenance}</TableCell>
                     </TableRow>
                     <TableRow>
                       <TableCell><b>Updated At</b></TableCell>
                       <TableCell>{log.updatedAt}</TableCell>
                     </TableRow>
                     <TableRow>
                       <TableCell><b>Created At</b></TableCell>
                       <TableCell>{log.createdAt}</TableCell>
                     </TableRow>
                   </TableBody>
                </Table>
            </TableContainer>
        </div>
    )
}

const AddLogForm = ({ deviceName, deviceLocation }) => {

    const [maintenanceType, setMaintenanceType] = useState("")
    const [maintenanceDescription, setMaintenanceDescription] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());

    const handleMaintenanceTypeChange = (event) => {
        setMaintenanceType(event.target.value);
        if (event.target.value === "preventive") {
          setMaintenanceDescription([
            "Dust blowing and sensor cleaning",
            "Site update check",
            "Device equipment check",
          ]);
        } else {
          setMaintenanceDescription([]);
        }
    };

    const maintenanceOptions = [
        "Dust blowing and sensor cleaning",
        "Site update check",
        "Device equipment check",
        "Power circuitry and components works",
        "GPS module works/replacement",
        "GSM module works/replacement",
        "Battery works/replacement",
        "Power supply works/replacement",
        "Antenna works/replacement",
        "Mounts replacement",
        "Software checks/re-installation",
        "PCB works/replacement",
        "Temp/humidity sensor works/replacement",
        "Air quality sensor(s) works/replacement",
    ];

    const ITEM_HEIGHT = 48;
    const ITEM_PADDING_TOP = 8;

    const MenuProps = {
        PaperProps: {
          style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 350,
          },
        },
    };

    const handleSubmit = (evt) => {
        evt.preventDefault();
        const logData = {
            deviceName,
            locationName: deviceLocation,
            date: selectedDate,
            tags: maintenanceDescription,
            description: maintenanceType,
        }
        console.log('log data', logData)
        addMaintenanceLogApi(logData)
            .then(responseData => {
                console.log('responseData', responseData)
            })
            .catch(err => {
                console.log('err', err)
            });
    }

    return (
        <Paper style={{ minHeight: "400px", padding: "5px 10px"}}>
            <h4>Add Log</h4>
            <form >
                  <TextField
                    id="deviceName"
                    label="Device Name"
                    value={deviceName}
                    fullWidth
                    disabled
                  />
                  <FormControl
                    required
                    fullWidth
                  >
                    <InputLabel htmlFor="demo-dialog-native">
                      Type of Maintenance
                    </InputLabel>
                    <Select
                      native
                      value={maintenanceType}
                      onChange={handleMaintenanceTypeChange}
                      inputProps={{
                        native: true,
                        style: {height: "40px", marginTop: "10px"},
                      }}
                      input={<Input id="demo-dialog-native" />}
                    >
                      <option aria-label="None" value="" />
                      <option value="preventive">Preventive</option>
                      <option value="corrective">Corrective</option>
                    </Select>
                  </FormControl>
                  <br />
                  <FormControl
                    required
                    className
                    fullWidth
                  >
                    <InputLabel htmlFor="demo-dialog-native">
                      Description of Activities
                    </InputLabel>
                    <Select
                      multiple
                      value={maintenanceDescription}
                      onChange={(evt) => setMaintenanceDescription(evt.target.value)}
                      input={<Input style={{height: "50px", marginTop: "10px"}}/>}
                      renderValue={(selected) => selected.join(", ")}
                      MenuProps={MenuProps}
                    >
                      <option aria-label="None" value="" />
                      {maintenanceOptions.map((name) => (
                        <MenuItem key={name} value={name}>
                          <Checkbox
                            checked={maintenanceDescription.indexOf(name) > -1}
                          />
                          <ListItemText primary={name} />
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <MuiPickersUtilsProvider utils={DateFnsUtils} fullWidth={true}>
                    <KeyboardDatePicker
                      fullWidth={true}
                      disableToolbar
                      variant="inline"
                      format="yyyy-MM-dd"
                      margin="normal"
                      id="maintenanceDate"
                      label="Date of Maintenance"
                      value={selectedDate}
                      onChange={date => setSelectedDate(date)}
                      KeyboardButtonProps={{
                        "aria-label": "change date",
                      }}
                    />
                  </MuiPickersUtilsProvider>

                <Grid
                  container
                  alignItems="flex-end"
                  alignContent="flex-end"
                  justify="flex-end"
                >
                  <Button
                    variant="contained"
                    // onClick={handleMaintenanceClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    style={{ marginLeft: "10px" }}
                  >
                    Add
                  </Button>
                </Grid>
                </form>
            </Paper>
    )
}


export default function DeviceLogs({ deviceName, deviceLocation }) {

    const dispatch = useDispatch();
    const [selectedRow, setSelectedRow] = useState(0);
    const [addLog, setAddLog] = useState(false);
    const maintenanceLogs = useDeviceLogsData(deviceName);

    useEffect(() => {
        if(isEmpty(maintenanceLogs)) {
            if (typeof deviceName !== "undefined") {
                dispatch(loadDeviceMaintenanceLogs(deviceName))
            }
        }
    })

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
                  onClick={(evt => {setAddLog(true)})}
                 > Add Log
                </Button>
            </div>
            <div style={wrapperStyles}>
                <MaintenanceLogsTable
                    style={{width: "62%"}}
                    title={<TableTitle deviceName={deviceName} />}
                    columns={logsColumns}
                    data={maintenanceLogs}
                    onRowClick={((evt, selectedRow) => {
                        setAddLog(false);
                        setSelectedRow(selectedRow.tableData.id)
                    })}
                    options={{
                        rowStyle: rowData => ({
                            backgroundColor: (selectedRow === rowData.tableData.id) ? '#EEE' : '#FFF'
                        })
                    }}
                />
                <div style={{width: "35%"}}>
                    { addLog ?
                        <AddLogForm deviceName={deviceName} deviceLocation={deviceLocation} />
                        :
                        <LogDetailView log={maintenanceLogs[selectedRow] || {}} />
                    }


                </div>
            </div>
        </>
    )
}
