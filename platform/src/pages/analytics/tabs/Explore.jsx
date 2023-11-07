import React, { useState } from 'react';
import ChartContainer from '@/components/Charts/ChartContainer';
import SettingsIcon from '@/icons/settings.svg';
import BarChart from '@/icons/Charts/bar-chart.svg';
import LineChart from '@/icons/Charts/line-chart-up.svg';
import CustomCalendar from '@/components/Calendar/CustomCalendar';
import TabButtons from '@/components/Button/TabButtons';
import CustomDropdown from '@/components/Dropdowns/CustomDropdown';
import CheckIcon from '@/icons/tickIcon';
import { useSelector, useDispatch } from 'react-redux';
import { setChartType, setTimeFrame } from '@/lib/store/services/charts/ChartSlice';

const Explore = () => {
  const dispatch = useDispatch();
  const chartData = useSelector((state) => state.chart);

  const timeOptions = ['hourly', 'daily', 'weekly', 'monthly'];
  const chartOptions = [
    { id: 'bar', name: 'Bar chart', icon: <BarChart /> },
    { id: 'line', name: 'Line chart', icon: <LineChart /> },
  ];

  return (
    <div className='px-3 lg:px-16 pb-3 space-y-4'>
      <div className='flex justify-between items-center flex-wrap space-y-2'>
        <div className='flex space-x-3'>
          <CustomCalendar
            initialStartDate={new Date()}
            initialEndDate={new Date()}
            id='datePicker2'
            position={{ top: '40px', left: '0px' }}
            dropdown
          />
          <CustomDropdown
            trigger={<TabButtons btnText={chartData.timeFrame} dropdown />}
            id='days'
            dropStyle={{ top: '36px', zIndex: 9999, left: '0px' }}
          >
            {timeOptions.map((option) => (
              <span
                key={option}
                onClick={() => {
                  dispatch(setTimeFrame(option));
                }}
                className={`cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex justify-between items-center ${
                  chartData.timeFrame === option ? 'bg-gray-100' : ''
                }`}
              >
                <span className='flex items-center space-x-2'>
                  <span>{option.charAt(0).toUpperCase() + option.slice(1)}</span>
                </span>
                {chartData.timeFrame === option && <CheckIcon fill={'#145FFF'} />}
              </span>
            ))}
          </CustomDropdown>
        </div>
        <div className='flex space-x-3'>
          <CustomDropdown
            trigger={<TabButtons Icon={BarChart} btnText='Chart' dropdown />}
            id='charts'
            dropStyle={{ top: '36px', zIndex: 9999, right: '0px' }}
          >
            {chartOptions.map((option) => (
              <span
                key={option.id}
                onClick={() => {
                  dispatch(setChartType(option.id));
                }}
                className={`cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex justify-between items-center ${
                  chartData.chartType === option.id ? 'bg-gray-100' : ''
                }`}
              >
                <span className='flex items-center space-x-2'>
                  {option.icon}
                  <span>{option.name}</span>
                </span>
                {chartData.chartType === option.id && <CheckIcon fill={'#145FFF'} />}
              </span>
            ))}
          </CustomDropdown>
          <TabButtons Icon={SettingsIcon} btnText='Customize' />
        </div>
      </div>
      <div>
        <ChartContainer
          menuBtn
          chartType={chartData.chartType}
          chartTitle='Air quality over time'
        />
      </div>
    </div>
  );
};

export default Explore;
