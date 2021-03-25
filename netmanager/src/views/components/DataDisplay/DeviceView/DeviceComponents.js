import React, { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  Paper,
} from "@material-ui/core";
import DeviceComponentsTable from "./Table";
import { useDispatch } from "react-redux";
import { isEmpty } from "underscore";
import { useDeviceComponentsData } from "redux/DeviceRegistry/selectors";
import { loadDeviceComponentsData } from "redux/DeviceRegistry/operations";
import TextField from "@material-ui/core/TextField";
import {
  createDeviceComponentApi,
  updateComponentApi,
  deleteComponentApi,
} from "../../../apis/deviceRegistry";
import { updateMainAlert } from "redux/MainAlert/operations";
import {
  insertDeviceComponent,
  updateDeviceComponent,
} from "redux/DeviceRegistry/operations";
import Tooltip from "@material-ui/core/Tooltip";
import EditIcon from "@material-ui/icons/EditOutlined";
import DeleteIcon from "@material-ui/icons/DeleteOutlineOutlined";
import LabelledSelect from "../../CustomSelects/LabelledSelect";
import ConfirmDialog from "views/containers/ConfirmDialog";

const TableTitle = ({ deviceName }) => {
  return (
    <div>
      Components for <strong>{deviceName || ""}</strong>
    </div>
  );
};

