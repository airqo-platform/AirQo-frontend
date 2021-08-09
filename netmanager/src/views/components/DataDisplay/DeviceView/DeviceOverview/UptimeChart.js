import React from "react";
import { ApexChart, timeSeriesChartOptions } from "views/charts";
import { createChartData } from "./util";
import { ApexTimeSeriesData } from "utils/charts";

const DeviceUptimeChart = ({ deviceUptimeData }) => {
  const deviceUptime = createChartData(deviceUptimeData, {
    key: "uptime",
  });

  const deviceUptimeSeries = [
    {
      name: "uptime",
      data: ApexTimeSeriesData(deviceUptime.line.label, deviceUptime.line.data),
    },
  ];

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
