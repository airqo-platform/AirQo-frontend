import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import AccessTime from "@material-ui/icons/AccessTime";
// core components
import Card from "../../Card/Card.js";
import { Map, TileLayer, Marker, Popup } from "react-leaflet";
import {
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Paper,
} from "@material-ui/core";

import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";

import palette from "assets/theme/palette";
import { Line, Bar } from "react-chartjs-2";
import "chartjs-plugin-annotation";
import { isEmpty } from "underscore";
import {
  loadDevicesData,
  loadDeviceUpTime,
  loadDeviceMaintenanceLogs,
  loadDeviceBatteryVoltage,
  loadDeviceSesnorCorrelation,
  loadDeviceComponentsData,
} from "redux/DeviceRegistry/operations";
import {
  useDevicesData,
  useDeviceUpTimeData,
  useDeviceLogsData,
  useDeviceBatteryVoltageData,
  useDeviceSensorCorrelationData,
  useDeviceComponentsData,
} from "redux/DeviceRegistry/selectors";

const useStyles = makeStyles(styles);

const BLANK_PLACE_HOLDER = "-";

export default function DeviceOverview({ deviceData }) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const devices = useDevicesData();
  const deviceUptime = useDeviceUpTimeData(deviceData.name);
  const deviceMaintenanceLogs = useDeviceLogsData(deviceData.name);
  const deviceBatteryVoltage = useDeviceBatteryVoltageData(deviceData.name);
  const deviceSensorCorrelation = useDeviceSensorCorrelationData(
    deviceData.name
  );
  const deviceComponents = useDeviceComponentsData(deviceData.name);

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

  useEffect(() => {
    if (isEmpty(devices)) {
      dispatch(loadDevicesData());
    }

    if (isEmpty(deviceUptime) && deviceData.name) {
      dispatch(loadDeviceUpTime(deviceData.name));
    }

    if (isEmpty(deviceMaintenanceLogs) && deviceData.name) {
      dispatch(loadDeviceMaintenanceLogs(deviceData.name));
    }

    if (isEmpty(deviceBatteryVoltage) && deviceData.name) {
      dispatch(loadDeviceBatteryVoltage(deviceData.name));
    }

    if (isEmpty(deviceSensorCorrelation) && deviceData.name) {
      dispatch(loadDeviceSesnorCorrelation(deviceData.name));
    }

    if (isEmpty(deviceComponents) && deviceData.name) {
      dispatch(loadDeviceComponentsData(deviceData.name));
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

  const batteryVoltageData = {
    labels: deviceBatteryVoltage.battery_voltage_labels || [],
    datasets: [
      {
        label: "Device Battery Voltage",
        data: deviceBatteryVoltage.battery_voltage_values || [],
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

  const deviceSensorCorrelationData = {
    labels: deviceSensorCorrelation.labels || [],
    datasets: [
      {
        label: "Sensor One PM2.5",
        data: deviceSensorCorrelation.sensor_one_values || [],
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

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-around",
      }}
    >
      <div className={"overview-item-container"} style={{ minWidth: "550px" }}>
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
                      <b>Name</b>
                    </TableCell>
                    <TableCell>
                      {deviceData.name || BLANK_PLACE_HOLDER}
                    </TableCell>
                  </TableRow>
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
                    <TableCell>
                      {deviceData.channelID || BLANK_PLACE_HOLDER}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <b>Owner</b>
                    </TableCell>
                    <TableCell>
                      {deviceData.owner || BLANK_PLACE_HOLDER}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <b>Manufacturer</b>
                    </TableCell>
                    <TableCell>
                      {deviceData.device_manufacturer || BLANK_PLACE_HOLDER}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <b>ISP</b>
                    </TableCell>
                    <TableCell>
                      {deviceData.ISP || BLANK_PLACE_HOLDER}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <b>Phone Number</b>
                    </TableCell>
                    <TableCell>
                      {(deviceData.phoneNumber &&
                        `0${deviceData.phoneNumber}`) ||
                        BLANK_PLACE_HOLDER}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <b>Read Key</b>
                    </TableCell>
                    <TableCell>
                      {deviceData.readKey || BLANK_PLACE_HOLDER}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <b>Write Key</b>
                    </TableCell>
                    <TableCell>
                      {deviceData.writeKey || BLANK_PLACE_HOLDER}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </Card>
      </div>

      <div className={"overview-item-container"} style={{ minWidth: "600px" }}>
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
                <Marker position={[deviceData.latitude, deviceData.longitude]}>
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
      </div>

      <div className={"overview-item-container"} style={{ minWidth: "550px" }}>
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
      </div>

      <div className={"overview-item-container"} style={{ minWidth: "600px" }}>
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
                  {deviceMaintenanceLogs.map((log, index) => (
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
          {deviceMaintenanceLogs.length <= 0 && (
            <span style={{ margin: "auto" }}>No maintenance logs</span>
          )}
        </Card>
      </div>

      <div className={"overview-item-container"} style={{ minWidth: "550px" }}>
        <h4 className={classes.cardTitleGreen}>Device Battery Voltage</h4>
        <Card className={classes.cardBody}>
          <p className={classes.cardCategoryWhite}>
            Average daily battery voltage in the past 28 days
          </p>
          <div className={classes.chartContainer}>
            <Line
              height={"410px"}
              data={batteryVoltageData}
              options={options_}
            />
          </div>
        </Card>
      </div>

      <div className={"overview-item-container"} style={{ minWidth: "600px" }}>
        <h4 className={classes.cardTitleBlue}>Sensor Correlation</h4>
        <Card className={classes.cardBody}>
          <p className={classes.cardCategoryWhite}>
            Daily sensor I and sensor II readings in the past 28 days
          </p>
          <div className={classes.chartContainer}>
            <Line
              height={"390px"}
              data={deviceSensorCorrelationData}
              options={options_sensor_correlation}
            />
          </div>
          <div className={classes.stats}>
            Pearson Correlation Value:{" "}
            <b>{deviceSensorCorrelation.correlation_value}</b>
          </div>
        </Card>
      </div>

      <div className={"overview-item-container"} style={{ minWidth: "550px" }}>
        <h4 className={classes.cardTitleBlue}>Device Components</h4>
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
                <TableBody style={{ alignContent: "left", alignItems: "left" }}>
                  {deviceComponents.map((component, index) => (
                    <TableRow key={index} style={{ align: "left" }}>
                      <TableCell>{component.description}</TableCell>
                      <TableCell>
                        {jsonArrayToString(component.measurement)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
          {deviceComponents.length <= 0 && (
            <span style={{ margin: "auto" }}>No components</span>
          )}
        </Card>
      </div>
    </div>
  );
}
