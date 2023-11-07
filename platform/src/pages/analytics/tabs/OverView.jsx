import React from 'react';
import ChartContainer from '@/components/Charts/ChartContainer';

const OverView = () => {
  return (
    <div className='px-3 lg:px-16 py-3'>
      <div>{/* top tabs code here */}</div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <ChartContainer chartType='line' chartTitle='Air quality over time' height={300} />
        <ChartContainer chartType='bar' chartTitle='Air quality over time' height={300} />
      </div>
    </div>
  );
};

export default OverView;
