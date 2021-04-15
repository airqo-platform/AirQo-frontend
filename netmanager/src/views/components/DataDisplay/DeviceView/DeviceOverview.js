import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
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
  loadDeviceComponentsData,
} from "redux/DeviceRegistry/operations";
import {
  useDevicesData,
  useDeviceUpTimeData,
  useDeviceLogsData,
  useDeviceComponentsData,
} from "redux/DeviceRegistry/selectors";
import {
  createBarChartData,
  createChartData,
  createChartOptions,
} from "utils/charts";
import { BarChartIcon, LineChartIcon } from "assets/img";
import { pearsonCorrelation } from "utils/statistics";
import Copyable from "views/components/Copy/Copyable";

const useStyles = makeStyles(styles);

const BLANK_PLACE_HOLDER = "-";

export default function DeviceOverview({ deviceData }) {
  const classes = useStyles();
  const history = useHistory();
  const dispatch = useDispatch();
  const devices = useDevicesData();
  const deviceStatus = useDeviceUpTimeData(deviceData.name);
  const [showBarChart, setShowBarChart] = useState(false);
  const [deviceUptime, setDeviceUptime] = useState({
    bar: { label: [], data: [] },
    line: { label: [], data: [] },
  });
  const [deviceBatteryVoltage, setDeviceBatteryVoltage] = useState({
    label: [],
    data: [],
  });
  const [deviceSensorCorrelation, setDeviceSensorCorrelation] = useState({
    label: [],
    sensor1: [],
    sensor2: [],
  });
  const deviceMaintenanceLogs = useDeviceLogsData(deviceData.name);
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

    if (isEmpty(deviceStatus) && deviceData.name) {
      dispatch(loadDeviceUpTime(deviceData.name, { days: 28 }));
    }

    if (isEmpty(deviceMaintenanceLogs) && deviceData.name) {
      dispatch(loadDeviceMaintenanceLogs(deviceData.name));
    }

    if (isEmpty(deviceComponents) && deviceData.name) {
      dispatch(loadDeviceComponentsData(deviceData.name));
    }
  }, []);

  useEffect(() => {
    if (isEmpty(deviceStatus)) {
      return;
    }

    const data = deviceStatus.data;
    const label = [];
    const uptimeLineData = [];
    const batteryVoltageData = [];
    const sensor1 = [];
    const sensor2 = [];
    data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    data.map((status) => {
      label.push(status.created_at.split("T")[0]);
      uptimeLineData.push(parseFloat(status.uptime).toFixed(2));
      batteryVoltageData.push(parseFloat(status.battery_voltage).toFixed(2));
      sensor1.push(parseFloat(parseFloat(status.sensor_one_pm2_5).toFixed(2)));
      sensor2.push(parseFloat(parseFloat(status.sensor_two_pm2_5).toFixed(2)));
    });
    data.reverse();
    const uptimeBarChartData = createBarChartData(data, "uptime");
    setDeviceUptime({
      line: { label, data: uptimeLineData },
      bar: { label: uptimeBarChartData.label, data: uptimeBarChartData.data },
    });
    setDeviceBatteryVoltage({ label, data: batteryVoltageData });
    setDeviceSensorCorrelation({ label, sensor1, sensor2 });
  }, [deviceStatus]);

  const deviceSensorCorrelationData = {
    labels: deviceSensorCorrelation.label,
    datasets: [
      {
        label: "Sensor One PM2.5",
        data: deviceSensorCorrelation.sensor1,
        fill: false,
        borderColor: palette.primary.main,
        backgroundColor: "#BCBD22",
      },
      {
        label: "Sensor Two PM2.5",
        data: deviceSensorCorrelation.sensor2,
        fill: false,
        borderColor: palette.primary.main,
        backgroundColor: "#17BECF",
      },
    ],
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

  function goTo(path) {
    return history.push(`/device/${deviceData.name}/${path}`);
  }

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-around",
      }}
    >
      <div className={"overview-item-container"} style={{ minWidth: "300px" }}>
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
                      <Copyable
                        value={deviceData.readKey || BLANK_PLACE_HOLDER}
                      />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>
                      <b>Write Key</b>
                    </TableCell>
                    <TableCell>
                      <Copyable
                        value={deviceData.writeKey || BLANK_PLACE_HOLDER}
                      />
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </Card>
      </div>

      <div className={"overview-item-container"} style={{ minWidth: "300px" }}>
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

      <div className={"overview-item-container"} style={{ minWidth: "300px" }}>
        <h4 className={classes.cardTitleBlue}>
          Uptime <span style={{ fontSize: "1rem" }}>(last 28 days)</span>
          {showBarChart ? (
            <LineChartIcon
              className={"uptime-icon"}
              onClick={() => setShowBarChart(!showBarChart)}
            />
          ) : (
            <BarChartIcon
              className={"uptime-icon"}
              onClick={() => setShowBarChart(!showBarChart)}
            />
          )}
        </h4>
        <Card className={classes.cardBody}>
          <div className={classes.chartContainer}>
            {showBarChart ? (
              <Bar
                height={"410px"}
                data={createChartData(
                  deviceUptime.bar.label,
                  deviceUptime.bar.data,
                  "Device Uptime"
                )}
                options={createChartOptions("Time Period", "Uptime(%)", {
                  threshold: 80,
                })}
              />
            ) : (
              <Line
                height={"410px"}
                data={createChartData(
                  deviceUptime.line.label,
                  deviceUptime.line.data,
                  "Device Uptime"
                )}
                options={createChartOptions("Time Period", "Uptime(%)", {
                  threshold: 80,
                })}
              />
            )}
          </div>
          <div className={classes.stats}>
            <AccessTime />
            <span>
              Last updated <b>{deviceUptime.created_at || ""}</b>
            </span>
          </div>
        </Card>
      </div>

      <div className={"overview-item-container"} style={{ minWidth: "300px" }}>
        <h4 className={classes.cardTitleBlue}>Maintenance History</h4>
        <Card
          className={classes.cardBody}
          style={{ cursor: "pointer" }}
          onClick={() => goTo("maintenance-logs")}
        >
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

      <div className={"overview-item-container"} style={{ minWidth: "300px" }}>
        <h4 className={classes.cardTitleGreen}>
          Battery Voltage{" "}
          <span style={{ fontSize: "1rem" }}>(last 28 days)</span>
        </h4>
        <Card className={classes.cardBody}>
          <div className={classes.chartContainer}>
            <Line
              height={"410px"}
              data={createChartData(
                deviceBatteryVoltage.label,
                deviceBatteryVoltage.data,
                "Device Voltage"
              )}
              options={createChartOptions("Date", "Voltage")}
            />
          </div>
        </Card>
      </div>

      <div className={"overview-item-container"} style={{ minWidth: "300px" }}>
        <h4 className={classes.cardTitleBlue}>
          Sensor Correlation{" "}
          <span style={{ fontSize: "1rem" }}>(last 28 days)</span>
        </h4>
        <Card className={classes.cardBody}>
          <div className={classes.chartContainer}>
            <Line
              height={"410px"}
              data={deviceSensorCorrelationData}
              options={createChartOptions("Date", "PM2.5(µg/m3)")}
            />
          </div>
          <div className={classes.stats}>
            Pearson Correlation Value:&nbsp;
            <b>
              {pearsonCorrelation(
                deviceSensorCorrelation.sensor1,
                deviceSensorCorrelation.sensor2
              ).toFixed(4)}
            </b>
          </div>
        </Card>
      </div>

      <div className={"overview-item-container"} style={{ minWidth: "300px" }}>
        <h4 className={classes.cardTitleBlue}>Device Components</h4>
        <Card className={classes.cardBody} onClick={() => goTo("components")}>
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
                style={{ cursor: "pointer" }}
                onClick={() => goTo("components")}
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
