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

const CorrelationChart = ({ pmConcentration, isInterSensorCorrelation, data }) => {
  const sensorKey1 = `s1_${pmConcentration === '2.5' ? 'pm2_5' : 'pm10'}`;
  const sensorKey2 = `s2_${pmConcentration === '2.5' ? 'pm2_5' : 'pm10'}`;

  let dummyData = [
    {
      timestamp: '2023-01-21T00:00:00.000Z',
      aq_g4_100: { s1_pm10: 70, s1_pm2_5: 58, s2_pm10: 76, s2_pm2_5: 60 },
      aq_g5_6: { s1_pm10: 80, s1_pm2_5: 68, s2_pm10: 86, s2_pm2_5: 70 },
    },
    {
      timestamp: '2023-01-23T00:00:00.000Z',
      aq_g4_100: { s1_pm10: 71, s1_pm2_5: 59, s2_pm10: 77, s2_pm2_5: 61 },
      aq_g5_6: { s1_pm10: 81, s1_pm2_5: 69, s2_pm10: 87, s2_pm2_5: 71 },
    },
    {
      timestamp: '2023-01-25T00:00:00.000Z',
      aq_g4_100: { s1_pm10: 72, s1_pm2_5: 60, s2_pm10: 78, s2_pm2_5: 62 },
      aq_g5_6: { s1_pm10: 82, s1_pm2_5: 70, s2_pm10: 88, s2_pm2_5: 72 },
    },
  ];

  const devices = isInterSensorCorrelation
    ? Object.keys(dummyData[0]).filter((key) => key !== 'timestamp')
    : [Object.keys(dummyData[0])[1]];

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

  const colors = [
    '#8884d8',
    '#82ca9d',
    '#ff7300',
    '#413ea0',
    '#ff0000',
    '#00ff00',
    '#0000ff',
    '#ffff00',
    '#00ffff',
    '#ff00ff',
  ]; // Colors for each line

  return (
    <div className='w-full h-80'>
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart data={dummyData} className='text-xs -ml-7'>
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
