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
      options={timeSeriesChartOptions({
        yaxis: {
          min: 0,
          max: 100,
        },
      })}
      series={deviceUptimeSeries}
      lastUpdated={deviceUptime.created_at}
      type="area"
      green
    />
  );
};

export default DeviceUptimeChart;
