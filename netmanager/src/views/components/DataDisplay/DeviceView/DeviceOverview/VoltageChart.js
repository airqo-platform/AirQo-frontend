import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { isEmpty } from "underscore";
import { ApexChart, timeSeriesChartOptions } from "views/charts";
import { createChartData } from "./util";
import { useDeviceUptimeData } from "redux/DeviceManagement/selectors";
import { loadDevicesUptimeData } from "redux/DeviceManagement/operations";
import { roundToEndOfDay, roundToStartOfDay } from "utils/dateTime";
import moment from "moment";
import { ApexTimeSeriesData } from "utils/charts";

const DeviceVoltageChart = ({ deviceName }) => {
  const dispatch = useDispatch();

  const deviceUptimeRawData = useDeviceUptimeData(deviceName);
  const deviceVoltage = createChartData(deviceUptimeRawData, {
    key: "battery_voltage",
    // includeBarData: true,
  });

  const batteryVoltageSeries = [
    {
      name: "voltage",
      data: ApexTimeSeriesData(deviceVoltage.line.label, deviceVoltage.line.data),
    },
  ];

  useEffect(() => {
    if (isEmpty(deviceUptimeRawData) && deviceName) {
      dispatch(
        loadDevicesUptimeData({
          startDate: roundToStartOfDay(
            moment(new Date()).subtract(28, "days").toISOString()
          ).toISOString(),
          endDate: roundToEndOfDay(new Date().toISOString()).toISOString(),
          device_name: deviceName,
        })
      );
    }
  }, []);
  return (
    <ApexChart
      title={"battery voltage"}
      options={timeSeriesChartOptions}
      series={batteryVoltageSeries}
      type="area"
      green
    />
  );
};

export default DeviceVoltageChart;
