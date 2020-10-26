import React, { useEffect, useState } from "react";
import {Button} from "@material-ui/core";
import DeviceComponentsTable from "./Table";
import { useDispatch } from "react-redux";
import {isEmpty} from "underscore";
import { useDeviceComponentsData } from "redux/DeviceRegistry/selectors";
import { loadDeviceComponentsData } from "redux/DeviceRegistry/operations";

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
