import React, { useEffect, useState } from "react";
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
import DeviceComponentsTable from "./Table";
import { useDispatch } from "react-redux";
import {isEmpty} from "underscore";
import { useDeviceComponentsData } from "redux/DeviceRegistry/selectors";
import { loadDeviceComponentsData } from "redux/DeviceRegistry/operations";
import CardHeader from "../../Card/CardHeader";
import TextField from "@material-ui/core/TextField";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Select from "@material-ui/core/Select";
import Input from "@material-ui/core/Input";
import MenuItem from "@material-ui/core/MenuItem";
import Checkbox from "@material-ui/core/Checkbox";
import ListItemText from "@material-ui/core/ListItemText";
import { makeStyles } from "@material-ui/styles";
import { createDeviceComponentApi } from "../../../apis/deviceRegistry";


const useStyles = makeStyles(theme => ({
    fieldMargin: {
        margin: "20px 0"
    },
}))

const wrapperStyles = {
    display: "flex",
    justifyContent: "space-between",
}

const componentColumns = [
    { title: "Name", field: "name"},
    { title: "Description", field: "description"},
    {
        title: "Measurement(s)",
        field: "measurement",
        render: (rowData) => {
            let measurement = "";
            rowData.measurement.map(val => {
                measurement += `${val.quantityKind}(${val.measurementUnit}), `
            });
            return measurement;
        },
    },
]

const TableTitle = ({ deviceName }) => {
    return (
        <div>
            Components for <strong>{deviceName || ""}</strong>
        </div>
    )
}

