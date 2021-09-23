import React from "react";
import { ApexChart, timeSeriesChartOptions } from "views/charts";
import { createChartData } from "./util";
import { ApexTimeSeriesData } from "utils/charts";

const DeviceVoltageChart = ({ deviceUptimeData }) => {
  const deviceVoltage = createChartData(deviceUptimeData, {
    key: "battery_voltage",
  });

  const batteryVoltageSeries = [
    {
      name: "voltage",
      data: ApexTimeSeriesData(
        deviceVoltage.line.label,
        deviceVoltage.line.data
      ),
    },
  ];

  return (
    <ApexChart
      title={"battery voltage"}
      options={timeSeriesChartOptions({
        yaxis: {
          min: 0,
          max: 5,
        },
      })}
      series={batteryVoltageSeries}
      type="area"
      green
    />
  );
};

export default DeviceVoltageChart;
