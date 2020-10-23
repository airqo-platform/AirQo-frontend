import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { isEmpty } from "underscore";
import Table from "./Table";
import { loadDeviceMaintenanceLogs } from "redux/DeviceRegistry/operations";
import { useDeviceLogsData } from "redux/DeviceRegistry/selectors";

const logsColumns = [
    { title: "Activity Type", field: "activityType"},
    { title: "Description", field: "description"},
    { title: "Location", field: "location"},
    { title: "Next Maintenance", field: "nextMaintenance"},
    { title: "Date Created", field: "createdAt"},
]

const titleStyles = {
    fontFamily: "Roboto, Helvetica, Arial, sans-serif",
}

const wrapperStyles = {
    display: "flex",
}

const TableTitle = ({ deviceName }) => {
    return (
        <div style={titleStyles}>
            Maintenance logs for <strong>{deviceName || ""}</strong>
        </div>
    )
}
export default function DeviceLogs({ deviceName }) {

    const dispatch = useDispatch();
    const [selectedRow, setSelectedRow] = useState(null);
    const maintenanceLogs = useDeviceLogsData(deviceName);

    useEffect(() => {
        if(isEmpty(maintenanceLogs)) {
            dispatch(loadDeviceMaintenanceLogs(deviceName))
        }
    })

    return (
        <div style={wrapperStyles}>
            <Table
                style={{width: "60%"}}
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
            <div>form</div>
        </div>
    )
}
