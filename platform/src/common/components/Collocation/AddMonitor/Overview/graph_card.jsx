import React from 'react';
import { MdArrowDropDown } from 'react-icons/md';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const GraphCard = ({ data, secondGraph }) => {
  const tooltipFormatter = (value) => {
    return `${value.toFixed(2)}`;
  };

  return (
    <div className='grid grid-cols-5 divide-x divide-grey-150'>
      <div className='col-span-3 flex flex-col pt-4 md:px-6 ml-2'>
        <div className='flex flex-row items-center justify-between'>
          <span className='font-semibold text-base flex justify-between items-center'>
            {data && data[0].deviceName}{' '}
            <button className='text-lg ml-2'>
              <MdArrowDropDown />
            </button>
          </span>
          <span className='text-sm text-blue'>Full report</span>
        </div>
        <div className='flex flex-row'>
          <span className='mt-4 text-sm opacity-50 font-semibold flex justify-between items-center rounded border border-grey-150 p-1'>
            PM<sub>2.5</sub>
            <button className='text-lg ml-2'>
              <MdArrowDropDown />
            </button>
          </span>
        </div>
        {secondGraph ? (
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart width={'100%'} height={140} barCategoryGap={30} data={data}>
              <YAxis label={{ value: 'µg/m3', angle: -90, position: 'insideLeft' }} />
              <XAxis dataKey={'deviceName'} />
              <CartesianGrid strokeDasharray='3 3' />
              <Tooltip formatter={tooltipFormatter} />
              <Bar
                dataKey='s1_pm10_mean'
                fill='#FE9E35'
                name={'Sensor 01'}
                background={{ fill: '#F4F6F8' }}
              />
              <Bar
                dataKey='s2_pm10_mean'
                fill='#0CE87E'
                name={'Sensor 02'}
                background={{ fill: '#F4F6F8' }}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart width={'100%'} height={140} barCategoryGap={30} data={data}>
              <YAxis label={{ value: 'µg/m3', angle: -90, position: 'insideLeft' }} />
              <XAxis dataKey={'name'} />
              <CartesianGrid strokeDasharray='3 3' />
              <Tooltip formatter={tooltipFormatter} />
              <Bar
                dataKey='s1_pm10_mean'
                fill='#FE9E35'
                name={'Sensor 01'}
                background={{ fill: '#F4F6F8' }}
              />
              <Bar
                dataKey='s2_pm10_mean'
                fill='#0CE87E'
                name={'Sensor 02'}
                background={{ fill: '#F4F6F8' }}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className='col-span-2'>
        <div className='flex flex-col'>
          <div className='w-full border-b border-grey-150 p-4'>
            <div className='flex flex-row items-center'>
              <div
                className={
                  secondGraph
                    ? 'rounded-full w-3 h-3 bg-orange-450 mr-2'
                    : 'rounded-full w-3 h-3 bg-green-550 mr-2'
                }
              ></div>
              <span className='text-sm font-semibold'>Sensor 01</span>
            </div>
            <div className='mt-1 mb-4'>
              <span className='md:text-5xl font-normal text-3xl'>11.5</span>
              <span className='opacity-30 font-normal text-3xl'>
                <sub>
                  µg/m<sup>3</sup>
                </sub>
              </span>
            </div>
          </div>
          <div className='p-4'>
            <div className='flex flex-row items-center'>
              <div
                className={
                  secondGraph
                    ? 'rounded-full w-3 h-3 bg-green-550 mr-2'
                    : 'rounded-full w-3 h-3 bg-green-50 mr-2'
                }
              ></div>
              <span className='text-sm font-semibold'>Sensor 02</span>
            </div>
            <div className='mt-1 mb-4'>
              <span className='md:text-5xl font-normal text-3xl'>12.5</span>
              <span className='opacity-30 font-normal text-3xl'>
                <sub>
                  µg/m<sup>3</sup>
                </sub>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphCard;
