import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { isEmpty } from "underscore";
import MaintenanceLogsTable from "./Table";
import { loadDeviceMaintenanceLogs } from "redux/DeviceRegistry/operations";
import { useDeviceLogsData } from "redux/DeviceRegistry/selectors";
import {Paper, Table, TableBody, TableCell, TableContainer, TableRow} from "@material-ui/core";
import CardHeader from "../../Card/CardHeader";

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
    console.log('current log', log)
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


export default function DeviceLogs({ deviceName }) {

    const dispatch = useDispatch();
    const [selectedRow, setSelectedRow] = useState(0);
    const maintenanceLogs = useDeviceLogsData(deviceName);

    useEffect(() => {
        if(isEmpty(maintenanceLogs)) {
            dispatch(loadDeviceMaintenanceLogs(deviceName))
        }
    })

    return (
        <div style={wrapperStyles}>
            <MaintenanceLogsTable
                style={{width: "62%"}}
                title={<TableTitle deviceName={deviceName} />}
                columns={logsColumns}
                data={maintenanceLogs}
                onRowClick={((evt, selectedRow) => setSelectedRow(selectedRow.tableData.id))}
                options={{
                    rowStyle: rowData => ({
                        backgroundColor: (selectedRow === rowData.tableData.id) ? '#EEE' : '#FFF'
                    })
                }}
            />
            <div style={{width: "35%"}}>
                <LogDetailView log={maintenanceLogs[selectedRow] || {}} />
            </div>
        </div>
    )
}