const AddDeviceComponent = ({ deviceName, toggleShow }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [componentType, setComponentType] = useState(null);
  const [sensorName, setSensorName] = useState(null);
  const [quantityKind, setQuantityKind] = useState([]);

  const componentTypeOption = [
    { value: "pm2_5", label: "PM 2.5" },
    { value: "pm10", label: "PM 10" },
    { value: "s2_pm2_5", label: "Sensor 2 PM 2.5" },
    { value: "s2_pm10", label: "Sensor 2 PM 10" },
    { value: "temperature", label: "Temperature" },
    { value: "battery", label: "Battery" },
    { value: "humidity", label: "Humidity" },
  ];

  const componentNameOptions = [
    { value: "Alphasense OPC-N2", label: "Alphasense OPC-N2" },
    { value: "pms5003", label: "pms5003" },
    { value: "DHT11", label: "DHT11" },
    { value: "Lithium Ion 18650", label: "Lithium Ion 18650" },
    { value: "Generic", label: "Generic" },
    { value: "Purple Air II", label: "Purple Air II" },
    { value: "Bosch BME280", label: "Bosch BME280" },
  ];

  const createOption = (option) => ({ value: option, label: option });

  const createOptions = (options) => {
    const opts = [];
    options.map((option) => opts.push(createOption(option)));
    return opts;
  };

  const quantityOptions = [
    createOption("PM 1(µg/m3)"),
    createOption("PM 2.5(µg/m3)"),
    createOption("PM 10(µg/m3)"),
    createOption("External Temperature(\xB0C)"),
    createOption("External Temperature(\xB0F)"),
    createOption("External Humidity(%)"),
    createOption("Internal Temperature(\xB0C)"),
    createOption("Internal Humidity(%)"),
    createOption("Battery Voltage(V)"),
    createOption("GPS"),
  ];

  const sensorNameMapper = {
    "Alphasense OPC-N2": createOptions([
      "PM 1(µg/m3)",
      "PM 2.5(µg/m3)",
      "PM 10(µg/m3)",
    ]),
    pms5003: createOptions(["PM 2.5(µg/m3)", "PM 10(µg/m3)"]),
    DHT11: createOptions([
      "Internal Temperature(\xB0C)",
      "Internal Humidity(%)",
    ]),
    "Lithium Ion 18650": createOptions(["Battery Voltage(V)"]),
    Generic: createOptions(["GPS"]),
    "Purple Air II": createOptions(["PM 1(µg/m3)"]),
    "Bosch BME280": createOptions([
      "External Temperature(\xB0C)",
      "External Humidity(%)",
    ]),
  };

  useEffect(() => {
    if (sensorName && sensorName.value) {
      setQuantityKind(sensorNameMapper[sensorName.value]);
    }
  }, [sensorName]);

  const convertQuantityOptions = (quantityKind) => {
    const modifiedQuantity = [];
    quantityKind.map((quantity) => {
      if (typeof quantity === "string") {
        const newQuantity = quantity.replace(")", "");
        const newQuantityArr = newQuantity.split("(");
        if (newQuantityArr.length >= 2) {
          modifiedQuantity.push({
            quantityKind: newQuantityArr[0],
            measurementUnit: newQuantityArr[1],
          });
        } else {
          modifiedQuantity.push({
            quantityKind: "unknown",
            measurementUnit: "unknown",
          });
        }
      }
    });
    return modifiedQuantity;
  };

  const handleSubmit = async () => {
    const convertedQuantityKind = [];
    quantityKind.map((val) => convertedQuantityKind.push(val.value));
    let filter = {
      description: (sensorName && sensorName.value) || "", //e.g. pms5003
      measurement: convertQuantityOptions(convertedQuantityKind), //e.g. [{"quantityKind":"humidity", "measurementUnit":"%"}]
    };

    setLoading(true);
    await createDeviceComponentApi(
      deviceName,
      (componentType && componentType.value) || "",
      filter
    )
      .then(async (responseData) => {
        // dispatch(insertDeviceComponent(deviceName, responseData.component));
        dispatch(
          updateMainAlert({
            message: responseData.message,
            show: true,
            severity: "success",
          })
        );
        toggleShow();
        setTimeout(
          () =>
            dispatch(
              updateMainAlert({
                message: "refreshing page",
                show: true,
                severity: "info",
              })
            ),
          500
        );
        await dispatch(loadDeviceComponentsData(deviceName));
        dispatch(
          updateMainAlert({
            message: "page refresh successful",
            show: true,
            severity: "success",
          })
        );
        setTimeout(
          () =>
            dispatch(
              updateMainAlert({
                message: "refreshing page",
                show: false,
                severity: "info",
              })
            ),
          500
        );
      })
      .catch((error) => {
        dispatch(
          updateMainAlert({
            message: error.response.data.message,
            show: true,
            severity: "error",
          })
        );
      });
    setLoading(false);
    toggleShow();
  };

  return (
    <Paper style={{ minHeight: "400px", padding: "5px 10px" }}>
      <h4>Add Component</h4>
      <div>
        <div style={{ margin: "5px 0" }}>
          <TextField
            id="deviceName"
            label="Device Name"
            variant="outlined"
            value={deviceName}
            fullWidth
            disabled
          />
        </div>

        <div style={{ margin: "5px 0" }}>
          <LabelledSelect
            label={"Component Type"}
            options={componentTypeOption}
            isClearable
            value={componentType}
            onChange={(newValue: any, actionMeta: any) =>
              setComponentType(newValue)
            }
          />
        </div>

        <div style={{ margin: "5px 0" }}>
          <LabelledSelect
            label={"Component Name"}
            options={componentNameOptions}
            isClearable
            value={sensorName}
            onChange={(newValue: any, actionMeta: any) =>
              setSensorName(newValue)
            }
          />
        </div>

        <div style={{ margin: "5px 0" }}>
          <LabelledSelect
            label={"Quantity Measured"}
            options={quantityOptions}
            isClearable
            isMulti
            value={quantityKind}
            onChange={(newValue: any, actionMeta: any) =>
              setQuantityKind(newValue)
            }
          />
        </div>
      </div>

      <Grid
        container
        alignItems="flex-end"
        alignContent="flex-end"
        justify="flex-end"
        style={{ marginTop: "30px" }}
      >
        <Button variant="contained" onClick={toggleShow}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={loading}
          color="primary"
          onClick={handleSubmit}
          style={{ marginLeft: "10px" }}
        >
          Add Component
        </Button>
      </Grid>
    </Paper>
  );
};

