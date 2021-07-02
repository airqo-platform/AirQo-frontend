import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import PropTypes from "prop-types";
import axios from "axios";
import { Link, useHistory, useLocation } from "react-router-dom";
import { makeStyles } from "@material-ui/styles";
import { isEmpty } from "underscore";
import {
  Grid,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@material-ui/core";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import DeleteIcon from "@material-ui/icons/DeleteOutlineOutlined";
import EditIcon from "@material-ui/icons/EditOutlined";
import Tooltip from "@material-ui/core/Tooltip";
import { deleteDeviceApi } from "views/apis/deviceRegistry";
import { loadDevicesData } from "redux/DeviceRegistry/operations";
import { useDevicesData } from "redux/DeviceRegistry/selectors";
import { updateMainAlert } from "redux/MainAlert/operations";
import { updateDeviceBackUrl } from "redux/Urls/operations";
import CustomMaterialTable from "../Table/CustomMaterialTable";
import ConfirmDialog from "views/containers/ConfirmDialog";
import { REGISTER_DEVICE_URI } from "config/urls/deviceRegistry";
import { humanReadableDate } from "utils/dateTime";
import { useSitesData } from "redux/SiteRegistry/selectors";
import { loadSitesData } from "redux/SiteRegistry/operations";

// css
import "assets/css/device-registry.css";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
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

const Cell = ({ fieldValue }) => {
  return <div>{fieldValue || "N/A"}</div>;
};

const createDeviceColumns = (history, setDelState) => [
  {
    title: "Device Name",
    field: "name",
  },
  {
    title: "Description",
    field: "description",
  },
  {
    title: "Site",
    field: "site",
    render: (data) => (
      <Cell
        fieldValue={
          data.site && (
            <Link
              to={`/sites/${data.site._id}`}
              onClick={(event) => {
                event.stopPropagation();
              }}
            >
              {data.site && data.site.description}
            </Link>
          )
        }
      />
    ),
  },

  {
    title: "Site Name",
    field: "siteName",
    render: (data) => <Cell fieldValue={data.siteName} />,
  },
  {
    title: "Location Name",
    field: "locationName",
    render: (data) => <Cell fieldValue={data.locationName} />,
  },
  {
    title: "Registration Date",
    field: "createdAt",
    render: (data) => (
      <Cell data={data} fieldValue={humanReadableDate(data.createdAt)} />
    ),
  },
  {
    title: "Deployment status",
    field: "isActive",
    render: (data) => (
      <Cell
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
    title: "Actions",
    render: (rowData) => (
      <div>
        <Tooltip title="Edit">
          <EditIcon
            className={"hover-blue"}
            style={{ margin: "0 5px" }}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              history.push(`/device/${rowData.name}/edit`);
            }}
          />
        </Tooltip>
        <Tooltip title="Delete">
          <DeleteIcon
            // className={"hover-red"}
            style={{ margin: "0 5px", cursor: "not-allowed", color: "grey" }}
            // disable deletion for now
            // onClick={(event) => {
            //   event.stopPropagation();
            //   setDelState({ open: true, name: rowData.name });
            // }}
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
    locationName: "",
    siteName: "",
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
    setOpen(false);
    axios
      .post(REGISTER_DEVICE_URI, JSON.stringify(newDevice), {
        headers: { "Content-Type": "application/json" },
      })
      .then((res) => res.data)
      .then((resData) => {
        handleRegisterClose();
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
          <TextField
            label="Map Address"
            value={newDevice.locationName}
            onChange={handleDeviceDataChange("locationName")}
            fullWidth
          />
          <TextField
            label="Site Name"
            value={newDevice.siteName}
            onChange={handleDeviceDataChange("siteName")}
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
                native: "true",
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
                native: "true",
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
  const sites = useSitesData();
  const [deviceList, setDeviceList] = useState(Object.values(devices));

  const [delDevice, setDelDevice] = useState({ open: false, name: "" });

  const deviceColumns = createDeviceColumns(history, setDelDevice);

  const handleDeleteDevice = async () => {
    if (delDevice.name) {
      deleteDeviceApi(delDevice.name)
        .then(() => {
          delete devices[delDevice.name];
          setDeviceList(Object.values(devices));
          dispatch(loadDevicesData());
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
      dispatch(loadDevicesData());
    }
    if (isEmpty(sites)) {
      dispatch(loadSitesData());
    }
    dispatch(updateDeviceBackUrl(location.pathname));
  }, []);

  useEffect(() => {
    setDeviceList(Object.values(devices));
  }, [devices]);

  return (
    <div className={classes.root}>
      <br />
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
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
      </div>
      <br />

      <CustomMaterialTable
        title="Device Registry"
        userPreferencePaginationKey={"devices"}
        columns={deviceColumns}
        data={deviceList}
        onRowClick={(event, rowData) => {
          event.preventDefault();
          return history.push(`/device/${rowData.name}/overview`);
        }}
        options={{
          search: true,
          exportButton: true,
          searchFieldAlignment: "left",
          showTitle: false,
          searchFieldStyle: {
            fontFamily: "Open Sans",
          },
          headerStyle: {
            fontFamily: "Open Sans",
            fontSize: 16,
            fontWeight: 600,
          },
        }}
      />

      <CreateDevice
        open={registerOpen}
        setOpen={setRegisterOpen}
        devices={deviceList}
        setDevices={setDeviceList}
      />
      <ConfirmDialog
        open={delDevice.open}
        title={"Delete a device?"}
        message={`Are you sure you want to delete this ${delDevice.name} device`}
        close={() => setDelDevice({ open: false, name: "" })}
        confirm={handleDeleteDevice}
        error
      />
    </div>
  );
};

DevicesTable.propTypes = {
  className: PropTypes.string,
  users: PropTypes.array.isRequired,
};

export default DevicesTable;
