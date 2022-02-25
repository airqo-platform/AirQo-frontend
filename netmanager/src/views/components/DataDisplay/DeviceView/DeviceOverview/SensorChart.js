import React from "react";
import { ApexChart, timeSeriesChartOptions } from "views/charts";
import { createChartData } from "./util";
import { ApexTimeSeriesData } from "utils/charts";
import { pearsonCorrelation } from "utils/statistics";

const DeviceSensorChart = ({ deviceUptimeData }) => {
  const sensor1 = createChartData(deviceUptimeData, {
    key: "sensor_one_pm2_5",
  });
  const sensor2 = createChartData(deviceUptimeData, {
    key: "sensor_two_pm2_5",
  });

  const sensorCorrelationSeries = [
    {
      name: "Sensor One PM2.5",
      data: ApexTimeSeriesData(sensor1.line.label, sensor1.line.data),
    },
    {
      name: "Sensor Two PM2.5",
      data: ApexTimeSeriesData(sensor2.line.label, sensor2.line.data),
    },
  ];

  return (
    <ApexChart
      title={"sensor correlation"}
      options={timeSeriesChartOptions()}
      series={sensorCorrelationSeries}
      type="area"
      green
      footerContent={
        <div>
          Pearson Correlation Value:&nbsp;
          <b>
            {pearsonCorrelation(sensor1.line.data, sensor2.line.data).toFixed(
              4
            )}
          </b>
        </div>
      }
    />
  );
};

export default DeviceSensorChart;