const EditComponent = ({ deviceName, toggleShow, component }) => {
  const createOption = (option) => ({ value: option, label: option });

  const transformMeasurements = (measurements) => {
    const transformed = [];

    measurements.map((m) =>
      transformed.push(createOption(`${m.quantityKind}(${m.measurementUnit})`))
    );

    return transformed;
  };

  const createOptions = (options) => {
    const opts = [];
    options.map((option) => opts.push(createOption(option)));
    return opts;
  };
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [sensorName, setSensorName] = useState(
    (component.description && createOption(component.description)) || null
  );
  const [quantityKind, setQuantityKind] = useState(transformMeasurements(component.measurement));

  const [maxSensorValue, setMaxSensorValue] = useState(
    (component.calibration && component.calibration.valueMax.sensorValue) || 0
  );
  const [minSensorValue, setMinSensorValue] = useState(
    (component.calibration && component.calibration.valueMin.sensorValue) || 0
  );
  const [maxRealValue, setMaxRealValue] = useState(
    (component.calibration && component.calibration.valueMax.realValue) || 0
  );
  const [minRealValue, setMinRealValue] = useState(
    (component.calibration && component.calibration.valueMin.realValue) || 0
  );

  const componentNameOptions = [
    { value: "Alphasense OPC-N2", label: "Alphasense OPC-N2" },
    { value: "pms5003", label: "pms5003" },
    { value: "DHT11", label: "DHT11" },
    { value: "Lithium Ion 18650", label: "Lithium Ion 18650" },
    { value: "Generic", label: "Generic" },
    { value: "Purple Air II", label: "Purple Air II" },
    { value: "Bosch BME280", label: "Bosch BME280" },
  ];

  const quantityOptions = [
    createOption("PM 1(µg/m3)"),
    createOption("PM 2.5(µg/m3)"),
    createOption("PM 10(µg/m3)"),
    createOption("External Temperature(\xB0C)"),
    createOption("External Temperature(\xB0F)"),
    createOption("External Humidity(%)"),
    createOption("Internal Temperature(\xB0C)"),
    createOption("Internal Humidity(%)"),
    createOption("Battery Voltage(V)"),
    createOption("GPS"),
  ];

  const convertQuantityOptions = (quantityKind) => {
    const modifiedQuantity = [];
    quantityKind.map((quantity) => {
      if (typeof quantity === "string") {
        const newQuantity = quantity.replace(")", "");
        const newQuantityArr = newQuantity.split("(");
        if (newQuantityArr.length >= 2) {
          modifiedQuantity.push({
            quantityKind: newQuantityArr[0],
            measurementUnit: newQuantityArr[1],
          });
        } else {
          modifiedQuantity.push({
            quantityKind: "unknown",
            measurementUnit: "unknown",
          });
        }
      }
    });
    return modifiedQuantity;
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const convertedQuantityKind = [];
    quantityKind.map((val) => convertedQuantityKind.push(val.value));
    let filter = {
      description: (sensorName && sensorName.value) || "", //e.g. pms5003
      measurement: convertQuantityOptions(convertedQuantityKind), //e.g. [{"quantityKind":"humidity", "measurementUnit":"%"}]
      calibration: {
        valueMax: {
          sensorValue: maxSensorValue,
          realValue: maxRealValue,
        },
        valueMin: {
          sensorValue: minSensorValue,
          realValue: minRealValue,
        },
      },
    };

    setLoading(true);
    await updateComponentApi(deviceName, component.name, filter)
      .then((responseData) => {
        dispatch(
          updateDeviceComponent(deviceName, component.tableIndex, {
            ...(responseData.updatedComponent || {}),
            tableIndex: component.tableIndex,
          })
        );
        dispatch(
          updateMainAlert({
            message: responseData.message,
            show: true,
            severity: "success",
          })
        );
      })
      .catch((err) => {
        dispatch(
          updateMainAlert({
            message:
              (err.response &&
                err.response.data &&
                err.response.data.message) ||
              "could not update component",
            show: true,
            severity: "error",
          })
        );
      });
    setLoading(false);
    toggleShow();
  };

  return (
    <Paper style={{ minHeight: "400px", padding: "5px 10px" }}>
      <h4>Edit Component</h4>
      <div>
        <div style={{ margin: "5px 0" }}>
          <TextField
            id="deviceName"
            label="Device Name"
            variant="outlined"
            value={deviceName}
            fullWidth
            disabled
          />
        </div>

        <div style={{ margin: "5px 0" }}>
          <LabelledSelect
            label={"Component Name"}
            options={componentNameOptions}
            isClearable
            value={sensorName}
            onChange={(newValue: any, actionMeta: any) =>
              setSensorName(newValue)
            }
          />
        </div>

        <div style={{ margin: "5px 0" }}>
          <LabelledSelect
            label={"Quantity Measured"}
            options={quantityOptions}
            isClearable
            isMulti
            value={quantityKind}
            onChange={(newValue: any, actionMeta: any) =>
              setQuantityKind(newValue)
            }
          />
        </div>

        <div style={{ margin: "10px 0" }}>
          <TextField
            id="sensorMaxVal"
            label="Sensor Max Value"
            variant="outlined"
            fullWidth
            type={"number"}
            value={maxSensorValue}
            onChange={(event) => setMaxSensorValue(event.target.value)}
          />
        </div>

        <div style={{ margin: "10px 0" }}>
          <TextField
            id="sensorMinVal"
            label="Sensor Min Value"
            variant="outlined"
            fullWidth
            type={"number"}
            value={minSensorValue}
            onChange={(event) => setMinSensorValue(event.target.value)}
          />
        </div>

        <div style={{ margin: "10px 0" }}>
          <TextField
            id="realMaxVal"
            label="Real Max Value"
            variant="outlined"
            fullWidth
            type={"number"}
            value={maxRealValue}
            onChange={(event) => setMaxRealValue(event.target.value)}
          />
        </div>

        <div style={{ margin: "10px 0" }}>
          <TextField
            id="realMinVal"
            label="Real Min Value"
            variant="outlined"
            fullWidth
            type={"number"}
            value={minRealValue}
            onChange={(event) => setMinRealValue(event.target.value)}
          />
        </div>
      </div>

      <Grid
        container
        alignItems="flex-end"
        alignContent="flex-end"
        justify="flex-end"
        style={{ marginTop: "30px" }}
      >
        <Button variant="contained" onClick={toggleShow}>
          Cancel
        </Button>
        <Button
          variant="contained"
          disabled={loading}
          color="primary"
          onClick={handleSubmit}
          style={{ marginLeft: "10px" }}
        >
          Save Changes
        </Button>
      </Grid>
    </Paper>
  );
};

