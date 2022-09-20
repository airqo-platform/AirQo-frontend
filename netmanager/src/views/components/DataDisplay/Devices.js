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
import ErrorBoundary from "views/ErrorBoundary/ErrorBoundary";

// css
import "assets/css/device-registry.css";
import { capitalize } from "../../../utils/string";

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
    title: "Device ID",
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
    field: "site.description",
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
          <span
            style={{
              color: data.status === "deployed" ? "green" : "red",
              textTransform: "capitalize",
            }}
          >
            {data.status}
          </span>
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
    generation_version: "",
    generation_count: "",
    category: "",
    status: "not deployed",
  };

  const initialErrors = {
    long_name: "",
    generation_version: "",
    generation_count: "",
    category: "",
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
            select
            margin="dense"
            variant="outlined"
            id="deviceType"
            label="Device Type"
            value={newDevice.category}
            onChange={handleDeviceDataChange("category")}
            SelectProps={{
              native: true,
              style: { width: "100%", height: "50px" },
            }}
            error={!!errors.mountType}
            helperText={errors.mountType}
            fullWidth
          >
            <option value="" />
            <option value="lowcost">Low Cost</option>
            <option value="bam">BAM</option>
          </TextField>
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
    <ErrorBoundary>
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
          isLoading={isEmpty(devices)}
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

        <CreateDevice open={registerOpen} setOpen={setRegisterOpen} />
        <ConfirmDialog
          open={delDevice.open}
          title={"Delete a device?"}
          message={`Are you sure you want to delete this ${delDevice.name} device`}
          close={() => setDelDevice({ open: false, name: "" })}
          confirm={handleDeleteDevice}
          error
        />
      </div>
    </ErrorBoundary>
  );
};

DevicesTable.propTypes = {
  className: PropTypes.string,
  users: PropTypes.array.isRequired,
};

export default DevicesTable;
