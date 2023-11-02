import React from 'react';
import ChartContainer from '@/components/Charts/ChartContainer';
import AQNumberCard from '@/components/AQNumberCard';

const OverView = () => {
  return (
    <div className='px-3 lg:px-16 pb-3'>
      <div className='mb-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5'>
        <div className='grid-col-1'>
          <AQNumberCard location='Jinja' reading={'230'} />
        </div>
        <div className='grid-col-1'>
          <AQNumberCard location='Nairobi' reading={'44'} />
        </div>
        <div className='grid-col-1'>
          <AQNumberCard location='Kishasha' reading={'7'} />
        </div>
        <div className='grid-col-1'>
          <AQNumberCard location='London' reading={'89'} />
        </div>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <ChartContainer chartType='line' chartTitle='Air quality over time' />
        <ChartContainer chartType='bar' chartTitle='Air quality over time' />
      </div>
    </div>
  );
};

export default OverView;
