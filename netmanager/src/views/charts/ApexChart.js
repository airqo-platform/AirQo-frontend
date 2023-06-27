import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ReactApexChart from 'react-apexcharts';
import EditIcon from '@material-ui/icons/Edit';
import { TextField } from '@material-ui/core';
import RichTooltip from 'views/containers/RichToolTip';
import ChartContainer from './ChartContainer';
import ApexCharts from 'apexcharts';

const ApexChart = (props) => {
  const [chartType, setChartType] = useState(props.type);
  const [series, setSeries] = useState(props.series);
  const [options, setOptions] = useState(props.options);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (props.series && props.series.length > 0) {
      setSeries(props.series);
      setOptions(props.options);
      setChartType(props.type);

      const interval = setInterval(() => {
        updateChartData();

        ApexCharts.exec('realtime', 'updateSeries', [
          {
            data: series
          }
        ]);
      }, 30 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [props]);

  function updateChartData() {
    const newData = Math.random() * 100;
    const newSeries = series & (series.length > 0) && series.slice();

    const lastDataPoint =
      newSeries[0].data.length > 0 ? newSeries[0].data[newSeries[0].data.length - 1] : null;
    // Fill in missing data with 0 values
    if (lastDataPoint) {
      console.log('filling in');
      const timeSinceLastData = new Date().getTime() - lastDataPoint.x;
      const missingDataPoints = Math.floor(timeSinceLastData / (30 * 60 * 1000));
      for (let i = 1; i <= missingDataPoints; i++) {
        newSeries[0].data.push({
          x: lastDataPoint.x + i * 30 * 60 * 1000,
          y: 0
        });
      }
    }
    newSeries[0].data.push({
      x: new Date().getTime(),
      y: newData
    });
    setSeries(newSeries);
  }

  function onChartTypeChange(e) {
    e.preventDefault();
    const { value } = e.target;
    setOpen(false);
    setChartType(value);
  }

  return (
    <ChartContainer
      className={props.className}
      title={props.title}
      lastUpdated={props.lastUpdated}
      blue={props.blue}
      green={props.green}
      centerItems={props.centerItems}
      controller={
        !props.disableController && (
          <RichTooltip
            content={
              <div style={{ width: '200px' }}>
                <TextField
                  id="chartType"
                  select
                  fullWidth
                  label="Chart Type"
                  style={{ marginTop: '15px' }}
                  value={chartType}
                  onChange={onChartTypeChange}
                  SelectProps={{
                    native: true,
                    style: { width: '100%', height: '40px' }
                  }}
                  variant="outlined"
                >
                  <option value={'area'}>Area</option>
                  <option value={'line'}>Line</option>
                  <option value={'bar'}>Bar</option>
                  <option value={'radar'}>Radar</option>
                  <option value={'heatmap'}>Heatmap</option>
                </TextField>
                <TextField
                  id="range"
                  select
                  fullWidth
                  disabled
                  label="Range"
                  style={{ marginTop: '15px' }}
                  value={1}
                  onChange={() => {}}
                  SelectProps={{
                    native: true,
                    style: { width: '100%', height: '40px' }
                  }}
                  variant="outlined"
                >
                  <option value={'all'}>All</option>
                  <option value={'lastDay'}>Last day</option>
                  <option value={'lastWeek'}>Last week</option>
                </TextField>
              </div>
            }
            open={open}
            onClose={() => setOpen(false)}
            placement="bottom-end"
          >
            <EditIcon onClick={() => setOpen(!open)} />
          </RichTooltip>
        )
      }
      footerContent={props.footerContent}
    >
      <ReactApexChart
        key={chartType}
        options={options}
        series={series}
        type={chartType}
        height="320px"
      />
    </ChartContainer>
  );
};

ApexChart.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  options: PropTypes.object.isRequired,
  series: PropTypes.array.isRequired,
  lastUpdated: PropTypes.any,
  blue: PropTypes.bool,
  green: PropTypes.bool,
  centerItems: PropTypes.bool,
  footerContent: PropTypes.any,
  disableController: PropTypes.bool
};

export default ApexChart;
