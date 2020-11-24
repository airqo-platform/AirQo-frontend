import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import ChartistGraph from "react-chartist";
import { makeStyles } from "@material-ui/core/styles";
import Icon from "@material-ui/core/Icon";
// @material-ui/icons
import DevicesIcon from "@material-ui/icons/Devices";
import AccessTime from "@material-ui/icons/AccessTime";
import BugReport from "@material-ui/icons/BugReport";
import Code from "@material-ui/icons/Code";
import Cloud from "@material-ui/icons/Cloud";
import RestoreIcon from "@material-ui/icons/Restore";
import WbSunnyIcon from "@material-ui/icons/WbSunny";
import PowerIcon from "@material-ui/icons/Power";
import NotificationsNoneIcon from "@material-ui/icons/NotificationsNone";
import ScheduleIcon from "@material-ui/icons/Schedule";
import TasksWithoutEdits from "../../Tasks/TasksWithoutEdits";
// core components
import GridItem from "../../Grid/GridItem.js";
import GridContainer from "../../Grid/GridContainer.js";
import FormControl from "@material-ui/core/FormControl";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
//import Table from "../Table/Table.js";
import Tasks from "../../Tasks/Tasks.js";
import CustomTabs from "../../CustomTabs/CustomTabs";
import Card from "../../Card/Card.js";
import CardHeader from "../../Card/CardHeader.js";
import CardIcon from "../../Card/CardIcon.js";
import CardBody from "../../Card/CardBody.js";
import CardFooter from "../../Card/CardFooter.js";
import { Map, TileLayer, Marker, Popup } from "react-leaflet";
import {
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
} from "@material-ui/core";
import { DeleteOutlined, EditOutlined } from "@material-ui/icons";
import Tooltip from "@material-ui/core/Tooltip";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import {
  Grid,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@material-ui/core";
import { bugs, website, server } from "../../../variables/general.js";
import {
  dailySalesChart,
  emailsSubscriptionChart,
  completedTasksChart,
  OnlineStatusChart,
} from "../../../variables/charts.js";

import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import constants from "../../../../config/constants";
import axios from "axios";
import palette from "../../../../assets/theme/palette";
import { Line, Bar, Pie } from "react-chartjs-2";
import "chartjs-plugin-annotation";
import Input from "@material-ui/core/Input";
import InputLabel from "@material-ui/core/InputLabel";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import MenuItem from "@material-ui/core/MenuItem";
import ListItemText from "@material-ui/core/ListItemText";
import { isEmpty } from "underscore";
import { DeviceToolBar } from "./DeviceToolBar";
import { getFilteredDevicesApi } from "../../../apis/deviceRegistry";
import {
  loadDevicesData,
  loadDeviceUpTime,
  loadDeviceMaintenanceLogs,
} from "redux/DeviceRegistry/operations";
import {
  useDevicesData,
  useDeviceUpTimeData,
  useDeviceLogsData,
} from "redux/DeviceRegistry/selectors";
import device from "../../../../redux/DeviceRegistry/reducers/device";

const useStyles = makeStyles(styles);

export default function DeviceOverview({ deviceData }) {
  // console.log("device data", deviceData);
  let params = useParams();
  const ITEM_HEIGHT = 48;
  const ITEM_PADDING_TOP = 8;
  const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 350,
      },
    },
  };

  const classes = useStyles();
  const dispatch = useDispatch();
  const devices = useDevicesData();
  const deviceUptime = useDeviceUpTimeData(deviceData.name);
  const deviceMaintenanceLogs = useDeviceLogsData(deviceData.name);
  const [maintenanceData, setMaintenanceData] = useState([]);

  function logs(name) {
    console.log(constants.DEVICE_MAINTENANCE_LOG_URI + name);
    axios.get(constants.DEVICE_MAINTENANCE_LOG_URI + name).then((res) => {
      const ref = res.data;
      console.log("Maintenance history data ...");
      console.log(ref);
      console.log(typeof ref);
      setMaintenanceData(ref);
    });
  }
  const [componentsData, setComponentsData] = useState([]);
  function getComponents(name) {
    console.log("getting components...");
    console.log(constants.GET_COMPONENTS_URI + name);
    axios
      .get(constants.GET_COMPONENTS_URI + name)
      .then((res) => {
        console.log("Components data ...");
        //console.log(res);
        const ref = res.data;
        console.log(ref.components);
        //console.log(typeof(ref.components));
        setComponentsData(ref.components);
      })
      .catch((error) => {
        console.log(error);
      });
  }
  function jsonArrayToString(myJsonArray) {
    let myArray = [];
    for (let i = 0; i < myJsonArray.length; i++) {
      let myString =
        myJsonArray[i].quantityKind +
        "(" +
        myJsonArray[i].measurementUnit +
        ")";
      myArray.push(myString);
    }
    return myArray.join(", ");
  }

  const [onlineStatusUpdateTime, setOnlineStatusUpdateTime] = useState();
  const [onlineStatusChart, setOnlineStatusChart] = useState({
    data: {},
    options: {},
  });
  const [deviceStatusValues, setDeviceStatusValues] = useState([]);

  useEffect(() => {
    axios
      .get(constants.GET_DEVICE_STATUS_FOR_PIECHART_DISPLAY)
      .then(({ data }) => {
        setDeviceStatusValues([
          data["data"]["offline_devices_percentage"],
          data["data"]["online_devices_percentage"],
        ]);

        setOnlineStatusUpdateTime(data["data"]["created_at"]);
      });
  }, []);

  const [networkUptime, setNetworkUptime] = useState([]);

  useEffect(() => {
    let channelID = deviceData.channelID;
    axios.get(constants.GET_DEVICE_UPTIME + channelID).then(({ data }) => {
      console.log(data);
      setNetworkUptime(data);
    });
  }, []);

  useEffect(() => {
    if (isEmpty(deviceUptime) && deviceData.name) {
      dispatch(loadDeviceUpTime(deviceData.name));
    }

    if (isEmpty(deviceMaintenanceLogs) && deviceData.name) {
      dispatch(loadDeviceMaintenanceLogs(deviceData.name));
    }
  }, []);

  const uptimeData = {
    labels: deviceUptime.uptime_labels || [],
    datasets: [
      {
        label: "Device Uptime",
        data: deviceUptime.uptime_values || [],
        fill: false,
        borderColor: palette.primary.main,
        backgroundColor: "#BCBD22",
      },
    ],
  };

  const options_main = {
    annotation: {
      annotations: [
        {
          type: "line",
          mode: "horizontal",
          scaleID: "y-axis-0",
          value: 80,
          borderColor: palette.text.secondary,
          borderWidth: 2,
          label: {
            enabled: true,
            content: "Threshold",
            //backgroundColor: palette.white,
            titleFontColor: palette.text.primary,
            bodyFontColor: palette.text.primary,
            position: "right",
          },
        },
      ],
    },
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    legend: { display: false },
    cornerRadius: 0,
    tooltips: {
      enabled: true,
      mode: "index",
      intersect: false,
      borderWidth: 1,
      borderColor: palette.divider,
      backgroundColor: palette.white,
      titleFontColor: palette.text.primary,
      bodyFontColor: palette.text.secondary,
      footerFontColor: palette.text.secondary,
    },
    layout: { padding: 0 },
    scales: {
      xAxes: [
        {
          barThickness: 35,
          //maxBarThickness: 10,
          barPercentage: 1,
          //categoryPercentage: 0.5,
          ticks: {
            fontColor: palette.text.secondary,
          },
          gridLines: {
            display: false,
            drawBorder: false,
          },
          scaleLabel: {
            display: true,
            labelString: "Time Periods",
          },
        },
      ],
      yAxes: [
        {
          ticks: {
            fontColor: palette.text.secondary,
            beginAtZero: true,
            min: 0,
          },
          gridLines: {
            borderDash: [2],
            borderDashOffset: [2],
            color: palette.divider,
            drawBorder: false,
            zeroLineBorderDash: [2],
            zeroLineBorderDashOffset: [2],
            zeroLineColor: palette.divider,
          },
          scaleLabel: {
            display: true,
            labelString: "Uptime(%)",
          },
        },
      ],
    },
  };

  const [deviceBatteryVoltage, setDeviceBatteryVoltage] = useState([]);

  useEffect(() => {
    let channelID = deviceData.channelID;
    axios
      .get(constants.GET_DEVICE_BATTERY_VOLTAGE + channelID)
      .then(({ data }) => {
        console.log(data);
        setDeviceBatteryVoltage(data);
      });
  }, []);

  const batteryVoltageData = {
    labels: deviceBatteryVoltage.battery_voltage_labels,
    datasets: [
      {
        label: "Device Battery Voltage",
        data: deviceBatteryVoltage.battery_voltage_values,
        fill: false,
        borderColor: palette.primary.main,
        backgroundColor: "#BCBD22",
      },
    ],
  };

  const options_ = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    legend: { display: false },
    cornerRadius: 0,
    tooltips: {
      enabled: true,
      mode: "index",
      intersect: false,
      borderWidth: 1,
      borderColor: palette.divider,
      backgroundColor: palette.white,
      titleFontColor: palette.text.primary,
      bodyFontColor: palette.text.secondary,
      footerFontColor: palette.text.secondary,
    },
    layout: { padding: 0 },
    scales: {
      xAxes: [
        {
          barThickness: 35,
          //maxBarThickness: 10,
          barPercentage: 1,
          //categoryPercentage: 0.5,
          ticks: {
            fontColor: palette.text.secondary,
          },
          gridLines: {
            display: false,
            drawBorder: false,
          },
          scaleLabel: {
            display: true,
            labelString: "Date",
          },
        },
      ],
      yAxes: [
        {
          ticks: {
            fontColor: palette.text.secondary,
            beginAtZero: true,
            min: 0,
          },
          gridLines: {
            borderDash: [2],
            borderDashOffset: [2],
            color: palette.divider,
            drawBorder: false,
            zeroLineBorderDash: [2],
            zeroLineBorderDashOffset: [2],
            zeroLineColor: palette.divider,
          },
          scaleLabel: {
            display: true,
            labelString: "Battery Voltage",
          },
        },
      ],
    },
  };

  const [deviceSensorCorrelation, setDeviceSensorCorrelation] = useState([]);

  useEffect(() => {
    let channelID = devices.channelID;
    axios
      .get(constants.GET_DEVICE_SENSOR_CORRELATION + channelID)
      .then(({ data }) => {
        setDeviceSensorCorrelation(data);
      });
  }, []);

  const deviceSensorCorrelationData = {
    labels: deviceSensorCorrelation.labels,
    datasets: [
      {
        label: "Sensor One PM2.5",
        data: deviceSensorCorrelation.sensor_one_values,
        fill: false,
        borderColor: palette.primary.main,
        backgroundColor: "#BCBD22",
      },
      {
        label: "Sensor Two PM2.5",
        data: deviceSensorCorrelation.sensor_two_values,
        fill: false,
        borderColor: palette.primary.main,
        backgroundColor: "#17BECF",
      },
    ],
  };

  const options_sensor_correlation = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    legend: { display: false },
    cornerRadius: 0,
    tooltips: {
      enabled: true,
      mode: "index",
      intersect: false,
      borderWidth: 1,
      borderColor: palette.divider,
      backgroundColor: palette.white,
      titleFontColor: palette.text.primary,
      bodyFontColor: palette.text.secondary,
      footerFontColor: palette.text.secondary,
    },
    layout: { padding: 0 },
    scales: {
      xAxes: [
        {
          barThickness: 35,
          //maxBarThickness: 10,
          barPercentage: 1,
          ticks: {
            fontColor: palette.text.secondary,
          },
          gridLines: {
            display: false,
            drawBorder: false,
          },
          scaleLabel: {
            display: true,
            labelString: "Date",
          },
        },
      ],
      yAxes: [
        {
          ticks: {
            fontColor: palette.text.secondary,
            beginAtZero: true,
            min: 0,
          },
          gridLines: {
            borderDash: [2],
            borderDashOffset: [2],
            color: palette.divider,
            drawBorder: false,
            zeroLineBorderDash: [2],
            zeroLineBorderDashOffset: [2],
            zeroLineColor: palette.divider,
          },
          scaleLabel: {
            display: true,
            labelString: "PM2.5(µg/m3)",
          },
        },
      ],
    },
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

  const [loaded, setLoaded] = useState(false);
  const [deviceName, setDeviceName] = useState("");

  const [componentData, setComponentData] = useState([]);

  useEffect(() => {
    if (isEmpty(devices)) {
      dispatch(loadDevicesData());
    }
  }, []);

  // useEffect(() => {
  //   setDeviceData(devices[params.deviceId] || {});
  // }, [devices]);

  //Edit dialog parameters
  const [editComponentOpen, setEditComponentOpen] = useState(false);
  const [componentName, setComponentName] = useState("");
  const [sensorName, setSensorName] = useState("");

  const [quantityKind, setQuantityKind] = useState([]);
  const handleQuantityKindChange = (quantity) => {
    console.log(quantity.target.value);
    setQuantityKind(quantity.target.value);
  };

  function convertQuantities(myArray) {
    console.log("Converting Quantities");
    for (let i = 0; i < myArray.length; i++) {
      //myArray[i].quantityKind = editDialogObject[myArray[i].quantityKind];
      console.log(myArray[i].quantityKind);
      //myArray[i].quantityKind = "Yes Please";
    }
    //console.log(myArray)
    return myArray;
  }
  const handleSensorNameChange = (name) => {
    setSensorName(name.target.value);
    if (name.target.value == "Alphasense OPC-N2") {
      setQuantityKind(["PM 1(µg/m3)", "PM 2.5(µg/m3)", "PM 10(µg/m3)"]);
    } else if (name.target.value == "pms5003") {
      setQuantityKind(["PM 2.5(µg/m3)", "PM 10(µg/m3)"]);
    } else if (name.target.value == "DHT11") {
      setQuantityKind(["Internal Temperature(\xB0C)", "Internal Humidity(%)"]);
    } else if (name.target.value == "Lithium Ion 18650") {
      setQuantityKind(["Battery Voltage(V)"]);
    } else if (name.target.value == "Generic") {
      setQuantityKind(["GPS"]);
    } else if (name.target.value == "Purple Air II") {
      setQuantityKind(["PM 1(µg/m3)"]);
    } else if (name.target.value == "Bosch BME280") {
      setQuantityKind(["External Temperature(\xB0C)", "External Humidity(%)"]);
    } else {
      setQuantityKind([]);
    }
  };

  const quantityOptions = [
    "PM 1(µg/m3)",
    "PM 2.5(µg/m3)",
    "PM 10(µg/m3)",
    "External Temperature(\xB0C)",
    "External Temperature(\xB0F)",
    "External Humidity(%)",
    "Internal Temperature(\xB0C)",
    "Internal Humidity(%)",
    "Battery Voltage(V)",
    "GPS",
  ];

  const convertQuantityOptions = (myArray) => {
    let newArray = [];
    for (let i = 0; i < myArray.length; i++) {
      if (myArray[i] == "PM 1(µg/m3)") {
        newArray.push({ quantityKind: "PM 1", measurementUnit: "µg/m3" });
      } else if (myArray[i] == "PM 2.5(µg/m3)") {
        newArray.push({ quantityKind: "PM 2.5", measurementUnit: "µg/m3" });
      } else if (myArray[i] == "PM 10(µg/m3)") {
        newArray.push({ quantityKind: "PM 10", measurementUnit: "µg/m3" });
      } else if (myArray[i] == "External Temperature(\xB0C)") {
        newArray.push({
          quantityKind: "External Temperature",
          measurementUnit: "\xB0C",
        });
      } else if (myArray[i] == "External Temperature(\xB0F)") {
        newArray.push({
          quantityKind: "External Temperature",
          measurementUnit: "\xB0F",
        });
      } else if (myArray[i] == "External Humidity(%)") {
        newArray.push({
          quantityKind: "External Humidity",
          measurementUnit: "%",
        });
      } else if (myArray[i] == "Internal Temperature(\xB0C)") {
        newArray.push({
          quantityKind: "Internal Temperature",
          measurementUnit: "\xB0C",
        });
      } else if (myArray[i] == "Internal Humidity(%)") {
        newArray.push({
          quantityKind: "Internal Humidity",
          measurementUnit: "%",
        });
      } else if (myArray[i] == "Battery Voltage(V)") {
        newArray.push({
          quantityKind: "Battery Voltage",
          measurementUnit: "V",
        });
      } else if (myArray[i] == "GPS") {
        newArray.push({ quantityKind: "GPS", measurementUnit: "coordinates" });
      } else {
        newArray.push({ quantityKind: "unknown", measurementUnit: "unknown" });
      }
    }
    return newArray;
  };

  const handleEditComponentOpen = () => {
    setEditComponentOpen(true);
  };
  const handleEditComponentClose = () => {
    setEditComponentOpen(false);
    //setComponentName('');
  };
  let handleEditComponentClick = (name, id, component, quantity) => {
    return (event) => {
      console.log(name);
      setDeviceName(name);
      setComponentName(id);
      setSensorName(component);
      setQuantityKind(quantity);
      handleEditComponentOpen();
    };
  };

  let handleEditComponentSubmit = (e) => {
    let filter = {
      description: sensorName, //e.g. pms5003
      measurement: convertQuantityOptions(quantityKind), //e.g. [{"quantityKind":"humidity", "measurementUnit":"%"}]
    };
    console.log(JSON.stringify(filter));
    console.log(
      constants.UPDATE_COMPONENT_URI + deviceName + "&comp=" + componentName
    );

    axios
      .put(
        constants.UPDATE_COMPONENT_URI + deviceName + "&comp=" + componentName,
        JSON.stringify(filter),
        { headers: { "Content-Type": "application/json" } }
      )
      .then((res) => {
        const myData = res.data;
        //console.log(myData.message);
        setDialogResponseMessage("Component successfully updated");
        handleEditComponentClose();
        setResponseOpen(true);
        getComponents(deviceName);
      })
      .catch((error) => {
        //console.log(error.message)
        setDialogResponseMessage("An error occured. Please try again");
        handleEditComponentClose();
        setResponseOpen(true);
      });
  };

  //delete  dialog parameters
  const [deleteOpen, setDeleteOpen] = useState(false);
  const handleDeleteOpen = () => {
    setDeleteOpen(true);
  };
  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setComponentName("");
  };
  //response dialog
  const [dialogResponseMessage, setDialogResponseMessage] = useState("");
  const [responseOpen, setResponseOpen] = useState(false);
  const handleResponseOpen = () => {
    setResponseOpen(true);
  };
  const handleResponseClose = () => {
    setResponseOpen(false);
  };

  //opens dialog to delete a component
  const handleDeleteComponentClick = (name) => {
    return (event) => {
      console.log("Deleting component " + name);
      setComponentName(name);
      handleDeleteOpen();
    };
  };
  let handleDeleteSubmit = (e) => {
    let filter = {
      deviceName: deviceName,
      componentName: componentName,
    };
    console.log(JSON.stringify(filter));
    console.log(
      constants.DELETE_COMPONENT_URI + componentName + "&device=" + deviceName
    );

    axios
      .delete(
        constants.DELETE_COMPONENT_URI +
          componentName +
          "&device=" +
          deviceName,
        JSON.stringify(filter),
        { headers: { "Content-Type": "application/json" } }
      )
      .then((res) => {
        console.log("Response returned");
        const myData = res.data;
        console.log(myData.message);
        setDialogResponseMessage("Component successfully deleted");
        handleDeleteClose();
        setResponseOpen(true);
        getComponents(deviceName);
      })
      .catch((error) => {
        setDialogResponseMessage("An error occured. Please try again");
        handleDeleteClose();
        setResponseOpen(true);
      });
  };

  return (
    <div>
      <GridContainer>
        <GridItem xs={12} sm={12} md={4}>
          <h4 className={classes.cardTitleBlue}>Device Details</h4>
          <Card className={classes.cardBody}>
            <div
              alignContent="left"
              style={{ alignContent: "left", alignItems: "left" }}
            >
              <TableContainer component={Paper}>
                <Table stickyHeader aria-label="sticky table">
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <b>Deployment status</b>
                      </TableCell>
                      <TableCell>
                        {deviceData.isActive ? (
                          <span style={{ color: "green" }}>Deployed</span>
                        ) : (
                          <span style={{ color: "red" }}>Not deployed</span>
                        )}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <b>Channel</b>
                      </TableCell>
                      <TableCell>{deviceData.channelID}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <b>Owner</b>
                      </TableCell>
                      <TableCell>{deviceData.owner}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <b>Manufacturer</b>
                      </TableCell>
                      <TableCell>{deviceData.device_manufacturer}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <b>ISP</b>
                      </TableCell>
                      <TableCell>{deviceData.ISP}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <b>Phone Number</b>
                      </TableCell>
                      <TableCell>
                        {deviceData.phoneNumber && `0${deviceData.phoneNumber}`}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <b>Read Key</b>
                      </TableCell>
                      <TableCell>{deviceData.readKey}</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <b>Write Key</b>
                      </TableCell>
                      <TableCell>{deviceData.writeKey}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </Card>
        </GridItem>

        <GridItem xs={12} sm={12} md={4}>
          <h4 className={classes.cardTitleGreen}>Device Location</h4>
          <Paper>
            <Card className={classes.cardBody}>
              {deviceData.latitude && deviceData.longitude ? (
                <Map
                  center={[deviceData.latitude, deviceData.longitude]}
                  zoom={13}
                  scrollWheelZoom={false}
                  style={{ width: "100%" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker
                    position={[deviceData.latitude, deviceData.longitude]}
                  >
                    <Popup>
                      <span>
                        <span>{deviceData.name}</span>
                      </span>
                    </Popup>
                  </Marker>
                </Map>
              ) : (
                <span style={{ margin: "auto" }}>
                  Coordinates not set for this device
                </span>
              )}
            </Card>
          </Paper>
        </GridItem>

        <GridItem xs={12} sm={12} md={4}>
          <h4 className={classes.cardTitleBlue}>Device Uptime</h4>
          <Card className={classes.cardBody}>
            <div className={classes.chartContainer}>
              <Bar height={"410px"} data={uptimeData} options={options_main} />
            </div>
            <div className={classes.stats}>
              <AccessTime />
              <span>
                Last updated <b>{deviceUptime.created_at || ""}</b>
              </span>
            </div>
          </Card>
        </GridItem>
      </GridContainer>

      <GridContainer>
        <GridItem xs={12} sm={12} md={4}>
          <h4 className={classes.cardTitleBlue}>Maintenance History</h4>
          <Card className={classes.cardBody}>
            <div
              alignContent="left"
              style={{ alignContent: "left", alignItems: "left" }}
            >
              <TableContainer component={Paper} className={classes.table}>
                <Table
                  stickyHeader
                  aria-label="sticky table"
                  alignItems="left"
                  alignContent="left"
                >
                  <TableBody>
                    {deviceMaintenanceLogs.slice(0, 8).map((log, index) => (
                      <TableRow key={index}>
                        <TableCell>{formatDate(new Date(log.date))}</TableCell>
                        <TableCell>
                          {typeof log.tags === "string"
                            ? log.tags
                            : log.tags && log.tags.join(", ")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          </Card>
        </GridItem>

        <GridItem xs={12} sm={12} md={4}>
          <h4 className={classes.cardTitleGreen}>Device Battery Voltage</h4>
          <Card className={classes.cardBody}>
            {/*<CardHeader color="info">*/}

            {/*  <p className={classes.cardCategoryWhite}>*/}
            {/*    Average daily battery voltage in the past 28 days*/}
            {/*  </p>*/}
            {/*</CardHeader>*/}
            {/*<CardBody>*/}
            <div className={classes.chartContainer}>
              <Line height={250} data={batteryVoltageData} options={options_} />
            </div>
            {/*</CardBody>*/}
            {/*<CardFooter chart>*/}
            {/*  <div className={classes.stats}>*/}
            {/*    /!*<AccessTime /> Last updated on {onlineStatusUpdateTime} *!/*/}
            {/*  </div>*/}
            {/*</CardFooter>*/}
          </Card>
        </GridItem>

        <GridItem xs={12} sm={12} md={4}>
          <Card>
            <CardHeader color="primary">
              <h4 className={classes.cardTitleWhite}>Sensor Correlation</h4>
              <p className={classes.cardCategoryWhite}>
                Daily sensor I and sensor II readings in the past 28 days
              </p>
            </CardHeader>
            <CardBody>
              <div className={classes.chartContainer}>
                <Line
                  height={250}
                  data={deviceSensorCorrelationData}
                  options={options_sensor_correlation}
                />
              </div>
            </CardBody>
            <CardFooter chart>
              <div className={classes.stats}>
                Pearson Correlation Value:{" "}
                {deviceSensorCorrelation.correlation_value}
              </div>
            </CardFooter>
          </Card>
        </GridItem>
      </GridContainer>

      <GridContainer>
        <GridItem xs={12} sm={12} md={4}>
          <Card>
            <CardHeader color="info">
              <h4 className={classes.cardTitle}>Device Components</h4>
            </CardHeader>
            <CardBody>
              <div
                alignContent="left"
                style={{ alignContent: "left", alignItems: "left" }}
              >
                <TableContainer component={Paper} className={classes.table}>
                  <Table
                    stickyHeader
                    aria-label="sticky table"
                    alignItems="left"
                    alignContent="left"
                  >
                    <TableHead>
                      <TableRow style={{ align: "left" }}>
                        <TableCell>Description</TableCell>
                        <TableCell>Quantities</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody
                      style={{ alignContent: "left", alignItems: "left" }}
                    >
                      {componentsData.map((component) => (
                        <TableRow style={{ align: "left" }}>
                          <TableCell>{component.description}</TableCell>
                          <TableCell>
                            {jsonArrayToString(component.measurement)}
                          </TableCell>
                          <TableCell>
                            <Tooltip title="Edit">
                              <Link
                                onClick={handleEditComponentClick(
                                  deviceName,
                                  component.name,
                                  component.description,
                                  jsonArrayToString(
                                    component.measurement
                                  ).split(", ")
                                )}
                                style={{ color: "black" }}
                              >
                                <EditOutlined> </EditOutlined>
                              </Link>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <Link
                                onClick={handleDeleteComponentClick(
                                  component.name
                                )}
                                style={{ color: "black" }}
                              >
                                <DeleteOutlined> </DeleteOutlined>
                              </Link>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </div>
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>

      {responseOpen ? (
        <Dialog
          open={responseOpen}
          onClose={handleResponseClose}
          aria-labelledby="form-dialog-title"
          aria-describedby="form-dialog-description"
        >
          <DialogContent>{dialogResponseMessage}</DialogContent>

          <DialogActions>
            <Grid
              container
              alignItems="center"
              alignContent="center"
              justify="center"
            >
              <Button
                variant="contained"
                color="primary"
                onClick={handleResponseClose}
              >
                {" "}
                OK
              </Button>
            </Grid>
          </DialogActions>
        </Dialog>
      ) : null}

      {deleteOpen ? (
        <Dialog
          open={deleteOpen}
          onClose={handleDeleteClose}
          aria-labelledby="form-dialog-title"
          aria-describedby="form-dialog-description"
        >
          <DialogTitle
            id="form-dialog-title"
            style={{ alignContent: "center" }}
          >
            Delete a component
          </DialogTitle>

          <DialogContent>
            Are you sure you want to delete component {componentName} from
            device {deviceName}?
          </DialogContent>

          <DialogActions>
            <Grid
              container
              alignItems="center"
              alignContent="center"
              justify="center"
            >
              <Button
                variant="contained"
                color="primary"
                onClick={handleDeleteSubmit}
              >
                {" "}
                YES
              </Button>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <Button
                variant="contained"
                color="primary"
                onClick={handleDeleteClose}
              >
                {" "}
                NO
              </Button>
            </Grid>
          </DialogActions>
        </Dialog>
      ) : null}

      {editComponentOpen ? (
        <Dialog
          open={editComponentOpen}
          onClose={handleEditComponentClose}
          aria-labelledby="form-dialog-title"
          aria-describedby="form-dialog-description"
          classes={{ paper: classes.paper }}
          //style = {{ minWidth: "500px" }}
        >
          <DialogTitle
            id="form-dialog-title"
            style={{ alignContent: "center" }}
          >
            Edit a component
          </DialogTitle>
          <DialogContent>
            <div>
              <TextField
                id="deviceName"
                label="Device Name"
                value={deviceName}
                fullWidth={true}
                required
                //onChange={handleDeviceNameChange}
              />{" "}
              <br />
              <FormControl required fullWidth={true}>
                <InputLabel htmlFor="demo-dialog-native">
                  {" "}
                  Component Name
                </InputLabel>
                <Select
                  native
                  value={sensorName}
                  onChange={handleSensorNameChange}
                  input={<Input id="demo-dialog-native" />}
                >
                  <option aria-label="None" value="" />
                  <option value="Alphasense OPC-N2">Alphasense OPC-N2</option>
                  <option value="pms5003">pms5003</option>
                  <option value="DHT11">DHT11</option>
                  <option value="Lithium Ion 18650">Lithium Ion 18650</option>
                  <option value="Generic">Generic</option>
                  <option value="Purple Air II">Purple Air II</option>
                  <option value="Bosch BME280">Bosch BME280</option>
                </Select>
              </FormControl>
              <br />
              <FormControl
                required
                className={classes.formControl}
                fullWidth={true}
              >
                <InputLabel htmlFor="demo-dialog-native">
                  Quantity Measured
                </InputLabel>
                <Select
                  multiple
                  value={quantityKind}
                  onChange={handleQuantityKindChange}
                  input={<Input />}
                  renderValue={(selected) => selected.join(", ")}
                  MenuProps={MenuProps}
                >
                  <option aria-label="None" value="" />
                  {quantityOptions.map((quantity) => (
                    <MenuItem key={quantity} value={quantity}>
                      <Checkbox checked={quantityKind.indexOf(quantity) > -1} />
                      <ListItemText primary={quantity} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <br />
            </div>
          </DialogContent>

          <DialogActions>
            <Grid
              container
              alignItems="center"
              alignContent="center"
              justify="center"
            >
              <Button
                variant="contained"
                color="primary"
                onClick={handleEditComponentSubmit}
              >
                {" "}
                Update
              </Button>
              &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              <Button
                variant="contained"
                color="primary"
                onClick={handleEditComponentClose}
              >
                {" "}
                Cancel
              </Button>
            </Grid>
          </DialogActions>
        </Dialog>
      ) : null}
    </div>
  );
}
