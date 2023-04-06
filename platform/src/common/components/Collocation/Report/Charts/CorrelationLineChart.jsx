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

const CorrelationChart = ({ pmConcentration, isInterSensorCorrelation, data, height }) => {
  const sensorKey1 = `s1_${pmConcentration === '2.5' ? 'pm2_5' : 'pm10'}`;
  const sensorKey2 = `s2_${pmConcentration === '2.5' ? 'pm2_5' : 'pm10'}`;

  const devices = isInterSensorCorrelation
    ? Object.keys(data[0]).filter((key) => key !== 'timestamp')
    : [Object.keys(data[0])[1]]; // Gets the device names

  const renderLines = () => {
    const lines = [];

    devices.forEach((device, i) => {
      const color = colors[i % colors.length];

      lines.push(
        <Line
          key={`${device}_${sensorKey1}`}
          type='monotone'
          dataKey={`${device}.${sensorKey1}`}
          name={`${sensorKey1} - ${device}`}
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
          name={`${sensorKey2} - ${device}`}
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
        <LineChart data={data} className='text-xs -ml-7'>
          <CartesianGrid vertical={false} stroke='#000000' strokeOpacity='0.1' strokeWidth={0.5} />
          <XAxis
            dataKey={'timestamp'}
            tickFormatter={(timestamp) => moment(timestamp).format('D MMM')}
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

          {renderLines()}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CorrelationChart;
