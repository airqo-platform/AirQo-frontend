import React from 'react';
import ChartContainer from '@/components/Charts/ChartContainer';
import { useDispatch } from 'react-redux';
import { updateDefaults } from '@/lib/store/services/charts/userDefaultsSlice';

const OverView = () => {
  const dispatch = useDispatch();

  // Function to update chart
  const updateChart = () => {
    dispatch(updateDefaults({ pollutant: 'pm10' }));
  };
  return (
    <div className='px-3 lg:px-16 py-3'>
      <div>{/* top tabs code here */}</div>
      <button onClick={updateChart}>Update chart</button>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <ChartContainer chartType='line' chartTitle='Air quality over time' />
        <ChartContainer chartType='bar' chartTitle='Air quality over time' />
      </div>
    </div>
  );
};

export default OverView;
