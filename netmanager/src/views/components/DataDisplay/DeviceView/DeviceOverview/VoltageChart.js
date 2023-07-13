import React, { useEffect, useState } from 'react';
import { ApexChart } from 'views/charts';
import { ApexTimeSeriesData } from 'utils/charts';
import { isEmpty } from 'underscore';

const DeviceVoltageChart = ({ deviceUptimeData, controllerChildren, controllerChildrenOpen }) => {
  const [series, setSeries] = useState([]);

  useEffect(() => {
    if (!isEmpty(deviceUptimeData)) {
      const updatedData = deviceUptimeData.map((object) => {
        return { ...object, created_at: object.timestamp };
      });

      const label = [];
      const values = [];

      updatedData.forEach((status) => {
        label.push(status.created_at);
        values.push(status['voltage']);
      });

      const deviceVoltage = { line: { label, data: values } };

      const batteryVoltageSeries = [
        {
          name: 'voltage',
          data: ApexTimeSeriesData(deviceVoltage.line.label, deviceVoltage.line.data)
        }
      ];

      setSeries(batteryVoltageSeries);
    }
  }, [deviceUptimeData]);

  const todaysDate = new Date().getTime();
  const minDate = new Date();
  minDate.setDate(minDate.getDate() - 1);

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
      width: 1.5,
      breaks: {
        style: 'null'
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      type: 'datetime',
      min: minDate.getTime(),
      max: todaysDate,
      labels: {
        dateTimeUTC: false
      },
      tickAmount: 4
    },
    yaxis: {
      min: 2.5,
      max: 4.5,
      decimalsInFloat: 2,
      tickAmount: 5
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
    <>
      <ApexChart
        title={'battery voltage'}
        options={ChartOptions}
        series={series}
        type="line"
        blue
        controllerChildren={controllerChildren}
      />
    </>
  );
};

export default DeviceVoltageChart;
