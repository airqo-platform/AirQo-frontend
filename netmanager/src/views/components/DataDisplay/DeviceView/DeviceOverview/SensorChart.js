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
import { pearsonCorrelation } from "utils/statistics";

const DeviceSensorChart = ({ deviceName }) => {
  const dispatch = useDispatch();

  const deviceUptimeRawData = useDeviceUptimeData(deviceName);
  const sensor1 = createChartData(deviceUptimeRawData, {
    key: "sensor_one_pm2_5",
    // includeBarData: true,
  });
  const sensor2 = createChartData(deviceUptimeRawData, {
    key: "sensor_two_pm2_5",
    // includeBarData: true,
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
      title={"sensor correlation"}
      options={timeSeriesChartOptions}
      series={sensorCorrelationSeries}
      type="area"
      blue
      footerContent={
        <div >
        {/*<div className={classes.stats}>*/}
          Pearson Correlation Value:&nbsp;
          <b>
            {pearsonCorrelation(
              sensor1.line.data,
              sensor2.line.data
            ).toFixed(4)}
          </b>
        </div>
      }
    />
  );
};

export default DeviceSensorChart;
