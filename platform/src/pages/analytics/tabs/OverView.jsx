import React, { useEffect, useState } from 'react';
import ChartContainer from '@/components/Charts/ChartContainer';
import AQNumberCard from '@/components/AQNumberCard';
import BorderlessContentBox from '@/components/Layout/borderless_content_box';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecentMeasurementsData } from '@/lib/store/services/deviceRegistry/RecentMeasurementsSlice';

const OverView = () => {
  // events hook
  const dispatch = useDispatch();
  const recentLocationMeasurements = useSelector((state) => state.recentMeasurements.measurements);
  const chartDataRange = useSelector((state) => state.chart.chartDataRange);
  const userDefaults = useSelector((state) => state.userDefaults.defaults);
  const [grids, setGrids] = useState([
    '64b7baccf2b99f00296acd59',
    '64b7ac8fd7249f0029feca80',
    '64d635f18f492b0013406c46',
    '64c90174448a63001e3a0b45',
  ]);

  useEffect(() => {
    if (userDefaults && userDefaults.grids) {
      setGrids(userDefaults.grids);
    }
  }, [userDefaults]);

  useEffect(() => {
    if (chartDataRange && chartDataRange.startDate && chartDataRange.endDate && grids) {
      dispatch(
        fetchRecentMeasurementsData({
          grid_id: grids.join(),
          startTime: chartDataRange.startDate,
          endTime: chartDataRange.endDate,
        }),
      );
    }
  }, [chartDataRange]);

  return (
    <BorderlessContentBox>
      <div
        className='mb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 grid-flow-col-dense'
        style={{ gridAutoFlow: 'dense' }}
      >
        {recentLocationMeasurements.slice(0, 4).map((event, index) => (
          <AQNumberCard
            keyValue={index}
            location={event?.siteDetails?.name}
            reading={event.pm2_5.value}
          />
        ))}
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <ChartContainer chartType='line' chartTitle='Air quality over time' height={300} />
        <ChartContainer chartType='bar' chartTitle='Air quality over time' height={300} />
      </div>
      <style jsx>{`
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(auto, 1fr));
          grid-gap: 1rem;
        }

        @media (min-width: 640px) {
          .grid {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          }
        }

        @media (min-width: 768px) {
          .grid {
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          }
        }

        @media (min-width: 1024px) {
          .grid {
            grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
          }
        }
      `}</style>
    </BorderlessContentBox>
  );
};

export default OverView;
