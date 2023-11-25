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
  const pollutantType = useSelector((state) => state.chart.pollutionType);
  const sites = useSelector((state) => state.chart.chartSites);
  const [isLoadingMeasurements, setIsLoadingMeasurements] = useState(false);

  useEffect(() => {
    setIsLoadingMeasurements(true);
    try {
      if (chartDataRange && chartDataRange.startDate && chartDataRange.endDate && sites) {
        dispatch(
          fetchRecentMeasurementsData({
            site_id: sites.join(','),
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

  const dummyData = {
    siteDetails: {
      search_name: '--',
      location_name: '--',
      formatted_name: '--',
      description: '--',
    },
    pm2_5: {
      value: '--',
    },
  };

  let displayData = recentLocationMeasurements ? recentLocationMeasurements.slice(0, 4) : [];

  while (displayData.length < 4) {
    displayData.push(dummyData);
  }

  return (
    <BorderlessContentBox>
      <div
        className={`mb-5 gap-4 ${
          recentLocationMeasurements && recentLocationMeasurements.length <= 2
            ? 'flex md:flex-row flex-col'
            : 'grid md:grid-cols-2'
        }`}>
        {!isLoadingMeasurements &&
          displayData.map((event, index) => (
            <AQNumberCard
              keyValue={index}
              location={
                event.siteDetails.search_name ||
                event.siteDetails.location_name ||
                event.siteDetails.formatted_name ||
                event.siteDetails.description
              }
              reading={event.pm2_5.value}
              count={displayData.length}
              pollutant={pollutantType}
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
