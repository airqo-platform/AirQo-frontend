import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { makeStyles } from "@material-ui/core/styles";
import DevicesIcon from "@material-ui/icons/Devices";
import ReportProblem from "@material-ui/icons/ReportProblem";
import BatteryFullIcon from "@material-ui/icons/BatteryFull";
import AccessTime from "@material-ui/icons/AccessTime";
import RestoreIcon from "@material-ui/icons/Restore";
import WbSunnyIcon from "@material-ui/icons/WbSunny";
import PowerIcon from "@material-ui/icons/Power";
import Card from "../Card/Card.js";
import CardBody from "../Card/CardBody.js";
import CardFooter from "../Card/CardFooter.js";
import { isEmpty, mapObject, omit, values } from "underscore";
import Map from "./Map/Map";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  useDevicesStatusData,
  useDevicesUptimeData,
  useNetworkUptimeData,
} from "redux/DeviceManagement/selectors";
import {
  loadDevicesStatusData,
  loadNetworkUptimeData,
  loadAllDevicesUptimeData,
} from "redux/DeviceManagement/operations";
import {
  BarChartIcon,
  LineChartIcon,
  SortAscendingIcon,
  SortDescendingIcon,
} from "assets/img";
import { multiFilter } from "utils/filters";
import {
  createBarChartData,
  createChartData,
  createChartOptions,
} from "utils/charts";

import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import "chartjs-plugin-annotation";
import "assets/scss/device-management.sass";
import { useHistory, useLocation } from "react-router-dom";
import { updateDeviceBackUrl } from "redux/Urls/operations";

const useStyles = makeStyles(styles);

const DEFAULT_DEVICE_FILTERS = {
  all: true,
  due: true,
  overDue: true,
  solar: true,
  alternator: true,
  mains: true,
};

const DEVICE_FILTER_FIELDS = {
  all: {},
  due: { key: "maintenance_status", value: "due" },
  overDue: { key: "maintenance_status", value: "overdue" },
  solar: { key: "power", value: "Solar" },
  alternator: { key: "power", value: "Battery" },
  mains: { key: "power", value: "Mains" },
};

const OverviewCard = ({ label, icon, value, filterActive, onClick }) => {
  return (
    <div className={"card-container"} onClick={onClick}>
      <Card
        style={
          filterActive ? { margin: 0 } : { margin: 0, background: "#f2f2f2" }
        }
      >
        <div className={"card-title-wrapper"}>
          <span
            className={"card-title-icon"}
            style={filterActive ? {} : { background: "#6d94ea" }}
          >
            {icon}
          </span>
          <h3
            className={"card-title"}
            style={filterActive ? {} : { color: "#999" }}
          >
            {value}
          </h3>
          <div className={"card-divider"} />
          <p className={"card-category"}>{label}</p>
        </div>
      </Card>
    </div>
  );
};

