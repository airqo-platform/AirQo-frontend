import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import { Map, TileLayer, Marker, Popup } from "react-leaflet";
import {
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Paper,
} from "@material-ui/core";

import "chartjs-plugin-annotation";
import { isEmpty } from "underscore";
import {
  loadDeviceUpTime,
  loadDeviceMaintenanceLogs,
  loadDeviceComponentsData,
} from "redux/DeviceRegistry/operations";
import {
  useDeviceUpTimeData,
  useDeviceLogsData,
  useDeviceComponentsData,
} from "redux/DeviceRegistry/selectors";
import { ApexTimeSeriesData, createBarChartData } from "utils/charts";
import { pearsonCorrelation } from "utils/statistics";
import Copyable from "views/components/Copy/Copyable";
import {
  ApexChart,
  ChartContainer,
  timeSeriesChartOptions,
} from "views/charts";

// styles
import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";

const useStyles = makeStyles(styles);

const BLANK_PLACE_HOLDER = "-";

function jsonArrayToString(myJsonArray) {
  let myArray = [];
  for (let i = 0; i < myJsonArray.length; i++) {
    let myString =
      myJsonArray[i].quantityKind + "(" + myJsonArray[i].measurementUnit + ")";
    myArray.push(myString);
  }
  return myArray.join(", ");
}

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

const DeviceMaintenanceLogs = ({ deviceName }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const deviceMaintenanceLogs = useDeviceLogsData(deviceName);

  useEffect(() => {
    if (deviceName && isEmpty(deviceMaintenanceLogs)) {
      dispatch(loadDeviceMaintenanceLogs(deviceName));
    }
  }, []);

  return (
    <ChartContainer title={"maintenance history"} blue>
      {deviceMaintenanceLogs.length > 0 && (
        <TableContainer className={classes.table}>
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
      )}
      {deviceMaintenanceLogs.length <= 0 && <div>No maintenance logs</div>}
    </ChartContainer>
  );
};

DeviceMaintenanceLogs.protoTypes = {
  deviceName: PropTypes.string.isRequired,
};

const DeviceComponents = ({ deviceName }) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const deviceComponents = useDeviceComponentsData(deviceName);

  function goTo(path) {
    return history.push(`/device/${deviceName}/${path}`);
  }

  useEffect(() => {
    if (deviceName && isEmpty(deviceComponents)) {
      dispatch(loadDeviceComponentsData(deviceName));
    }
  }, []);

  return (
    <ChartContainer title={"device components"} blue centerItems>
      {deviceComponents.length > 0 && (
        <TableContainer className={classes.table}>
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
      )}
      {deviceComponents.length <= 0 && <div>No components</div>}
    </ChartContainer>
  );
};

DeviceComponents.protoTypes = {
  deviceName: PropTypes.string.isRequired,
};

export default function DeviceOverview({ deviceData }) {
  const classes = useStyles();
  const dispatch = useDispatch();
  const deviceStatus = useDeviceUpTimeData(deviceData.name);
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

  useEffect(() => {
    if (isEmpty(deviceStatus) && deviceData.name) {
      dispatch(loadDeviceUpTime(deviceData.name, { days: 28 }));
    }
  }, []);

  useEffect(() => {
    if (!isEmpty(deviceStatus)) {
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
        sensor1.push(
          parseFloat(parseFloat(status.sensor_one_pm2_5).toFixed(2))
        );
        sensor2.push(
          parseFloat(parseFloat(status.sensor_two_pm2_5).toFixed(2))
        );
      });
      data.reverse();
      const uptimeBarChartData = createBarChartData(data, "uptime");
      setDeviceUptime({
        line: { label, data: uptimeLineData },
        bar: { label: uptimeBarChartData.label, data: uptimeBarChartData.data },
      });
      setDeviceBatteryVoltage({ label, data: batteryVoltageData });
      setDeviceSensorCorrelation({ label, sensor1, sensor2 });
    }
  }, [deviceStatus]);

  const deviceUptimeSeries = [
    {
      name: "uptime",
      data: ApexTimeSeriesData(deviceUptime.line.label, deviceUptime.line.data),
    },
  ];

  const batteryVoltageSeries = [
    {
      name: "voltage",
      data: ApexTimeSeriesData(
        deviceBatteryVoltage.label,
        deviceBatteryVoltage.data
      ),
    },
  ];

  const sensorCorrelationSeries = [
    {
      name: "Sensor One PM2.5",
      data: ApexTimeSeriesData(
        deviceSensorCorrelation.label,
        deviceSensorCorrelation.sensor1
      ),
    },
    {
      name: "Sensor Two PM2.5",
      data: ApexTimeSeriesData(
        deviceSensorCorrelation.label,
        deviceSensorCorrelation.sensor2
      ),
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-around",
      }}
    >
      <ChartContainer title={"device details"} blue>
        <TableContainer component={Paper}>
          <Table stickyHeader aria-label="sticky table">
            <TableBody>
              <TableRow>
                <TableCell>
                  <b>Name</b>
                </TableCell>
                <TableCell>{deviceData.name || BLANK_PLACE_HOLDER}</TableCell>
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
                  <b>Device Number (Channel ID)</b>
                </TableCell>
                <TableCell>
                  {deviceData.device_number || BLANK_PLACE_HOLDER}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <b>Owner</b>
                </TableCell>
                <TableCell>{deviceData.owner || BLANK_PLACE_HOLDER}</TableCell>
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
                <TableCell>{deviceData.ISP || BLANK_PLACE_HOLDER}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <b>Phone Number</b>
                </TableCell>
                <TableCell>
                  {(deviceData.phoneNumber && `0${deviceData.phoneNumber}`) ||
                    BLANK_PLACE_HOLDER}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <b>Read Key</b>
                </TableCell>
                <TableCell>
                  <Copyable value={deviceData.readKey || BLANK_PLACE_HOLDER} />
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <b>Write Key</b>
                </TableCell>
                <TableCell>
                  <Copyable value={deviceData.writeKey || BLANK_PLACE_HOLDER} />
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </ChartContainer>

      <ChartContainer title={"device location"} green centerItems>
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
      </ChartContainer>

      <ApexChart
        title={"device uptime"}
        options={timeSeriesChartOptions}
        series={deviceUptimeSeries}
        lastUpdated={deviceUptime.created_at}
        type="area"
        blue
      />

      <DeviceMaintenanceLogs deviceName={deviceData.name} />

      <ApexChart
        title={"battery voltage"}
        options={timeSeriesChartOptions}
        series={batteryVoltageSeries}
        type="area"
        green
      />
      <ApexChart
        title={"sensor correlation"}
        options={timeSeriesChartOptions}
        series={sensorCorrelationSeries}
        type="area"
        blue
        footerContent={
          <div className={classes.stats}>
            Pearson Correlation Value:&nbsp;
            <b>
              {pearsonCorrelation(
                deviceSensorCorrelation.sensor1,
                deviceSensorCorrelation.sensor2
              ).toFixed(4)}
            </b>
          </div>
        }
      />

      <DeviceComponents deviceName={deviceData.name} />
    </div>
  );
}

DeviceOverview.propTypes = {
  deviceData: PropTypes.object.isRequired,
};
