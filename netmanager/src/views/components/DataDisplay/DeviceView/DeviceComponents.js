import React, { useEffect, useState } from "react";
import {Button, Paper, Table, TableBody, TableCell, TableContainer, TableRow} from "@material-ui/core";
import DeviceComponentsTable from "./Table";
import { useDispatch } from "react-redux";
import {isEmpty} from "underscore";
import { useDeviceComponentsData } from "redux/DeviceRegistry/selectors";
import { loadDeviceComponentsData } from "redux/DeviceRegistry/operations";
import CardHeader from "../../Card/CardHeader";

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
                               {component.measurement && component.measurement.map(val => {
                                   return <li>- {`${val.quantityKind}(${val.measurementUnit})`}</li>
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
                console.log('loading data now');
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
                    <ComponentDetailView component={deviceComponents[selectedRow] || {}} />
                    {/*{ addLog ?*/}
                    {/*    <AddLogForm deviceName={deviceName} deviceLocation={deviceLocation} />*/}
                    {/*    :*/}
                    {/*    <LogDetailView log={maintenanceLogs[selectedRow] || {}} />*/}
                    {/*}*/}


                </div>
            </div>
        </>
    )
}
