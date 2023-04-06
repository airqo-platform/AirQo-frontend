import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from 'recharts';

const CustomBarLabel = (props) => {
  const { x, y, width, value, customValue } = props;
  return (
    <text
      x={x + width - 10}
      y={y + 8}
      fill='#000000'
      textAnchor='end'
      dominantBaseline='central'
      fontSize={10}
    >
      {customValue}
    </text>
  );
};

const CorrelationBarChart = ({ height, pmConcentration, data }) => {
  const chartData = Object.entries(data).map(([device, deviceData]) => ({
    device,
    ...deviceData,
  }));

  console.log(chartData);

  return (
    <div className={`w-full ${height ? `h-[${height}px]` : `h-80`}`}>
      <ResponsiveContainer width='100%' height='100%'>
        <BarChart layout='vertical' data={chartData} className='text-xs -ml-7'>
          <CartesianGrid
            horizontal={false}
            stroke='#000000'
            strokeOpacity='0.1'
            strokeWidth={0.5}
          />
          <XAxis
            type='number'
            strokeWidth='0.5'
            stroke='#000000'
            strokeOpacity='0.1'
            axisLine={false}
          />
          <YAxis
            type='category'
            dataKey='device'
            stroke='#000000'
            strokeOpacity='0.1'
            padding={{ bottom: 56 }}
            strokeWidth={0.5}
            axisLine={false}
            tickLine={false}
            tick={false}
          />
          <Tooltip />
          {/* <Legend /> */}
          <Bar
            dataKey={
              pmConcentration === '2.5' ? 'pm2_5_pearson_correlation' : 'pm10_pearson_correlation'
            }
            fill='#8884d8'
            barSize={18}
          >
            <LabelList content={<CustomBarLabel customValue='Sensor 1' />} />
          </Bar>
          <Bar
            dataKey={pmConcentration === '2.5' ? 'pm2_5_r2' : 'pm10_r2'}
            fill='#82ca9d'
            barSize={18}
          >
            <LabelList content={<CustomBarLabel customValue='Sensor 2' />} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CorrelationBarChart;
