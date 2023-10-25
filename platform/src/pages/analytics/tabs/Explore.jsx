import React, { useState } from 'react';
import ChartContainer from '@/components/Charts/ChartContainer';
import SettingsIcon from '@/icons/settings.svg';
import BarChart from '@/icons/Charts/bar-chart.svg';
import LineChart from '@/icons/Charts/line-chart-up.svg';
import CalendarIcon from '@/icons/calendar.svg';
import TabButtons from '@/components/Button/TabButtons';
import CustomDropdown from '@/components/Dropdowns/CustomDropdown';
import CheckIcon from '@/icons/tickIcon';

const Explore = () => {
  const [selectedChart, setSelectedChart] = useState('line');
  const [selectedDays, setSelectedDays] = useState('daily');

  const timeOptions = ['hourly', 'daily', 'weekly', 'monthly'];
  const chartOptions = [
    { id: 'bar', name: 'Bar chart', icon: <BarChart /> },
    { id: 'line', name: 'Line chart', icon: <LineChart /> },
  ];

  return (
    <div className='px-3 lg:px-16 py-3 space-y-4'>
      <div className='flex justify-between'>
        <div className='flex space-x-3'>
          <TabButtons Icon={CalendarIcon} btnText='Last 30 days' dropdown />
          <CustomDropdown
            trigger={<TabButtons btnText='Daily' dropdown />}
            id='days'
            dropStyle={{ top: '36px', left: '0', zIndex: 999 }}>
            {timeOptions.map((option) => (
              <a
                key={option}
                href='#'
                className={`px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex justify-between items-center ${
                  selectedDays === option ? 'bg-gray-100' : ''
                }`}>
                <span className='flex items-center space-x-2'>
                  <span>{option.charAt(0).toUpperCase() + option.slice(1)}</span>
                </span>
                {selectedDays === option && <CheckIcon fill={'#145FFF'} />}
              </a>
            ))}
          </CustomDropdown>
        </div>
        <div className='flex space-x-3'>
          <CustomDropdown
            trigger={<TabButtons Icon={BarChart} btnText='Chart' dropdown />}
            id='charts'
            dropStyle={{ top: '36px', right: '0', zIndex: 999 }}>
            {chartOptions.map((option) => (
              <a
                key={option.id}
                href='#'
                className={`px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex justify-between items-center ${
                  selectedChart === option.id ? 'bg-gray-100' : ''
                }`}>
                <span className='flex items-center space-x-2'>
                  {option.icon}
                  <span>{option.name}</span>
                </span>
                {selectedChart === option.id && <CheckIcon className='h-5 w-5 text-blue-500' />}
              </a>
            ))}
          </CustomDropdown>
          <TabButtons Icon={SettingsIcon} btnText='Customize' />
        </div>
      </div>
      <div>
        <ChartContainer menuBtn chartType='line' chartTitle='Air quality over time' />
      </div>
    </div>
  );
};

export default Explore;
