import React, { useState, useEffect, forwardRef } from "react";
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
  TableRow,
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
import {
  KeyboardDatePicker,
  MuiPickersUtilsProvider,
} from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import MaintenanceLogsTable from "./Table";
import {
  loadDeviceMaintenanceLogs,
  insertMaintenanceLog,
  updateMaintenanceLog,
} from "redux/DeviceRegistry/operations";
import { useDeviceLogsData } from "redux/DeviceRegistry/selectors";
import {
  addMaintenanceLogApi,
  updateMaintenanceLogApi,
} from "../../../apis/deviceRegistry";
import { updateMainAlert } from "redux/MainAlert/operations";
import { CreatableLabelledSelect } from "views/components/CustomSelects/LabelledSelect";
import Tooltip from "@material-ui/core/Tooltip";
import EditIcon from "@material-ui/icons/EditOutlined";
import DeleteIcon from "@material-ui/icons/DeleteOutlineOutlined";

const titleStyles = {
  fontFamily: "Roboto, Helvetica, Arial, sans-serif",
};

const wrapperStyles = {
  display: "flex",
  justifyContent: "space-between",
};

const TableTitle = ({ deviceName }) => {
  return (
    <div style={titleStyles}>
      Maintenance logs for <strong>{deviceName || ""}</strong>
    </div>
  );
};

