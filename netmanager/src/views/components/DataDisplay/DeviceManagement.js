import React, { useState, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import DevicesIcon from "@material-ui/icons/Devices";
import ReportProblem from "@material-ui/icons/ReportProblem";
import BatteryFullIcon from "@material-ui/icons/BatteryFull";
import RestoreIcon from "@material-ui/icons/Restore";
import WbSunnyIcon from "@material-ui/icons/WbSunny";
import PowerIcon from "@material-ui/icons/Power";
import Hidden from "@material-ui/core/Hidden";
import Tooltip from "@material-ui/core/Tooltip";
import Card from "../Card/Card.js";
import { isEmpty, mapObject, omit, values } from "underscore";
import Map from "./Map/Map";
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
import { multiFilter } from "utils/filters";
import { createBarChartData, ApexTimeSeriesData } from "utils/charts";
import { updateDeviceBackUrl } from "redux/Urls/operations";
import {
  ApexChart,
  ChartContainer,
  timeSeriesChartOptions,
  createPieChartOptions,
} from "views/charts";
import { roundToStartOfDay, roundToEndOfDay } from "utils/dateTime";

import { SortAscendingIcon, SortDescendingIcon } from "assets/img";

// css style
import "chartjs-plugin-annotation";
import "assets/scss/device-management.sass";
import "assets/css/device-view.css"; // there are some shared styles here too :)

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

const OverviewCardMini = ({ label, icon, value, filterActive, onClick }) => {
  return (
    <Tooltip title={label}>
      <div className={"card-container-mini"} onClick={onClick}>
        <Card
          style={
            filterActive
              ? { margin: 0, borderRadius: 0 }
              : { margin: 0, background: "#f2f2f2", borderRadius: 0 }
          }
        >
          <div className={"card-title-wrapper-mini"}>
            <span
              className={"card-title-icon-mini"}
              style={filterActive ? {} : { background: "#6d94ea" }}
            >
              {icon}
            </span>
            <h3
              className={"card-title-mini"}
              style={filterActive ? {} : { color: "#999" }}
            >
              {value}
            </h3>
          </div>
        </Card>
      </div>
    </Tooltip>
  );
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

  const cardsData = [
    {
      label: "Devices on the network",
      value: devicesStatusData.total_active_device_count,
      icon: <DevicesIcon />,
      filterActive: deviceFilters.all,
      onClick: handleDeviceFilterClick("all"),
    },
    {
      label: "Due for maintenance",
      value: devicesStatusData.count_due_maintenance,
      icon: <RestoreIcon />,
      filterActive: deviceFilters.due,
      onClick: handleDeviceFilterClick("due"),
    },
    {
      label: "Overdue for maintenance",
      value: devicesStatusData.count_overdue_maintenance,
      icon: <ReportProblem />,
      filterActive: deviceFilters.overDue,
      onClick: handleDeviceFilterClick("overDue"),
    },
    {
      label: "Solar powered",
      value: devicesStatusData.count_of_solar_devices,
      icon: <WbSunnyIcon />,
      filterActive: deviceFilters.solar,
      onClick: handleDeviceFilterClick("solar"),
    },
    {
      label: "Alternator",
      value: devicesStatusData.count_of_alternator_devices,
      icon: <BatteryFullIcon />,
      filterActive: deviceFilters.alternator,
      onClick: handleDeviceFilterClick("alternator"),
    },
    {
      label: "Mains Powered",
      value: devicesStatusData.count_of_mains,
      icon: <PowerIcon />,
      filterActive: deviceFilters.mains,
      onClick: handleDeviceFilterClick("mains"),
    },
  ];

  useEffect(() => {
    if (isEmpty(devicesStatusData)) {
      dispatch(
        loadDevicesStatusData({
          startDate: roundToStartOfDay(new Date().toISOString()).toISOString(),
          endDate: roundToEndOfDay(new Date().toISOString()).toISOString(),
          limit: 1,
        })
      );
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

  const series = [
    {
      name: "uptime",
      data: ApexTimeSeriesData(
        networkUptimeDataset.line.label,
        networkUptimeDataset.line.data
      ),
    },
  ];

  return (
    <div className={"container-wrapper"}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          margin: "20px 0",
        }}
      >
        <Hidden mdDown>
          {cardsData.map((data, key) => {
            return (
              <OverviewCard
                label={data.label}
                value={data.value}
                icon={data.icon}
                filterActive={data.filterActive}
                onClick={data.onClick}
                key={key}
              />
            );
          })}
        </Hidden>
        <Hidden lgUp>
          {cardsData.map((data, key) => {
            return (
              <OverviewCardMini
                label={data.label}
                value={data.value}
                icon={data.icon}
                filterActive={data.filterActive}
                onClick={data.onClick}
                key={key}
              />
            );
          })}
        </Hidden>
      </div>

      <div className={"map-container"}>
        <Map devices={filteredDevices} />
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ApexChart
          options={timeSeriesChartOptions}
          title={"Network uptime"}
          series={series}
          lastUpdated={
            networkUptimeData.length > 0 && networkUptimeData[0].created_at
          }
          type="area"
          blue
        />
        <ApexChart
          options={createPieChartOptions(
            ["#BCBD22", "#17BECF"],
            ["Offline", "Online"]
          )}
          series={pieChartStatusValues}
          title={"online status"}
          lastUpdated={devicesStatusData.created_at}
          type="pie"
          green
          centerItems
          disableController
        />

        <ChartContainer
          title={"leaderboard"}
          controller={
            devicesUptimeDescending ? (
              <SortAscendingIcon
                onClick={handleSortIconClick}
                style={{ fill: "white" }}
              />
            ) : (
              <SortDescendingIcon
                onClick={handleSortIconClick}
                style={{ fill: "white" }}
              />
            )
          }
          blue
        >
          <div>
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
                  onClick={() => history.push(`/device/${deviceName}/overview`)}
                >
                  <span>{deviceName}</span>
                  <span>{(100 - uptime).toFixed(2)}</span>
                  <span className={`${style}`}>{uptime.toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </ChartContainer>
      </div>
    </div>
  );
}
