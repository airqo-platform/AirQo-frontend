import React from 'react';
import { ApexChart, timeSeriesChartOptions } from 'views/charts';
import { createChartData } from './util';
import { ApexTimeSeriesData } from 'utils/charts';

const DeviceVoltageChart = ({ deviceUptimeData }) => {
  const deviceVoltage = createChartData(deviceUptimeData, {
    key: 'battery_voltage'
  });

  const batteryVoltageSeries = [
    {
      name: 'voltage',
      data: ApexTimeSeriesData(deviceVoltage.line.label, deviceVoltage.line.data)
    }
  ];

  const todaysDate = new Date().getTime();
  const minDate =  new Date();
  minDate.setDate(minDate.getDate()-1);

  const ChartOptions = {
    chart: {
      id: 'realtime',
      type: 'line',
      zoom: {
        enabled: true,
        autoScaleYaxis: true
      }
    },
    stroke: {
      curve: 'stepline',
      width: 1,
      breaks: {
        style: 'null'
      }
    },
    dataLabels:{
      enabled:false
    },
    xaxis: {
      type: 'datetime',
      min: minDate.getTime(),
      max: todaysDate,
      labels: {
        dateTimeUTC: false
      }
    },
    yaxis:{
      min:2.5,
      max:4.5,
      decimalsInFloat:2,
      tickAmount:5
    },
    grid: {
      row: {
        colors: ['#f3f3f3', 'transparent'],
        opacity: 0.5
      }
    },
    tooltip: {
      x: {
        format: 'dd MMM yyyy hh:mm:ss'
      }
    }
  };

  return (
    <ApexChart
      title={'battery voltage'}
      options={ChartOptions}
      series={batteryVoltageSeries}
      type="line"
      blue
    />
  );
};

export default DeviceVoltageChart;
