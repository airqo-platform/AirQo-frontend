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
            dataKey='deviceName'
            stroke='#000000'
            strokeOpacity='0.1'
            strokeWidth={0.5}
            axisLine={false}
            tickLine={false}
            tick={false}
          />
          <Tooltip formatter={(value) => value.toFixed(2)} wrapperClassName='text-base' />
          <Bar
            dataKey={pmConcentration === '2.5' ? 's1_pm2_5_mean' : 's2_pm2_5_mean'}
            fill='#8884d8'
            barSize={18}
            name='Sensor 01'
          >
            <LabelList content={<CustomBarLabel customValue='Sensor 01' />} />
          </Bar>
          <Bar
            dataKey={pmConcentration === '2.5' ? 's2_pm2_5_mean' : 's2_pm2_5_mean'}
            fill='#82ca9d'
            barSize={18}
            name='Sensor 02'
          >
            <LabelList content={<CustomBarLabel customValue='Sensor 02' />} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CorrelationBarChart;
