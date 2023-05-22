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

const sortDataByTimestamp = (data) => {
  const dataArray = [...data];

  const sortedData = dataArray.sort((a, b) => {
    const timestampA = new Date(a.timestamp).getTime();
    const timestampB = new Date(b.timestamp).getTime();
    return timestampA - timestampB;
  });

  return sortedData;
};

const CorrelationChart = ({ pmConcentration, isInterSensorCorrelation, data, height }) => {
  const sensorKey1 = `s1_${pmConcentration === '2.5' ? 'pm2_5' : 'pm10'}`;
  const sensorKey2 = `s2_${pmConcentration === '2.5' ? 'pm2_5' : 'pm10'}`;

  const sortedData = sortDataByTimestamp(data);

  const devices = isInterSensorCorrelation
    ? Object.keys(sortedData[0]).filter((key) => key !== 'timestamp')
    : [Object.keys(sortedData[0])[1]]; // Gets the device names

  const renderLines = () => {
    const lines = [];

    devices.forEach((device, i) => {
      const color = colors[i % colors.length];

      lines.push(
        <Line
          key={`${device}_${sensorKey1}`}
          type='monotone'
          dataKey={`${device}.${sensorKey1}`}
          name='Sensor 01'
          stroke={color}
          dot={false}
          strokeWidth='1.5'
          isAnimationActive={false}
        />,
      );

      lines.push(
        <Line
          key={`${device}_${sensorKey2}`}
          type='monotone'
          dataKey={`${device}.${sensorKey2}`}
          name='Sensor 02'
          stroke={color}
          dot={false}
          strokeWidth='1.5'
          strokeDasharray='5 5'
          isAnimationActive={false}
        />,
      );
    });

    return lines;
  };

  const colors = ['#D476F5', '#8776F5']; // Colors for each line

  return (
    <div className={`w-full ${height ? `h-[${height}px]` : 'h-80'}`}>
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart data={sortedData} className='text-xs -ml-7'>
          <CartesianGrid vertical={false} stroke='#000000' strokeOpacity='0.1' strokeWidth={0.5} />
          <Legend />
          <XAxis
            dataKey={'timestamp'}
            tickFormatter={(timestamp, index) => {
              if (index % 24 === 0) {
                return moment(timestamp).format('DD MMM');
              }
              return '';
            }}
            padding={{ left: 60, right: 20 }}
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
          <Tooltip formatter={(value) => value.toFixed(2)} wrapperClassName='text-base' />

          {renderLines()}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CorrelationChart;
