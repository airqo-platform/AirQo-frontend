import React, { useEffect, useState } from 'react';
import ChartContainer from '@/components/Charts/ChartContainer';
import AQNumberCard from '@/components/AQNumberCard';
import BorderlessContentBox from '@/components/Layout/borderless_content_box';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecentMeasurementsData } from '@/lib/store/services/deviceRegistry/RecentMeasurementsSlice';
import { DEFAULT_CHART_SITES } from '@/lib/constants';

const OverView = () => {
  // events hook
  const dispatch = useDispatch();
  const recentLocationMeasurements = useSelector((state) => state.recentMeasurements.measurements);
  const chartDataRange = useSelector((state) => state.chart.chartDataRange);
  const userLocationsData = useSelector((state) => state.defaults.preferences);
  const [sites, setSites] = useState(DEFAULT_CHART_SITES);
  const [isLoadingMeasurements, setIsLoadingMeasurements] = useState(false);

  useEffect(() => {
    setIsLoadingMeasurements(true);
    if (userLocationsData && !userLocationsData?.selected_sites) {
      setIsLoadingMeasurements(false);
      return;
    }
    if (userLocationsData && userLocationsData?.selected_sites) {
      const siteLists = [];
      userLocationsData.selected_sites.map((site) => {
        siteLists.push(site._id);
      });
      setSites(siteLists);
    }
    setIsLoadingMeasurements(false);
  }, [userLocationsData]);

  useEffect(() => {
    setIsLoadingMeasurements(true);
    try {
      if (chartDataRange && chartDataRange.startDate && chartDataRange.endDate && sites) {
        dispatch(
          fetchRecentMeasurementsData({
            site_id: sites.join(),
            startTime: chartDataRange.startDate,
            endTime: chartDataRange.endDate,
          }),
        );
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingMeasurements(false);
    }
  }, [chartDataRange, sites]);

  return (
    <BorderlessContentBox>
      <div
        className='mb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 grid-flow-col-dense'
        style={{ gridAutoFlow: 'dense' }}
      >
        {!isLoadingMeasurements &&
          recentLocationMeasurements &&
          recentLocationMeasurements
            .slice(0, 4)
            .map((event, index) => (
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