const EditLog = ({ deviceName, deviceLocation, toggleShow, log }) => {
  const dispatch = useDispatch();
  const maintenanceTypeMapper = {
    preventive: { value: "preventive", label: "Preventive" },
    corrective: { value: "corrective", label: "Corrective" },
  };
  const createOption = (option) => ({ label: option, value: option });
  const createListOptions = (options) => {
    const extracted = [];

    options.map((option) => extracted.push(createOption(option)));
    return extracted;
  };
  const [loading, setLoading] = useState(false);
  const [maintenanceType, setMaintenanceType] = useState(
    maintenanceTypeMapper[log.maintenanceType] ||
      (log.maintenanceType && createOption(log.maintenanceType)) ||
      null
  );
  const [description, setDescription] = useState(log.description);
  const [tags, setTags] = useState(createListOptions(log.tags || []));
  const [selectedDate, setSelectedDate] = useState(new Date(log.date));

  const createTagOption = (tag) => ({ label: tag, value: tag });

  const tagsOptions = [
    createTagOption("Dust blowing and sensor cleaning"),
    createTagOption("Site update check"),
    createTagOption("Device equipment check"),
    createTagOption("Power circuitry and components works"),
    createTagOption("GPS module works/replacement"),
    createTagOption("GSM module works/replacement"),
    createTagOption("Battery works/replacement"),
    createTagOption("Power supply works/replacement"),
    createTagOption("Antenna works/replacement"),
    createTagOption("Mounts replacement"),
    createTagOption("Software checks/re-installation"),
    createTagOption("PCB works/replacement"),
    createTagOption("Temp/humidity sensor works/replacement"),
    createTagOption("Air quality sensor(s) works/replacement"),
  ];

  const maintenanceTypeOptions = [
    { value: "preventive", label: "Preventive" },
    { value: "Corrective", label: "Corrective" },
  ];

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const extracted_tags = [];
    tags && tags.map((tag) => extracted_tags.push(tag.value));
    const logData = {
      deviceName,
      locationName: deviceLocation,
      date: selectedDate.toISOString(),
      tags: extracted_tags,
      maintenanceType: (maintenanceType && maintenanceType.value) || "",
      description: description,
    };

    setLoading(true);
    await updateMaintenanceLogApi(log._id, logData)
      .then((responseData) => {
        dispatch(
          updateMaintenanceLog(
            deviceName,
            log.tableIndex,
            responseData.updatedActivity
          )
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
              "could not update log",
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
      <h4>Edit Log</h4>
      <form>
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
          <CreatableLabelledSelect
            label={"Type of Maintenance"}
            options={maintenanceTypeOptions}
            isClearable
            value={maintenanceType}
            onChange={(newValue: any, actionMeta: any) =>
              setMaintenanceType(newValue)
            }
          />
        </div>
        <div style={{ margin: "5px 0" }}>
          <TextField
            id="deviceName"
            label="Description"
            variant="outlined"
            multiline
            rows={10}
            fullWidth
            value={description || ""}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
        <div style={{ marginTop: "5px" }}>
          <CreatableLabelledSelect
            label={"Tags"}
            isMulti
            options={tagsOptions}
            isClearable
            value={tags}
            onChange={(newValue: any, actionMeta: any) => setTags(newValue)}
          />
        </div>
        <MuiPickersUtilsProvider utils={DateFnsUtils} fullWidth={true}>
          <KeyboardDatePicker
            fullWidth={true}
            disableToolbar
            autoOk
            inputVariant="outlined"
            format="yyyy-MM-dd"
            margin="normal"
            id="maintenanceDate"
            label="Date of Maintenance"
            value={selectedDate}
            onChange={(date) => setSelectedDate(date)}
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
          <Button variant="contained" onClick={toggleShow}>
            Cancel
          </Button>
          <Button
            disabled={loading}
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            style={{ marginLeft: "10px" }}
          >
            Edit Log
          </Button>
        </Grid>
      </form>
    </Paper>
  );
};

const AddLogForm = ({ deviceName, deviceLocation, toggleShow }) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [maintenanceType, setMaintenanceType] = useState(null);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const createTagOption = (tag) => ({ label: tag, value: tag });

  const tagsOptions = [
    createTagOption("Dust blowing and sensor cleaning"),
    createTagOption("Site update check"),
    createTagOption("Device equipment check"),
    createTagOption("Power circuitry and components works"),
    createTagOption("GPS module works/replacement"),
    createTagOption("GSM module works/replacement"),
    createTagOption("Battery works/replacement"),
    createTagOption("Power supply works/replacement"),
    createTagOption("Antenna works/replacement"),
    createTagOption("Mounts replacement"),
    createTagOption("Software checks/re-installation"),
    createTagOption("PCB works/replacement"),
    createTagOption("Temp/humidity sensor works/replacement"),
    createTagOption("Air quality sensor(s) works/replacement"),
  ];

  const maintenanceTypeOptions = [
    { value: "preventive", label: "Preventive" },
    { value: "corrective", label: "Corrective" },
  ];

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    const extracted_tags = [];
    tags && tags.map((tag) => extracted_tags.push(tag.value));
    const logData = {
      deviceName,
      locationName: deviceLocation,
      date: selectedDate.toISOString(),
      tags: extracted_tags,
      maintenanceType: (maintenanceType && maintenanceType.value) || "",
      description: description,
    };

    setLoading(true);
    await addMaintenanceLogApi(logData)
      .then((responseData) => {
        dispatch(insertMaintenanceLog(deviceName, responseData.activityBody));
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
            message: err.response.data.message,
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
      <h4>Add Log</h4>
      <form>
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
          <CreatableLabelledSelect
            label={"Type of Maintenance"}
            options={maintenanceTypeOptions}
            isClearable
            value={maintenanceType}
            onChange={(newValue: any, actionMeta: any) =>
              setMaintenanceType(newValue)
            }
          />
        </div>
        <div style={{ margin: "5px 0" }}>
          <TextField
            id="deviceName"
            label="Description"
            variant="outlined"
            multiline
            rows={10}
            fullWidth
            value={description || ""}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
        <div style={{ marginTop: "5px" }}>
          <CreatableLabelledSelect
            label={"Tags"}
            isMulti
            options={tagsOptions}
            isClearable
            value={tags}
            onChange={(newValue: any, actionMeta: any) => setTags(newValue)}
          />
        </div>
        <MuiPickersUtilsProvider utils={DateFnsUtils} fullWidth={true}>
          <KeyboardDatePicker
            fullWidth={true}
            disableToolbar
            autoOk
            inputVariant="outlined"
            format="yyyy-MM-dd"
            margin="normal"
            id="maintenanceDate"
            label="Date of Maintenance"
            value={selectedDate}
            onChange={(date) => setSelectedDate(date)}
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
          <Button variant="contained" onClick={toggleShow}>
            Cancel
          </Button>
          <Button
            disabled={loading}
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            style={{ marginLeft: "10px" }}
          >
            Add Log
          </Button>
        </Grid>
      </form>
    </Paper>
  );
};

export default function DeviceLogs({ deviceName, deviceLocation }) {
  const dispatch = useDispatch();
  const [selectedRow, setSelectedRow] = useState(0);
  const [selectedLog, setSelectedLog] = useState({});
  const [show, setShow] = useState({
    logTable: true,
    addLog: false,
    editLog: false,
  });
  const maintenanceLogs = useDeviceLogsData(deviceName);

  console.log("ml", maintenanceLogs);

  const logsColumns = [
    { title: "Maintenance type", field: "maintenanceType" },
    {
      title: "Description",
      field: "description",
      cellStyle: { width: 100, maxWidth: 100 },
      render: (rowData) => (
        <div className={"table-truncate"}>{rowData.description}</div>
      ),
    },
    {
      title: "Tags",
      field: "tags",
      cellStyle: { width: 100, maxWidth: 100 },
      render: (rowData) => {
        return (
          <div className={"table-truncate"}>
            {rowData.tags && rowData.tags.join(", ")}
          </div>
        );
      },
    },
    {
      title: "Next Maintenance",
      field: "nextMaintenance",
      cellStyle: { width: 100, maxWidth: 100 },
      render: (rowData) => (
        <div className={"table-truncate"}>{rowData.nextMaintenance}</div>
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
                setSelectedLog(rowData);
                setSelectedRow(rowData.tableIndex);
                setShow({ logTable: false, addLog: false, editLog: true });
              }}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <DeleteIcon
              className={"hover-red"}
              style={{ margin: "0 5px" }}
              // onClick={() => setDelState({ open: true, name: rowData.name })}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (isEmpty(maintenanceLogs)) {
      if (typeof deviceName !== "undefined") {
        dispatch(loadDeviceMaintenanceLogs(deviceName));
      }
    }
  });

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
          disabled={show.logTable}
          onClick={() =>
            setShow({ logTable: true, addLog: false, editLog: false })
          }
        >
          {" "}
          Logs Table
        </Button>
        <Button
          variant="contained"
          color="primary"
          disabled={show.addLog}
          onClick={() => {
            setShow({ logTable: false, addLog: true, editLog: false });
          }}
        >
          {" "}
          Add Log
        </Button>
      </div>
      <div>
        {show.logTable && (
          <MaintenanceLogsTable
            title={<TableTitle deviceName={deviceName} />}
            columns={logsColumns}
            data={maintenanceLogs}
            options={{
              pageSize: 10,
              rowStyle: (rowData) => ({
                backgroundColor:
                  selectedRow === rowData.tableData.id ? "#EEE" : "#FFF",
              }),
            }}
            detailPanel={[
              {
                tooltip: "Show Details",
                render: (rowData) => {
                  return (
                    <div className={"ml-table-details"}>
                      <span>{rowData.maintenanceType}</span>
                      <span>{rowData.description}</span>
                      <span>
                        <ul>
                          {rowData.tags &&
                            rowData.tags.map((tag, key) => {
                              return (
                                <li className="li-circle" key={key}>
                                  {tag}
                                </li>
                              );
                            })}
                        </ul>
                      </span>
                      <span>{rowData.nextMaintenance}</span>
                    </div>
                  );
                },
              },
            ]}
          />
        )}
        {show.addLog && (
          <AddLogForm
            deviceName={deviceName}
            deviceLocation={deviceLocation}
            toggleShow={() =>
              setShow({ logTable: true, addLog: false, editLog: false })
            }
          />
        )}
        {show.editLog && (
          <EditLog
            deviceName={deviceName}
            deviceLocation={deviceLocation}
            toggleShow={() =>
              setShow({ logTable: true, addLog: false, editLog: false })
            }
            log={selectedLog}
            updateSelectedRow={setSelectedRow}
          />
        )}
      </div>
    </>
  );
}
