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
import Table from "../Table/Table.js";
import Card from "../Card/Card.js";
import CardBody from "../Card/CardBody.js";
import CardFooter from "../Card/CardFooter.js";
import { isEmpty, mapObject, omit, values } from "underscore";
import Map from "./Map/Map";
import palette from "../../../assets/theme/palette";
import { Line, Pie } from "react-chartjs-2";
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

import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";
import "chartjs-plugin-annotation";
import "assets/scss/device-management.sass";

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
  const devicesStatusData = useDevicesStatusData();
  const allDevicesUptimeData = useDevicesUptimeData();
  const networkUptimeData = useNetworkUptimeData();
  const dispatch = useDispatch();
  const [devicesUptime, setDevicesUptime] = useState([]);
  const [devices, setDevices] = useState([]);
  const [filteredDevices, setFilteredDevices] = useState(devices);
  const [deviceFilters, setDeviceFilters] = useState(DEFAULT_DEVICE_FILTERS);
  const [pieChartStatusValues, setPieChartStatusValues] = useState([]);
  const [networkUptimeLineValues, setNetworkUptimeLineValues] = useState([
    [],
    [],
  ]);

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
    averageUptime.sort((device1, device2) => {
      if (device1.uptime < device2.uptime) return -1;
      if (device1.uptime > device2.uptime) return 1;
      return 0;
    });
    return averageUptime;
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
  }, []);

  useEffect(() => {
    let label = [];
    let values = [];
    if (isEmpty(networkUptimeData)) {
      return;
    }

    networkUptimeData.map((val) => {
      label.push(val.created_at.split("T")[0]);
      values.push(parseFloat(val.uptime).toFixed(2));
    });

    setNetworkUptimeLineValues([label, values]);
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
  }, [allDevicesUptimeData]);

  const uptimeData = {
    labels: networkUptimeLineValues[0],
    datasets: [
      {
        label: "Network Uptime",
        data: networkUptimeLineValues[1],
        fill: false,
        borderColor: palette.primary.main,
        backgroundColor: "#BCBD22",
      },
    ],
  };

  const optionsNetworkUptime = {
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
          <h4 className={classes.cardTitleBlue}>Network Uptime</h4>

          <Card className={classes.cardBody}>
            <div className={classes.chartContainer}>
              <Line
                height={"400px"}
                data={uptimeData}
                options={optionsNetworkUptime}
              />
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
          </h4>
          <Card className={classes.cardBody}>
            <CardBody>
              <div
                className={`m-device-uptime-row uptime-table-header`}
              >
                <span>device name</span>
                <span>downtime (%)</span>
                <span>uptime (%)</span>
              </div>
              {devicesUptime.map(({ deviceName, uptime }, index) => {
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
