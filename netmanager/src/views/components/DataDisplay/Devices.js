import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import clsx from "clsx";
import PropTypes from "prop-types";
import PerfectScrollbar from "react-perfect-scrollbar";
import axios from "axios";
import { useHistory, useLocation } from "react-router-dom";
import { makeStyles } from "@material-ui/styles";
import { isEmpty } from "underscore";
import {
  Card,
  CardContent,
  Grid,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@material-ui/core";
import LoadingOverlay from "react-loading-overlay";
import constants from "../../../config/constants.js";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import DeleteIcon from "@material-ui/icons/DeleteOutlineOutlined";
import EditIcon from "@material-ui/icons/EditOutlined";
import Tooltip from "@material-ui/core/Tooltip";
import { deleteDeviceApi } from "../../apis/deviceRegistry";
import { loadDevicesData } from "redux/DeviceRegistry/operations";
import { useDevicesData } from "redux/DeviceRegistry/selectors";
import { useLocationsData } from "redux/LocationRegistry/selectors";
import { loadLocationsData } from "redux/LocationRegistry/operations";
import { updateMainAlert } from "redux/MainAlert/operations";
import { updateDeviceBackUrl } from "redux/Urls/operations";
import CustomMaterialTable from "../Table/CustomMaterialTable";

// css
import "assets/css/device-registry.css";
import { Create } from "@material-ui/icons";

const useStyles = makeStyles((theme) => ({
  root: {},
  content: {
    padding: 0,
  },
  inner: {
    minWidth: 1050,
  },
  nameContainer: {
    display: "flex",
    alignItems: "center",
  },
  avatar: {
    marginRight: theme.spacing(2),
  },
  actions: {
    justifyContent: "flex-end",
  },
  link: {
    color: "#3344AA",
    fontFamily: "Open Sans",
  },

  table: {
    fontFamily: "Open Sans",
  },
  modelWidth: {
    minWidth: 450,
  },
  formControl: {
    height: 40,
    margin: "15px 0",
  },
  input: {
    color: "black",
    fontFamily: "Open Sans",
    fontweight: 500,
    font: "100px",
    fontSize: 17,
  },
  paper: {
    minWidth: "400px",
    minHeight: "400px",
  },
  selectField: {
    height: 120,
    margin: "40 0",
    // border: "1px solid red"
  },
  fieldMargin: {
    margin: "20px 0",
  },
  button: {
    margin: "10px",
    width: "60px",
  },
  textFieldMargin: {
    margin: "15 0",
  },
  tableWrapper: {
    "& tbody>.MuiTableRow-root:hover": {
      background: "#EEE",
      cursor: "pointer",
    },
  },
}));

function appendLeadingZeroes(n) {
  if (n <= 9) {
    return "0" + n;
  }
  return n;
}

let formatDate = (date) => {
  let time =
    appendLeadingZeroes(date.getDate()) +
    "-" +
    appendLeadingZeroes(date.getMonth() + 1) +
    "-" +
    date.getFullYear();

  return time;
};

const Cell = ({ fieldValue, data }) => {
  const history = useHistory();
  return (
    <div
      style={{ fontFamily: "Open Sans", minHeight: "20px" }}
      onClick={() => history.push(`/device/${data.name}/overview`)}
    >
      {fieldValue}
    </div>
  );
};

const createDeviceColumns = (history, setDelState) => [
  {
    title: "Device Name",
    field: "name",
    render: (data) => <Cell data={data} fieldValue={data.name} />,
  },
  {
    title: "Description",
    field: "description",
    render: (data) => <Cell data={data} fieldValue={data.description} />,
  },
  {
    title: "Device ID",
    field: "channelID",
    render: (data) => <Cell data={data} fieldValue={data.channelID} />,
  },
  {
    title: "Registration Date",
    field: "createdAt",
    render: (data) => (
      <Cell data={data} fieldValue={formatDate(new Date(data.createdAt))} />
    ),
  },
  {
    title: "Deployment status",
    field: "isActive",
    render: (data) => (
      <Cell
        data={data}
        fieldValue={
          data.isActive ? (
            <span style={{ color: "green" }}>Deployed</span>
          ) : (
            <span style={{ color: "red" }}>Not Deployed</span>
          )
        }
      />
    ),
  },
  {
    title: "Location ID",
    field: "locationID",
    render: (data) => <Cell data={data} fieldValue={data.LocationID} />,
  },
  {
    title: "Actions",
    render: (rowData) => (
      <div>
        <Tooltip title="Edit">
          <EditIcon
            className={"hover-blue"}
            style={{ margin: "0 5px" }}
            onClick={() => history.push(`/device/${rowData.name}/edit`)}
          />
        </Tooltip>
        <Tooltip title="Delete">
          <DeleteIcon
            className={"hover-red"}
            style={{ margin: "0 5px" }}
            onClick={() => setDelState({ open: true, name: rowData.name })}
          />
        </Tooltip>
      </div>
    ),
  },
];

const CreateDevice = ({ open, setOpen, devices, setDevices }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const newDeviceInitState = {
    name: "",
    visibility: false,
    device_manufacturer: "",
    product_name: "",
    owner: "",
    ISP: "",
    phoneNumber: "",
    description: "",
  };

  const [newDevice, setNewDevice] = useState(newDeviceInitState);

  const handleDeviceDataChange = (key) => (event) => {
    if (key === "phoneNumber") {
      let re = /\s*|\d+(\.d+)?/;
      if (!re.test(event.target.value)) {
        return;
      }
    }
    return setNewDevice({ ...newDevice, [key]: event.target.value });
  };

  const handleRegisterClose = () => {
    setOpen(false);
    setNewDevice(newDeviceInitState);
  };

  let handleRegisterSubmit = (e) => {
    axios
      .post(constants.REGISTER_DEVICE_URI, JSON.stringify(newDevice), {
        headers: { "Content-Type": "application/json" },
      })
      .then((res) => res.data)
      .then((resData) => {
        setDevices([resData.device, ...devices]);
        dispatch(
          updateMainAlert({
            message: resData.message,
            show: true,
            severity: "success",
          })
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
    handleRegisterClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleRegisterClose}
      aria-labelledby="form-dialog-title"
      aria-describedby="form-dialog-description"
    >
      <DialogTitle id="form-dialog-title">Add a device</DialogTitle>

      <DialogContent>
        <form className={classes.modelWidth}>
          <TextField
            required
            className={classes.textFieldMargin}
            value={newDevice.name}
            onChange={handleDeviceDataChange("name")}
            label="Device Name"
            fullWidth
          />
          <TextField
            className={classes.textFieldMargin}
            label="Description"
            value={newDevice.description}
            onChange={handleDeviceDataChange("description")}
            fullWidth
            required
          />
          <TextField
            label="Manufacturer"
            value={newDevice.device_manufacturer}
            onChange={handleDeviceDataChange("device_manufacturer")}
            fullWidth
          />
          <TextField
            label="Product Name"
            value={newDevice.product_name}
            onChange={handleDeviceDataChange("product_name")}
            fullWidth
          />
          <FormControl required fullWidth>
            <InputLabel htmlFor="demo-dialog-native">Data Access</InputLabel>
            <Select
              required
              native
              value={newDevice.visibility}
              onChange={handleDeviceDataChange("visibility")}
              inputProps={{
                native: true,
                style: { height: "40px", marginTop: "10px" },
              }}
            >
              <option value={true}>Public</option>
              <option value={false}>Private</option>
            </Select>
          </FormControl>
          <TextField
            required
            label="Owner"
            value={newDevice.owner}
            onChange={handleDeviceDataChange("owner")}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel htmlFor="demo-dialog-native">
              Internet Service Provider
            </InputLabel>
            <Select
              native
              value={newDevice.ISP}
              onChange={handleDeviceDataChange("ISP")}
              inputProps={{
                native: true,
                style: { height: "40px", marginTop: "10px" },
              }}
            >
              <option aria-label="None" value="" />
              <option value="MTN">MTN</option>
              <option value="Africell">Africell</option>
              <option value="Airtel">Airtel</option>
            </Select>
          </FormControl>
          <TextField
            label="Phone Number"
            value={newDevice.phoneNumber}
            onChange={handleDeviceDataChange("phoneNumber")}
            fullWidth
          />
        </form>
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
            type="button"
            onClick={handleRegisterClose}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            type="submit"
            onClick={handleRegisterSubmit}
            style={{ margin: "0 15px" }}
          >
            Register
          </Button>
        </Grid>
        <br />
      </DialogActions>
    </Dialog>
  );
};

const DevicesTable = (props) => {
  const { className, users, ...rest } = props;
  const classes = useStyles();

  const history = useHistory();
  const location = useLocation();
  const dispatch = useDispatch();
  const devices = useDevicesData();
  const locations = useLocationsData();
  const [deviceList, setDeviceList] = useState(Object.values(devices));
  const [isLoading, setIsLoading] = useState(false);

  const [delDevice, setDelDevice] = useState({ open: false, name: "" });

  const deviceColumns = createDeviceColumns(history, setDelDevice);

  const handleDeleteDevice = async () => {
    if (delDevice.name) {
      deleteDeviceApi(delDevice.name)
        .then(() => {
          delete devices[delDevice.name];
          setDeviceList(Object.values(devices));
          dispatch(
            updateMainAlert({
              show: true,
              message: `device ${delDevice.name} deleted successfully`,
              severity: "success",
            })
          );
        })
        .catch((err) => {
          let msg = `deletion of  ${delDevice.name} failed`;
          if (err.response && err.response.data) {
            msg = err.response.data.message || msg;
          }
          dispatch(
            updateMainAlert({
              show: true,
              message: msg,
              severity: "error",
            })
          );
        });
    }
    setDelDevice({ open: false, name: "" });
  };

  const [registerOpen, setRegisterOpen] = useState(false);

  useEffect(() => {
    if (isEmpty(devices)) {
      setIsLoading(true);
      dispatch(loadDevicesData());
      setIsLoading(false);
    }
    if (isEmpty(locations)) {
      dispatch(loadLocationsData());
    }
    dispatch(updateDeviceBackUrl(location.pathname));
  }, []);

  useEffect(() => {
    setDeviceList(Object.values(devices));
  }, [devices]);

  return (
    <div className={classes.root}>
      <br />
      <Grid container alignItems="right" alignContent="right" justify="center">
        <Button
          variant="contained"
          color="primary"
          type="submit"
          align="right"
          onClick={() => setRegisterOpen(true)}
        >
          {" "}
          Add Device
        </Button>
      </Grid>
      <br />

      <LoadingOverlay active={isLoading} spinner text="Loading Devices...">
        <Card {...rest} className={clsx(classes.root, className)}>
          <CardContent className={classes.content}>
            <PerfectScrollbar>
              <div className={classes.tableWrapper}>
                <CustomMaterialTable
                  className={classes.table}
                  title="Device Registry"
                  userPreferencePaginationKey={"devices"}
                  columns={deviceColumns}
                  data={deviceList}
                  options={{
                    search: true,
                    exportButton: true,
                    searchFieldAlignment: "left",
                    showTitle: false,
                    searchFieldStyle: {
                      fontFamily: "Open Sans",
                      border: "2px solid #7575FF",
                    },
                    headerStyle: {
                      fontFamily: "Open Sans",
                      fontSize: 16,
                      fontWeight: 600,
                    },
                  }}
                />
              </div>
            </PerfectScrollbar>
          </CardContent>
        </Card>
      </LoadingOverlay>

      <CreateDevice
        open={registerOpen}
        setOpen={setRegisterOpen}
        devices={deviceList}
        setDevices={setDeviceList}
      />

      <Dialog
        open={delDevice.open}
        aria-labelledby="form-dialog-title-del"
        aria-describedby="form-dialog-description"
      >
        <DialogTitle id="form-dialog-title-del">Delete a device</DialogTitle>

        <DialogContent>
          Are you sure you want to delete device <b>{delDevice.name}</b>?
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
              type="button"
              onClick={() => setDelDevice({ open: false, name: "" })}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              type="submit"
              onClick={handleDeleteDevice}
              style={{ margin: "0 15px", background: "#c00", color: "white" }}
            >
              Delete
            </Button>
          </Grid>
          <br />
        </DialogActions>
      </Dialog>
    </div>
  );
};

DevicesTable.propTypes = {
  className: PropTypes.string,
  users: PropTypes.array.isRequired,
};

export default DevicesTable;
