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

const DeviceUptimeChart = ({ deviceName }) => {
  const dispatch = useDispatch();

  const deviceUptimeRawData = useDeviceUptimeData(deviceName);
  const deviceUptime = createChartData(deviceUptimeRawData, {
    key: "uptime",
    includeBarData: true,
  });

  const deviceUptimeSeries = [
    {
      name: "uptime",
      data: ApexTimeSeriesData(deviceUptime.line.label, deviceUptime.line.data),
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
      title={"device uptime"}
      options={timeSeriesChartOptions}
      series={deviceUptimeSeries}
      lastUpdated={deviceUptime.created_at}
      type="area"
      blue
    />
  );
};

export default DeviceUptimeChart;
