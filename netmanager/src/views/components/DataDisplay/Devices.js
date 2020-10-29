import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import MaterialTable from "material-table";
import clsx from "clsx";
import PropTypes from "prop-types";
import PerfectScrollbar from "react-perfect-scrollbar";
import axios from "axios";
import { useHistory } from "react-router-dom";
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
import { loadDevicesData } from "redux/DeviceRegistry/operations";
import { useDevicesData } from "redux/DeviceRegistry/selectors";
import { useLocationsData } from "redux/LocationRegistry/selectors";
import { loadLocationsData } from "redux/LocationRegistry/operations";
import { generatePaginateOptions } from "utils/pagination";
import { updateMainAlert } from "redux/MainAlert/operations";


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
    margin: "15px 0"
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
    margin: "20px 0"
  },
  button: {
    margin: "10px",
    width: "60px"
  },
  textFieldMargin: {
    margin: "15 0"
  },
  tableWrapper: {
    '& tbody>.MuiTableRow-root:hover': {
      background: '#EEE',
      cursor: "pointer",
    }
  },
}));

const DevicesTable = (props) => {
  const { className, users, ...rest } = props;
  const classes = useStyles();

  const history = useHistory();
  const dispatch = useDispatch();
  const devices = useDevicesData();
  const locations = useLocationsData();
  const [isLoading, setIsLoading] = useState(false);

  const [registerOpen, setRegisterOpen] = useState(false);
  const handleRegisterOpen = () => {
    setRegisterOpen(true);
  };
  const handleRegisterClose = () => {
    setRegisterOpen(false);
    setRegisterName("");
    setVisibility("");
    setManufacturer("");
    setProductName("");
    setOwner("");
    setISP("");
    setPhone(null);
    setDescription("");
  };

  useEffect(() => {
    if(isEmpty(devices)) {
      setIsLoading(true);
      dispatch(loadDevicesData());
      setIsLoading(false);
    }
    if (isEmpty(locations)) {
      dispatch(loadLocationsData())
    }
  }, []);

  const [registerName, setRegisterName] = useState("");
  const handleRegisterNameChange = (name) => {
    setRegisterName(name.target.value);
  };
  const [manufacturer, setManufacturer] = useState("");
  const handleManufacturerChange = (manufacturer) => {
    setManufacturer(manufacturer.target.value);
  };
  const [productName, setProductName] = useState("");
  const handleProductNameChange = (name) => {
    setProductName(name.target.value);
  };
  const [owner, setOwner] = useState("");
  const handleOwnerChange = (name) => {
    setOwner(name.target.value);
  };
  const [description, setDescription] = useState("");
  const handleDescriptionChange = (event) => {
    setDescription(event.target.value);
  };
  const [visibility, setVisibility] = useState(false);
  const handleVisibilityChange = (event) => {
    setVisibility(event.target.value);
  };
  const [ISP, setISP] = useState("");
  const handleISPChange = (event) => {
    setISP(event.target.value);
  };

  const [phone, setPhone] = useState(null);
  const handlePhoneChange = (event) => {
    let re = /\s*|\d+(\.d+)?/;
    if (re.test(event.target.value)) {
      setPhone(event.target.value);
    }
  };

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


  let handleRegisterSubmit = (e) => {
    console.log("Registering");
    let filter = {
      name: registerName,
      visibility: visibility,
      device_manufacturer: manufacturer,
      product_name: productName,
      owner: owner,
      ISP: ISP,
      phoneNumber: phone,
      description: description,
    };
    console.log(JSON.stringify(filter));

    axios
      .post(constants.REGISTER_DEVICE_URI, JSON.stringify(filter), {
        headers: { "Content-Type": "application/json" },
      })
        .then(res => res.data)
      .then((resData) => {
          dispatch(updateMainAlert({
            message: resData.message,
            show: true,
            severity: "success"
          }));
          dispatch(loadDevicesData());
      })
      .catch((error) => {
        dispatch(updateMainAlert({
            message: error.response.data.message,
            show: true,
            severity: "error"
          }));
      });
    handleRegisterClose();
  };

  return (
    <div className={classes.root}>
      <br />
      <Grid container alignItems="right" alignContent="right" justify="center">
        <Button
          variant="contained"
          color="primary"
          type="submit"
          align="right"
          onClick={handleRegisterOpen}
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
              <MaterialTable
                className={classes.table}
                title="Device Registry"
                columns={[
                  {
                    title: "Device Name",
                    field: "name",
                    cellStyle: { fontFamily: "Open Sans" },
                  },
                  {
                    title: "Description",
                    field: "description",
                    cellStyle: { fontFamily: "Open Sans" },
                  },
                  {
                    title: "Device ID",
                    field: "channelID",
                    cellStyle: { fontFamily: "Open Sans" },
                  }, //should be channel ID
                  {
                    title: "Registration Date",
                    field: "createdAt",
                    cellStyle: { fontFamily: "Open Sans" },
                    render: (rowData) =>
                      formatDate(new Date(rowData.createdAt)),
                  },
                  {
                    title: "Location ID",
                    field: "locationID",
                    cellStyle: { fontFamily: "Open Sans" },
                  },
                ]}
                data={Object.values(devices)}
                onRowClick={((evt, selectedRow) => {
                    const rowData = Object.values(devices)[selectedRow.tableData.id];
                    history.push(`/device/${rowData.id}/overview`)
                })}
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
                  pageSizeOptions: generatePaginateOptions(Object.values(devices).length),
                  pageSize: 10,
                }}
              />
              </div>
            </PerfectScrollbar>
          </CardContent>
        </Card>
      </LoadingOverlay>


      <Dialog
        open={registerOpen}
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
              id="deviceName"
              value={registerName}
              onChange={handleRegisterNameChange}
              label="Device Name"
              fullWidth
            />
            <TextField
              id="standard-basic"
              className={classes.textFieldMargin}
              label="Description"
              value={description}
              onChange={handleDescriptionChange}
              fullWidth
              required
            />
            <TextField
              id="standard-basic"
              label="Manufacturer"
              value={manufacturer}
              onChange={handleManufacturerChange}
              fullWidth
            />
            <TextField
              id="standard-basic"
              label="Product Name"
              value={productName}
              onChange={handleProductNameChange}
              fullWidth
            />
            <FormControl required fullWidth>
              <InputLabel htmlFor="demo-dialog-native">
                Data Access
              </InputLabel>
              <Select
                required
                native
                value={visibility}
                onChange={handleVisibilityChange}
                inputProps={{
                  native: true,
                  style: {height: "40px", marginTop: "10px"},
                }}
              >
                <option value={true}>True</option>
                <option value={false}>False</option>
              </Select>
            </FormControl>
            <TextField
              required
              id="standard-basic"
              label="Owner"
              value={owner}
              onChange={handleOwnerChange}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel htmlFor="demo-dialog-native">
                Internet Service Provider
              </InputLabel>
              <Select
                native
                value={ISP}
                onChange={handleISPChange}
                inputProps={{
                  native: true,
                  style: {height: "40px", marginTop: "10px"},
                }}
              >
                <option aria-label="None" value="" />
                <option value="MTN">MTN</option>
                <option value="Africell">Africell</option>
                <option value="Airtel">Airtel</option>
              </Select>
            </FormControl>
            <TextField
              id="standard-basic"
              label="Phone Number"
              value={phone}
              onChange={handlePhoneChange}
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
              style={{margin: "0 15px"}}
            >
              Register
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
