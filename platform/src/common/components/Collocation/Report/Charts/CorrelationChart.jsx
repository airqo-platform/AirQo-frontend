import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import moment from 'moment';

const CorrelationChart = ({
  pmConcentration,
  hasCustomLegend,
  CustomLegend,
  data,
  isInterSensorCorrelation,
}) => {
  let newData = [];

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ca82cc']; // Colors for each line

  // Map through the data and create a Line component for each sensor in each device
  const plotSensorLines =
    isInterSensorCorrelation &&
    data.map((device, index) => {
      return Object.keys(device.data[0])
        .filter(
          (key) => key !== 'timestamp' && key !== 'device_name' && key.includes(pmConcentration),
        ) // Get all the sensor keys for the selected PM type
        .map((sensorKey, sensorIndex) => (
          <Line
            key={`${device.device_name}-${sensorKey}`}
            type='monotone'
            dataKey={sensorKey}
            stroke={colors[sensorIndex + index]}
            dot={false}
          />
        ));
    });

  if (!isInterSensorCorrelation) {
    data.map((item) => {
      newData.push({
        pm2_5_pearson_correlation: item.pm2_5_pearson_correlation,
        pm2_5_r2: item.pm2_5_r2,
        pm10_pearson_correlation: item.pm10_pearson_correlation,
        pm10_r2: item.pm10_r2,
        date: moment(item.timestamp).format('D MMM'),
      });
    });
  }

  return (
    <div className='w-full h-80'>
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart
          data={isInterSensorCorrelation ? data[0].data : newData}
          className='text-xs -ml-7'
        >
          <CartesianGrid vertical={false} stroke='#000000' strokeOpacity='0.1' strokeWidth={0.5} />
          <XAxis
            dataKey={isInterSensorCorrelation ? 'timestamp' : 'date'}
            tickFormatter={(date) => moment(date).format('D MMM')}
            padding={{ left: 60, right: 60 }}
            strokeWidth='0.5'
            stroke='#000000'
            strokeOpacity='0.1'
          />
          <YAxis
            axisLine={false}
            stroke='#000000'
            strokeOpacity='0.1'
            strokeWidth={0.5}
            tickMargin='-30'
          />
          <Tooltip />
          <Legend />

          {isInterSensorCorrelation ? (
            <>{plotSensorLines}</>
          ) : (
            <>
              <Line
                type='monotone'
                dot={false}
                dataKey={
                  pmConcentration === '2.5'
                    ? 'pm2_5_pearson_correlation'
                    : 'pm10_pearson_correlation'
                }
                stroke='#D476F5'
                strokeWidth='1.5'
                strokeDasharray='5 5'
              />
              <Line
                type='monotone'
                dot={false}
                dataKey={pmConcentration === '2.5' ? 'pm2_5_r2' : 'pm10_r2'}
                stroke='#8776F5'
                strokeWidth='1.5'
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CorrelationChart;
