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

const CorrelationChart = ({ pmConcentration, hasCustomLegend, CustomLegend }) => {
  const data = [
    {
      date: '2022-01-01',
      pm2_5_pearson_correlation: 0.87,
      pm2_5_r2: 0.75,
      pm10_pearson_correlation: 0.92,
      pm10_r2: 0.85,
    },
    {
      date: '2022-01-02',
      pm2_5_pearson_correlation: 0.81,
      pm2_5_r2: 0.66,
      pm10_pearson_correlation: 0.89,
      pm10_r2: 0.77,
    },
    {
      date: '2022-01-03',
      pm2_5_pearson_correlation: 0.95,
      pm2_5_r2: 0.9,
      pm10_pearson_correlation: 0.83,
      pm10_r2: 0.7,
    },
    {
      date: '2022-01-04',
      pm2_5_pearson_correlation: 0.89,
      pm2_5_r2: 0.79,
      pm10_pearson_correlation: 0.94,
      pm10_r2: 0.89,
    },
    {
      date: '2022-01-05',
      pm2_5_pearson_correlation: 0.78,
      pm2_5_r2: 0.58,
      pm10_pearson_correlation: 0.91,
      pm10_r2: 0.81,
    },
    {
      date: '2022-01-06',
      pm2_5_pearson_correlation: 0.92,
      pm2_5_r2: 0.84,
      pm10_pearson_correlation: 0.97,
      pm10_r2: 0.95,
    },
    {
      date: '2022-01-07',
      pm2_5_pearson_correlation: 0.86,
      pm2_5_r2: 0.73,
      pm10_pearson_correlation: 0.88,
      pm10_r2: 0.76,
    },
    {
      date: '2022-01-08',
      pm2_5_pearson_correlation: 0.97,
      pm2_5_r2: 0.94,
      pm10_pearson_correlation: 0.92,
      pm10_r2: 0.83,
    },
    {
      date: '2022-01-09',
      pm2_5_pearson_correlation: 0.8,
      pm2_5_r2: 0.64,
      pm10_pearson_correlation: 0.86,
      pm10_r2: 0.74,
    },
    {
      date: '2022-01-10',
      pm2_5_pearson_correlation: 0.94,
      pm2_5_r2: 0.89,
      pm10_pearson_correlation: 0.95,
      pm10_r2: 0.9,
    },
  ];

  let newData = [];
  data.map((item) => {
    newData.push({
      pm2_5_pearson_correlation: item.pm2_5_pearson_correlation,
      pm2_5_r2: item.pm2_5_r2,
      pm10_pearson_correlation: item.pm10_pearson_correlation,
      pm10_r2: item.pm10_r2,
      date: moment(item.date).format('D MMM'),
    });
  });

  return (
    <div className='w-full h-80'>
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart data={newData} className='text-xs -ml-7'>
          <CartesianGrid vertical={false} stroke='#000000' strokeOpacity='0.1' strokeWidth={0.5} />
          <XAxis
            dataKey='date'
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
          {hasCustomLegend ? (
            <Legend content={<CustomLegend />} align='right' verticalAlign='bottom' />
          ) : (
            <Legend />
          )}

          <Line
            type='monotone'
            dot={false}
            dataKey={
              pmConcentration === '2.5' ? 'pm2_5_pearson_correlation' : 'pm10_pearson_correlation'
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
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CorrelationChart;
