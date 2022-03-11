import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import DevicesIcon from "@material-ui/icons/Devices";
import ReportProblem from "@material-ui/icons/ReportProblem";
import BatteryFullIcon from "@material-ui/icons/BatteryFull";
import RestoreIcon from "@material-ui/icons/Restore";
import WbSunnyIcon from "@material-ui/icons/WbSunny";
import PowerIcon from "@material-ui/icons/Power";
import Hidden from "@material-ui/core/Hidden";
import Tooltip from "@material-ui/core/Tooltip";
import Card from "views/components/Card/Card";
import moment from "moment";
import { isEmpty, mapObject, omit, values } from "underscore";
import {
  useDevicesStatusData,
  useNetworkUptimeData,
  useManagementFilteredDevicesData,
  useActiveFiltersData,
} from "redux/DeviceManagement/selectors";
import {
  loadDevicesStatusData,
  loadNetworkUptimeData,
  updateFilteredDevicesData,
  updateActiveFilters,
} from "redux/DeviceManagement/operations";
import { updateDeviceBackUrl } from "redux/Urls/operations";
import { loadDevicesData } from "redux/DeviceRegistry/operations";
import { useDevicesData } from "redux/DeviceRegistry/selectors";
import { roundToStartOfDay, roundToEndOfDay } from "utils/dateTime";

import { useInitScrollTop } from "utils/customHooks";
import MapBoxMap from "../Map/MapBoxMap";

import ErrorBoundary from "views/ErrorBoundary/ErrorBoundary";

// css style
import "chartjs-plugin-annotation";
import "assets/scss/device-management.sass";
import "assets/css/device-view.css"; // there are some shared styles here too :)

const DEVICE_FILTER_FIELDS = {
  all: {},
  due: { key: "maintenance_status", value: "due" },
  overDue: { key: "maintenance_status", value: "overdue" },
  solar: { key: "powerType", value: "solar" },
  alternator: { key: "powerType", value: "alternator" },
  mains: { key: "powerType", value: "mains" },
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

export default function ManagementMap() {
  useInitScrollTop();
  const location = useLocation();
  const devicesStatusData = useDevicesStatusData();
  const networkUptimeData = useNetworkUptimeData();
  const activeFilters = useActiveFiltersData();
  const allDevices = useDevicesData();
  const dispatch = useDispatch();
  const [devices, setDevices] = useState([]);
  const filteredDevices = useManagementFilteredDevicesData();
  const deviceFilters = activeFilters.main;

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

    return filteredDevices.filter(
      (device) => device[filter.key] !== filter.value
    );
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
    dispatch(updateFilteredDevicesData(filterDevices(devices, key)));
    dispatch(updateActiveFilters({ main: toggleDeviceFilter(key) }));
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
      dispatch(
        loadNetworkUptimeData({
          startDate: roundToStartOfDay(
            moment(new Date()).subtract(28, "days").toISOString()
          ).toISOString(),
          endDate: roundToEndOfDay(new Date().toISOString()).toISOString(),
        })
      );
    }

    if (isEmpty(allDevices)) dispatch(loadDevicesData());

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
      lineLabel.push(val.created_at);
      lineData.push(parseFloat(val.uptime).toFixed(2));
    });
  }, [networkUptimeData]);

  useEffect(() => {
    const devices = [
      ...updateDevices(devicesStatusData.offline_devices, { isOnline: false }),
      ...updateDevices(devicesStatusData.online_devices, { isOnline: true }),
    ];
    setDevices(devices);
  }, [devicesStatusData]);

  return (
    <ErrorBoundary>
      <div className={"map-container-wrapper"}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            position: "absolute",
            width: "100%",
            zIndex: 20,
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
        <MapBoxMap />
      </div>
    </ErrorBoundary>
  );
}
