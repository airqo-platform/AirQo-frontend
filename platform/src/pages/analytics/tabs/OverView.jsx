import React, { useEffect, useState } from 'react';
import ChartContainer from '@/components/Charts/ChartContainer';
import AQNumberCard from '@/components/AQNumberCard';
import BorderlessContentBox from '@/components/Layout/borderless_content_box';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRecentMeasurementsData } from '@/lib/store/services/deviceRegistry/RecentMeasurementsSlice';

const useFetchMeasurements = () => {
  const dispatch = useDispatch();
  const chartData = useSelector((state) => state.chart);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const preferenceData = useSelector((state) => state.defaults.individual_preferences) || [];
  const preferencesLoading = useSelector((state) => state.userDefaults.status === 'loading');

  console.log('Sites', chartData.chartSites);

  useEffect(() => {
    if (preferencesLoading) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        if (chartData.chartSites?.length > 0) {
          await dispatch(
            fetchRecentMeasurementsData({
              site_id: chartData.chartSites.join(','),
            }),
          );
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [chartData, preferenceData]);

  return { isLoading, error };
};

const OverView = () => {
  // events hook
  const recentLocationMeasurements = useSelector((state) => state.recentMeasurements.measurements);
  const pollutantType = useSelector((state) => state.chart.pollutionType);
  const preferenceData = useSelector((state) => state.defaults.individual_preferences) || [];
  const siteData = useSelector((state) => state.grids.sitesSummary);
  const { isLoading: isLoadingMeasurements, error } = useFetchMeasurements();
  console.log('recentLocationMeasurements', recentLocationMeasurements);

  function getSiteName(siteId) {
    if (preferenceData?.length === 0) {
      return null;
    }
    const site = preferenceData[0]?.selected_sites?.find((site) => site._id === siteId);
    return site ? site.search_name?.split(',')[0] : '';
  }

  const getExistingSiteName = (siteId) => {
    const site = siteData?.sites?.find((site) => site._id === siteId);
    return site ? site.search_name : '';
  };

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
        }`}
      >
        {!isLoadingMeasurements
          ? displayData.map((event, index) => {
              return (
                <AQNumberCard
                  key={index}
                  location={
                    getSiteName(event.site_id) ||
                    getExistingSiteName(event.site_id) ||
                    event?.siteDetails?.search_name
                  }
                  locationFullName={
                    getSiteName(event.site_id) ||
                    getExistingSiteName(event.site_id) ||
                    event?.siteDetails?.search_name
                  }
                  reading={event.pm2_5.value}
                  count={displayData.length}
                  pollutant={pollutantType}
                />
              );
            })
          : displayData.map((event, index) => {
              return (
                <AQNumberCard
                  key={index}
                  location={'--'}
                  locationFullName={'--'}
                  reading={'--'}
                  count={displayData.length}
                  pollutant={pollutantType}
                  isLoading={isLoadingMeasurements}
                />
              );
            })}
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
