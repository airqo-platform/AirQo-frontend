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
import {
  createAlertBarExtraContentFromObject,
  dropEmpty,
} from "utils/objectManipulators";

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
  return <div>{fieldValue || "-"}</div>;
};

const createDeviceColumns = (history, setDelState) => [
  {
    title: "Device Name",
    render: (data) => <Cell fieldValue={data.long_name} />,
    field: "long_name",
  },
  {
    title: "Generated Name",
    field: "name",
    render: (data) => <Cell fieldValue={data.name} />,
  },
  {
    title: "Description",
    field: "description",
    render: (data) => <Cell fieldValue={data.description} />,
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
              className={"underline-hover"}
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

const CreateDevice = ({ open, setOpen }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const newDeviceInitState = {
    long_name: "",
    description: "",
    visibility: false,
    generation_version: "",
    generation_count: "",
    device_manufacturer: "",
    product_name: "",
    ISP: "",
    phoneNumber: "",
  };

  const initialErrors = {
    long_name: "",
    description: "",
    visibility: "",
    generation_version: "",
    generation_count: "",
    device_manufacturer: "",
    product_name: "",
    ISP: "",
    phoneNumber: "",
  };

  const [newDevice, setNewDevice] = useState(newDeviceInitState);
  const [errors, setErrors] = useState(initialErrors);

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
    setErrors(initialErrors);
  };

  let handleRegisterSubmit = (e) => {
    setOpen(false);
    axios
      .post(REGISTER_DEVICE_URI, dropEmpty(newDevice), {
        headers: { "Content-Type": "application/json" },
      })
      .then((res) => res.data)
      .then((resData) => {
        handleRegisterClose();
        dispatch(loadDevicesData());
        dispatch(
          updateMainAlert({
            message: resData.message,
            show: true,
            severity: "success",
          })
        );
      })
      .catch((error) => {
        const errors =
          error.response && error.response.data && error.response.data.errors;
        console.log("errors", errors);
        setErrors(errors || initialErrors);
        dispatch(
          updateMainAlert({
            message:
              error.response &&
              error.response.data &&
              error.response.data.message,
            show: true,
            severity: "error",
            extra: createAlertBarExtraContentFromObject(errors || {}),
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
      <DialogTitle
        id="form-dialog-title"
        style={{ textTransform: "uppercase" }}
      >
        Add a device
      </DialogTitle>

      <DialogContent>
        <form className={classes.modelWidth}>
          <TextField
            autoFocus
            margin="dense"
            label="Device Name"
            variant="outlined"
            value={newDevice.long_name}
            onChange={handleDeviceDataChange("long_name")}
            fullWidth
            required
            error={!!errors.long_name}
            helperText={errors.long_name}
          />
          <TextField
            autoFocus
            margin="dense"
            label="Description"
            variant="outlined"
            value={newDevice.description}
            onChange={handleDeviceDataChange("description")}
            error={!!errors.description}
            helperText={errors.description}
            fullWidth
            required
          />
          <TextField
            select
            fullWidth
            label="Data Access"
            style={{ margin: "10px 0" }}
            value={newDevice.visibility}
            onChange={handleDeviceDataChange("visibility")}
            error={!!errors.visibility}
            helperText={errors.visibility}
            SelectProps={{
              native: true,
              style: { width: "100%", height: "50px" },
              MenuProps: {
                className: classes.menu,
              },
            }}
            variant="outlined"
            required
          >
            <option value={false}>Private</option>
            <option value={true}>Public</option>
          </TextField>
          <TextField
            autoFocus
            margin="dense"
            label="Generation Version"
            variant="outlined"
            type="number"
            value={newDevice.generation_version}
            onChange={handleDeviceDataChange("generation_version")}
            error={!!errors.generation_version}
            helperText={errors.generation_version}
            fullWidth
            required
          />
          <TextField
            autoFocus
            margin="dense"
            label="Generation Count"
            variant="outlined"
            type="number"
            value={newDevice.generation_count}
            error={!!errors.generation_count}
            helperText={errors.generation_count}
            onChange={handleDeviceDataChange("generation_count")}
            fullWidth
            required
          />
          <TextField
            autoFocus
            margin="dense"
            label="Manufacturer"
            variant="outlined"
            value={newDevice.device_manufacturer}
            onChange={handleDeviceDataChange("device_manufacturer")}
            error={!!errors.device_manufacturer}
            helperText={errors.device_manufacturer}
            fullWidth
          />
          <TextField
            autoFocus
            margin="dense"
            label="Product Name"
            variant="outlined"
            value={newDevice.product_name}
            onChange={handleDeviceDataChange("product_name")}
            error={!!errors.product_name}
            helperText={errors.product_name}
            fullWidth
          />
          <TextField
            select
            fullWidth
            label="Internet Service Provider"
            style={{ margin: "10px 0" }}
            value={newDevice.ISP}
            onChange={handleDeviceDataChange("ISP")}
            error={!!errors.ISP}
            helperText={errors.ISP}
            SelectProps={{
              native: true,
              style: { width: "100%", height: "50px" },
              MenuProps: {
                className: classes.menu,
              },
            }}
            variant="outlined"
          >
            <option value="" />
            <option value="MTN">MTN</option>
            <option value="Airtel">Airtel</option>
            <option value="Africell">Africell</option>
          </TextField>
          <TextField
            autoFocus
            margin="dense"
            label="Phone Number"
            variant="outlined"
            value={newDevice.phoneNumber}
            onChange={handleDeviceDataChange("phoneNumber")}
            error={!!errors.phoneNumber}
            helperText={errors.phoneNumber}
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