const AddDeviceComponent = ({ deviceName, toggleShow }) => {
    const classes = useStyles();
    const [componentType, setComponentType] = useState("")
    const [sensorName, setSensorName] = useState("");
    const [quantityKind, setQuantityKind] = useState([]);

    const sensorNameMapper = {
        "Alphasense OPC-N2": ["PM 1(µg/m3)", "PM 2.5(µg/m3)", "PM 10(µg/m3)"],
        "pms5003": ["PM 2.5(µg/m3)", "PM 10(µg/m3)"],
        "DHT11": ["Internal Temperature(\xB0C)", "Internal Humidity(%)"],
        "Lithium Ion 18650": ["Battery Voltage(V)"],
        "Generic": ["GPS"],
        "Purple Air II": ["PM 1(µg/m3)"],
        "Bosch BME280": ["External Temperature(\xB0C)", "External Humidity(%)"],
    }

    const quantityOptions = [
        "PM 1(µg/m3)",
        "PM 2.5(µg/m3)",
        "PM 10(µg/m3)",
        "External Temperature(\xB0C)",
        "External Temperature(\xB0F)",
        "External Humidity(%)",
        "Internal Temperature(\xB0C)",
        "Internal Humidity(%)",
        "Battery Voltage(V)",
        "GPS",
    ];

    const handleSensorNameChange = (event) => {
        setSensorName(event.target.value);
        setQuantityKind(sensorNameMapper[event.target.value] || [])
    }

    const handleComponentTypeChange = (e) => {
        setComponentType(e.target.value)
    }

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

    const convertQuantityOptions = (quantityKind) => {
        const modifiedQuantity = []
        quantityKind.map(quantity => {
            if (typeof quantity === "string") {
                const newQuantity = quantity.replace(")", "");
                const newQuantityArr = newQuantity.split("(");
                if (newQuantityArr.length >= 2) {
                   modifiedQuantity.push({
                       quantityKind: newQuantityArr[0],
                       measurementUnit: newQuantityArr[1],
                   })
                } else {
                   modifiedQuantity.push({
                       quantityKind: "unknown",
                       measurementUnit: "unknown",
                   })
                }
            }
        })
        return modifiedQuantity
    }

    const handleSubmit = (e) => {
        let filter = {
          description: sensorName, //e.g. pms5003
          measurement: convertQuantityOptions(quantityKind), //e.g. [{"quantityKind":"humidity", "measurementUnit":"%"}]
        };

        createDeviceComponentApi(deviceName, componentType, filter)
            .then(responseData => {
              console.log(responseData.message);

            })
            .catch(error => {
              console.log(error.response.data);

            })
    };

    return (
        <Paper style={{ minHeight: "400px", padding: "5px 10px"}}>
            <h4>Add Component</h4>
             <div>
              <div className={classes.fieldMargin}>
                <TextField
                  fullWidth
                  id="deviceName"
                  label="Device Name"
                  margin="dense"
                  required
                  value={deviceName}
                  disabled
                  variant="standard"
                />
              </div>

              <div className={classes.fieldMargin}>
                <FormControl required fullWidth>
                <InputLabel shrink htmlFor="demo-dialog-native-1">
                  Component Type
                </InputLabel>
                <Select
                  native
                  value={componentType}
                  onChange={handleComponentTypeChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    name: "Component Type",
                    id: "demo-dialog-native-1",
                    styles: "border: 1px solid green !important"
                  }}
                >
                  <option aria-label="None" value="" />
                  <option value="pm2_5">PM 2.5</option>
                  <option value="pm10">PM 10</option>
                  <option value="s2_pm2_5">Sensor 2 PM 2.5</option>
                  <option value="s2_pm10">Sensor 2 PM 10</option>
                  <option value="temperature">Temperature</option>
                  <option value="battery">Battery</option>
                  <option value="humidity">Humidity</option>
                </Select>
              </FormControl>
              </div>

              <div className={classes.fieldMargin}>
                <FormControl required fullWidth>
                <InputLabel shrink htmlFor="demo-dialog-native-1">
                  Component Name
                </InputLabel>
                <Select
                  native
                  value={sensorName}
                  onChange={handleSensorNameChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    name: "Component Name",
                    id: "demo-dialog-native-1",
                    styles: "border: 1px solid green !important"
                  }}
                >
                  <option aria-label="None" value="" />
                  <option value="Alphasense OPC-N2">Alphasense OPC-N2</option>
                  <option value="pms5003">pms5003</option>
                  <option value="DHT11">DHT11</option>
                  <option value="Lithium Ion 18650">Lithium Ion 18650</option>
                  <option value="Generic">Generic</option>
                  <option value="Purple Air II">Purple Air II</option>
                  <option value="Bosch BME280">Bosch BME280</option>
                </Select>
              </FormControl>
              </div>

              <div>
                 <FormControl
                    required
                    fullWidth
                  >
                <InputLabel shrink htmlFor="demo-dialog-native">
                  Quantity Measured
                </InputLabel>
                <Select
                  multiple
                  value={quantityKind}
                  onChange={event => setQuantityKind(event.target.value)}
                  input={<Input />}
                  renderValue={(selected) => selected.join(", ")}
                  MenuProps={MenuProps}
                >
                  <option aria-label="None" value="" />
                  {quantityOptions.map((quantity) => (
                    <MenuItem key={quantity} value={quantity}>
                      <Checkbox checked={quantityKind.indexOf(quantity) > -1} />
                      <ListItemText primary={quantity} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              </div>

            </div>

            <Grid
                  container
                  alignItems="flex-end"
                  alignContent="flex-end"
                  justify="flex-end"
                  style={{marginTop: "30px"}}
                >
                  <Button
                    variant="contained"
                    onClick={toggleShow}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    style={{ marginLeft: "10px" }}
                  >
                    Add Component
                  </Button>
            </Grid>
        </Paper>
    )
}

const ComponentDetailView = ({ component }) => {

    return (
        <div>
            <TableContainer component={Paper} >
                <CardHeader >
                  <h4>Component Details</h4>
                </CardHeader>
                 <Table stickyHeader  aria-label="sticky table" alignItems="left" alignContent="left">
                   <TableBody style = {{alignContent:"left", alignItems:"left"}} >
                     <TableRow style={{ align: 'left' }} >
                       <TableCell><b>Name</b></TableCell>
                       <TableCell>{component.name}</TableCell>
                     </TableRow>
                     <TableRow>
                       <TableCell ><b>Description</b></TableCell>
                       <TableCell >{component.description}</TableCell>
                     </TableRow>
                     <TableRow>
                       <TableCell><b>Measurement(s)</b></TableCell>
                       <TableCell>
                           <ul style={{listStyle: "square inside none"}}>
                               {component.measurement && component.measurement.map((val, key) => {
                                   return <li key={key}>- {`${val.quantityKind}(${val.measurementUnit})`}</li>
                               })}
                           </ul>
                       </TableCell>
                     </TableRow>
                     <TableRow>
                      <TableCell><b>Date Created</b></TableCell>
                      <TableCell>{component.createdAt}</TableCell>
                     </TableRow>
                     <TableRow>
                       <TableCell><b>Calibration</b></TableCell>
                       <TableCell>
                           <b>Max Value(s)</b>
                           <br/>Sensor value: {component.calibration && component.calibration.valueMax.sensorValue}
                           <br/>Real value: {component.calibration && component.calibration.valueMax.sensorValue}
                           <br/>
                           <br/><b>Min Value(s)</b>
                           <br/>Sensor value: {component.calibration && component.calibration.valueMin.sensorValue}
                           <br/>Real value: {component.calibration && component.calibration.valueMin.sensorValue}
                       </TableCell>
                     </TableRow>
                   </TableBody>
                </Table>
            </TableContainer>
        </div>
    )
}


export default function DeviceComponents({ deviceName }) {

    const dispatch = useDispatch();
    const [selectedRow, setSelectedRow] = useState(0);
    const [addComponent, setAddComponent] = useState(false);
    const deviceComponents = useDeviceComponentsData(deviceName);

    useEffect(() => {
        if(isEmpty(deviceComponents)) {
            if (typeof deviceName !== "undefined") {
                dispatch(loadDeviceComponentsData(deviceName))
            }
        }
    }, [])
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
                  onClick={(evt => {setAddComponent(true)})}
                 > Add Component
                </Button>
            </div>
            <div style={wrapperStyles}>
                <DeviceComponentsTable
                    style={{width: "62%"}}
                    title={<TableTitle deviceName={deviceName} />}
                    columns={componentColumns}
                    data={deviceComponents}
                    onRowClick={((evt, selectedRow) => {
                        setAddComponent(false);
                        setSelectedRow(selectedRow.tableData.id)
                    })}
                    options={{
                        pageSize: 10,
                        rowStyle: rowData => ({
                            backgroundColor: (selectedRow === rowData.tableData.id) ? '#EEE' : '#FFF'
                        })
                    }}
                />
                <div style={{width: "35%"}}>
                    {addComponent ?
                        <AddDeviceComponent
                            deviceName={deviceName}
                            toggleShow={event => setAddComponent(!addComponent)}
                        />
                        :
                        <ComponentDetailView component={deviceComponents[selectedRow] || {}}/>
                    }
                </div>
            </div>
        </>
    )
}