export default function DeviceComponents({ deviceName }) {
  const dispatch = useDispatch();
  const [selectedRow, setSelectedRow] = useState(0);
  const [selectedComponent, setSelectedComponent] = useState({});
  const deviceComponents = useDeviceComponentsData(deviceName);
  const [delState, setDelState] = useState({ open: false, data: {} });
  const [show, setShow] = useState({
    compTable: true,
    editComp: false,
    addComp: false,
  });

  const componentColumns = [
    {
      title: "Name",
      field: "name",
      cellStyle: { width: 100, maxWidth: 100 },
      return: (rowData) => (
        <div className={"table-truncate"}>{rowData.name}</div>
      ),
    },
    {
      title: "Description",
      field: "description",
      cellStyle: { width: 100, maxWidth: 100 },
      return: (rowData) => (
        <div className={"table-truncate"}>{rowData.description}</div>
      ),
    },
    {
      title: "Measurement(s)",
      field: "measurement",
      cellStyle: { width: 100, maxWidth: 100 },
      render: (rowData) => {
        let measurement = "";
        rowData.measurement.map((val) => {
          measurement += `${val.quantityKind}(${val.measurementUnit}), `;
        });
        return <div className={"table-truncate"}>{measurement}</div>;
      },
    },
    {
      title: "Calibration",
      field: "calibration",
      cellStyle: { width: 100, maxWidth: 100 },
      render: (rowData) => {
        return (
          <div className={"table-truncate"}>
            <b>Max Value(s)</b> ( Sensor value:
            {rowData.calibration && rowData.calibration.valueMax.sensorValue},
            Real value:
            {rowData.calibration && rowData.calibration.valueMax.realValue})
            <b>Min Value(s)</b> (Sensor value:
            {rowData.calibration && rowData.calibration.valueMin.sensorValue},
            Real value:
            {rowData.calibration && rowData.calibration.valueMin.realValue}>
          </div>
        );
      },
    },

    {
      title: "Date Created",
      field: "createdAt",
      cellStyle: { width: 100, maxWidth: 100 },
      return: (rowData) => (
        <div className={"table-truncate"}>{rowData.createdAt}</div>
      ),
    },
    {
      title: "Actions",
      render: (rowData) => (
        <div>
          <Tooltip title="Edit">
            <EditIcon
              className={"hover-blue"}
              style={{ margin: "0 5px" }}
              onClick={() => {
                setSelectedComponent(rowData);
                setSelectedRow(rowData.tableIndex);
                setShow({ compTable: false, editComp: true, addComp: false });
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <DeleteIcon
              className={"hover-red"}
              style={{ margin: "0 5px" }}
              onClick={() => setDelState({ open: true, data: rowData })}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  const handleComponentDelete = async () => {
    setDelState({ ...delState, open: false });

    if (delState.data.name) {
      await deleteComponentApi(deviceName, delState.data.name)
        .then(async (responseData) => {
          await dispatch(
            updateMainAlert({
              message: responseData.message,
              show: true,
              severity: "success",
            })
          );
          setTimeout(
            () =>
              dispatch(
                updateMainAlert({
                  message: "refreshing page",
                  show: true,
                  severity: "info",
                })
              ),
            500
          );
          await dispatch(loadDeviceComponentsData(deviceName));
          dispatch(
            updateMainAlert({
              message: "page refresh successful",
              show: true,
              severity: "success",
            })
          );
          setTimeout(
            () =>
              dispatch(
                updateMainAlert({
                  message: "refreshing page",
                  show: false,
                  severity: "info",
                })
              ),
            500
          );
        })
        .catch((err) => {
          dispatch(
            updateMainAlert({
              message:
                (err.response &&
                  err.response.data &&
                  err.response.data.message) ||
                "could not delete component",
              show: true,
              severity: "error",
            })
          );
        });
    }
  };

  useEffect(() => {
    if (isEmpty(deviceComponents)) {
      if (typeof deviceName !== "undefined") {
        dispatch(loadDeviceComponentsData(deviceName));
      }
    }
  }, []);
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
          style={{ marginRight: "5px" }}
          variant="contained"
          color="primary"
          disabled={show.compTable}
          onClick={() =>
            setShow({ compTable: true, editComp: false, addComp: false })
          }
        >
          {" "}
          Components Table
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={show.addComp}
          onClick={() =>
            setShow({ compTable: false, editComp: false, addComp: true })
          }
        >
          {" "}
          Add Component
        </Button>
      </div>
      <div>
        {show.compTable && (
          <DeviceComponentsTable
            title={<TableTitle deviceName={deviceName} />}
            columns={componentColumns}
            data={deviceComponents}
            onRowClick={(evt, selectedRow) => {
              setSelectedRow(selectedRow.tableData.id);
            }}
            detailPanel={[
              {
                tooltip: "Show Details",
                render: (rowData) => {
                  return (
                    <div className={"ml-table-details-6"}>
                      <span>{rowData.name}</span>
                      <span>{rowData.description}</span>
                      <span>
                        <ul>
                          {rowData.measurement &&
                            rowData.measurement.map((val, key) => {
                              return (
                                <li className="li-circle" key={key}>
                                  {`${val.quantityKind} (${val.measurementUnit}), `}
                                </li>
                              );
                            })}
                        </ul>
                      </span>
                      <span>
                        <b>Max Value(s)</b>
                        <ul style={{ marginLeft: "20px" }}>
                          <li className="li-circle">
                            Sensor value:{" "}
                            {rowData.calibration &&
                              rowData.calibration.valueMax.sensorValue}
                          </li>
                          <li className="li-circle">
                            Real value:{" "}
                            {rowData.calibration &&
                              rowData.calibration.valueMax.realValue}
                          </li>
                        </ul>
                        <b>Min Value(s)</b>
                        <ul style={{ marginLeft: "20px" }}>
                          <li className="li-circle">
                            Sensor value:{" "}
                            {rowData.calibration &&
                              rowData.calibration.valueMin.sensorValue}
                          </li>
                          <li className="li-circle">
                            Real value:{" "}
                            {rowData.calibration &&
                              rowData.calibration.valueMin.realValue}
                          </li>
                        </ul>
                      </span>
                      <span>{rowData.createdAt}</span>
                    </div>
                  );
                },
              },
            ]}
            options={{
              pageSize: 10,
              rowStyle: (rowData) => ({
                backgroundColor:
                  selectedRow === rowData.tableData.id ? "#EEE" : "#FFF",
              }),
            }}
          />
        )}

        {show.addComp && (
          <AddDeviceComponent
            deviceName={deviceName}
            toggleShow={(event) =>
              setShow({ compTable: true, editComp: false, addComp: false })
            }
          />
        )}

        {show.editComp && (
          <EditComponent
            deviceName={deviceName}
            toggleShow={(event) =>
              setShow({ compTable: true, editComp: false, addComp: false })
            }
            component={selectedComponent}
          />
        )}
      </div>
      <ConfirmDialog
        open={delState.open}
        title={"Delete a device component?"}
        message={`Are you sure you want to delete this ${delState.data.name} component`}
        close={() => setDelState({ open: false, data: {} })}
        confirm={handleComponentDelete}
        error
      />
    </>
  );
}