export default function DeviceManagement() {
  const classes = useStyles();
  const history = useHistory();
  const location = useLocation();
  const devicesStatusData = useDevicesStatusData();
  const allDevicesUptimeData = useDevicesUptimeData();
  const networkUptimeData = useNetworkUptimeData();
  const dispatch = useDispatch();
  const [devicesUptime, setDevicesUptime] = useState([]);
  const [showBarChart, setShowBarChart] = useState(false);
  const [devicesUptimeDescending, setDevicesUptimeDescending] = useState(true);
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState(devices);
  const [deviceFilters, setDeviceFilters] = useState(DEFAULT_DEVICE_FILTERS);
  const [pieChartStatusValues, setPieChartStatusValues] = useState([]);
  const [networkUptimeDataset, setNetworkUptimeDataset] = useState({
    bar: { label: [], data: [] },
    line: { label: [], data: [] },
  });

  const updateDevices = (devices, newValues) => {
    const newDevices = [];
    (devices || []).map((device) => {
      newDevices.push({ ...device, ...newValues });
    });
    return newDevices;
  };

  const filterDevices = (devices, key) => {
    const filter = DEVICE_FILTER_FIELDS[key];
    if (key === "all") {
      return !deviceFilters[key] ? devices : [];
    }
    if (!deviceFilters[key]) {
      const prevFiltered = filteredDevices.filter(
        (device) => device[filter.key] !== filter.value
      );
      const filtered = devices.filter(
        (device) => device[filter.key] === filter.value
      );

      return [...prevFiltered, ...filtered];
    }

    const filtered = filteredDevices.filter(
      (device) => device[filter.key] !== filter.value
    );
    return filtered;
  };

  const toggleDeviceFilter = (key) => {
    if (key === "all") {
      if (!deviceFilters[key]) {
        return mapObject(deviceFilters, () => true);
      }
      return mapObject(deviceFilters, () => false);
    }
    const all = values(
      omit({ ...deviceFilters, [key]: !deviceFilters[key] }, "all")
    ).every((value) => value === true);

    return { ...deviceFilters, all, [key]: !deviceFilters[key] };
  };

  const handleDeviceFilterClick = (key) => () => {
    setFilteredDevices(filterDevices(devices, key));
    setDeviceFilters(toggleDeviceFilter(key));
  };

  const calculateAverageUptime = (devicesUptime) => {
    const keys = Object.keys(devicesUptime);
    const averageUptime = [];
    keys.map((deviceName) => {
      const deviceUptime = devicesUptime[deviceName];
      let uptimeSum = 0;
      deviceUptime.map((uptime) => {
        uptimeSum += uptime.uptime;
      });
      averageUptime.push({
        deviceName,
        uptime: uptimeSum / deviceUptime.length,
      });
    });
    // reverse sorting
    averageUptime.sort((device1, device2) => {
      if (device1.uptime < device2.uptime) return 1;
      if (device1.uptime > device2.uptime) return -1;
      return 0;
    });
    return averageUptime;
  };

  const handleNetworkUptimeClick = () => {
    setShowBarChart(!showBarChart);
  };

  const handleSortIconClick = () => {
    setDevicesUptime(devicesUptime.reverse());
    setDevicesUptimeDescending(!devicesUptimeDescending);
  };

  const handlePieChartClick = (event) => {
    const chartElement = event[0];
    if (chartElement === undefined) return;
    const onlineIndex = 1;
    setFilteredDevices(
      multiFilter(devices, { isOnline: chartElement._index === onlineIndex })
    );
    setDeviceFilters({ ...mapObject(deviceFilters, () => false), all: true });
  };

  useEffect(() => {
    if (isEmpty(devicesStatusData)) {
      dispatch(loadDevicesStatusData());
    }
    if (isEmpty(networkUptimeData)) {
      dispatch(loadNetworkUptimeData(28));
    }
    if (isEmpty(allDevicesUptimeData)) {
      dispatch(loadAllDevicesUptimeData(28));
    }
    dispatch(updateDeviceBackUrl(location.pathname));
  }, []);

  useEffect(() => {
    let lineLabel = [];
    let lineData = [];
    if (isEmpty(networkUptimeData)) {
      return;
    }
    networkUptimeData.sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );

    networkUptimeData.map((val) => {
      lineLabel.push(val.created_at.split("T")[0]);
      lineData.push(parseFloat(val.uptime).toFixed(2));
    });

    const barChartData = createBarChartData(
      networkUptimeData.reverse(),
      "uptime"
    );

    setNetworkUptimeDataset({
      line: { label: lineLabel, data: lineData },
      bar: { label: barChartData.label, data: barChartData.data },
    });
  }, [networkUptimeData]);

  useEffect(() => {
    const devices = [
      ...updateDevices(devicesStatusData.offline_devices, { isOnline: false }),
      ...updateDevices(devicesStatusData.online_devices, { isOnline: true }),
    ];
    setDevices(devices);
    setFilteredDevices(devices);
    setPieChartStatusValues([
      devicesStatusData.count_of_offline_devices,
      devicesStatusData.count_of_online_devices,
    ]);
  }, [devicesStatusData]);

  useEffect(() => {
    setDevicesUptime(calculateAverageUptime(allDevicesUptimeData));
    setDevicesUptimeDescending(true);
  }, [allDevicesUptimeData]);

  return (
    <div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-around",
          margin: "20px 0",
        }}
      >
        <OverviewCard
          label={"Devices on the network"}
          value={devicesStatusData.total_active_device_count}
          icon={<DevicesIcon />}
          filterActive={deviceFilters.all}
          onClick={handleDeviceFilterClick("all")}
        />

        <OverviewCard
          label={"Due for maintenance"}
          value={devicesStatusData.count_due_maintenance}
          icon={<RestoreIcon />}
          filterActive={deviceFilters.due}
          onClick={handleDeviceFilterClick("due")}
        />

        <OverviewCard
          label={"Overdue for maintenance"}
          value={devicesStatusData.count_overdue_maintenance}
          icon={<ReportProblem />}
          filterActive={deviceFilters.overDue}
          onClick={handleDeviceFilterClick("overDue")}
        />

        <OverviewCard
          label={"Solar powered"}
          value={devicesStatusData.count_of_solar_devices}
          icon={<WbSunnyIcon />}
          filterActive={deviceFilters.solar}
          onClick={handleDeviceFilterClick("solar")}
        />

        <OverviewCard
          label={"Alternator"}
          value={devicesStatusData.count_of_alternator_devices}
          icon={<BatteryFullIcon />}
          filterActive={deviceFilters.alternator}
          onClick={handleDeviceFilterClick("alternator")}
        />

        <OverviewCard
          label={"Mains Powered"}
          value={devicesStatusData.count_of_mains}
          icon={<PowerIcon />}
          filterActive={deviceFilters.mains}
          onClick={handleDeviceFilterClick("mains")}
        />
      </div>

      <div className={"map-container"}>
        <Card style={{ height: "100%" }}>
          <div style={{ height: "100%" }}>
            <Map devices={filteredDevices} />
          </div>
        </Card>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        <div
          className={"overview-item-container"}
          style={{ minWidth: "550px" }}
        >
          <h4 className={classes.cardTitleBlue}>
            Network Uptime{" "}
            <span style={{ fontSize: "1rem" }}>(last 28 days)</span>
            {showBarChart ? (
              <LineChartIcon
                className={"uptime-icon"}
                onClick={handleNetworkUptimeClick}
              />
            ) : (
              <BarChartIcon
                className={"uptime-icon"}
                onClick={handleNetworkUptimeClick}
              />
            )}
          </h4>

          <Card className={classes.cardBody}>
            <div className={classes.chartContainer}>
              {showBarChart ? (
                <Bar
                  height={"400px"}
                  data={createChartData(
                    networkUptimeDataset.bar.label,
                    networkUptimeDataset.bar.data,
                    "Network Uptime"
                  )}
                  options={createChartOptions("Time Period", "Uptime(%)")}
                />
              ) : (
                <Line
                  height={"400px"}
                  data={createChartData(
                    networkUptimeDataset.line.label,
                    networkUptimeDataset.line.data,
                    "Network Uptime"
                  )}
                  options={createChartOptions("Date", "Uptime(%)")}
                />
              )}
            </div>

            <div className={classes.stats}>
              <AccessTime /> Last updated{" "}
              {networkUptimeData.length > 0 && networkUptimeData[0].created_at}
            </div>
          </Card>
        </div>

        <div
          className={"overview-item-container"}
          style={{ minWidth: "550px" }}
        >
          <h4 className={classes.cardTitleGreen}>Online Status</h4>
          <Card className={classes.cardBody}>
            <div className={classes.chartContainer}>
              <Pie
                id="pie"
                height={"162px"}
                onElementsClick={handlePieChartClick}
                data={{
                  labels: ["Offline", "Online"],
                  datasets: [
                    {
                      label: "Device Status",
                      data: pieChartStatusValues,
                      backgroundColor: ["#BCBD22", "#17BECF"],
                    },
                  ],
                }}
                options={{
                  tooltips: {
                    callbacks: {
                      label: function (tooltipItem, data) {
                        var allData =
                          data.datasets[tooltipItem.datasetIndex].data;
                        var tooltipLabel = data.labels[tooltipItem.index];
                        var tooltipData = allData[tooltipItem.index];
                        var total = 0;
                        for (var i in allData) {
                          total += allData[i];
                        }
                        var tooltipPercentage = Math.round(
                          (tooltipData / total) * 100
                        );
                        return tooltipLabel + ": " + tooltipPercentage + "%";
                      },
                    },
                  },

                  maintainAspectRatio: true,
                  responsive: true,
                }}
              />
            </div>
            <CardFooter chart>
              <div className={classes.stats}>
                <AccessTime /> Last updated on {devicesStatusData.created_at}
              </div>
            </CardFooter>
          </Card>
        </div>

        <div
          className={"overview-item-container"}
          style={{ minWidth: "550px" }}
        >
          <h4 className={classes.cardTitleBlue}>
            Leaderboard <span style={{ fontSize: "1rem" }}>(last 28 days)</span>
            {devicesUptimeDescending ? (
              <SortDescendingIcon
                className={"uptime-icon"}
                onClick={handleSortIconClick}
              />
            ) : (
              <SortAscendingIcon
                className={"uptime-icon"}
                onClick={handleSortIconClick}
              />
            )}
          </h4>
          <Card className={classes.cardBody}>
            <CardBody>
              <div className={`m-device-uptime-row uptime-table-header`}>
                <span>device name</span>
                <span>downtime (%)</span>
                <span>uptime (%)</span>
              </div>
              {devicesUptime.map(({ deviceName, uptime }, index) => {
                uptime = uptime <= 100 ? uptime : 100;
                const style =
                  uptime >= 80
                    ? "uptime-success"
                    : uptime >= 50
                    ? "uptime-warning"
                    : "uptime-danger";
                return (
                  <div
                    className={`m-device-uptime-row`}
                    key={`device-${deviceName}-${index}`}
                    onClick={() =>
                      history.push(`/device/${deviceName}/overview`)
                    }
                  >
                    <span>{deviceName}</span>
                    <span>{(100 - uptime).toFixed(2)}</span>
                    <span className={`${style}`}>{uptime.toFixed(2)}</span>
                  </div>
                );
              })}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
