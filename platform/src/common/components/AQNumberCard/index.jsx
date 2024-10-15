import React, { useState, useEffect, useCallback } from 'react';
import GoodAir from '@/icons/Charts/GoodAir';
import Hazardous from '@/icons/Charts/Hazardous';
import Moderate from '@/icons/Charts/Moderate';
import Unhealthy from '@/icons/Charts/Unhealthy';
import UnhealthySG from '@/icons/Charts/UnhealthySG';
import VeryUnhealthy from '@/icons/Charts/VeryUnhealthy';
import UnknownAQ from '@/icons/Charts/Invalid';
import WindIcon from '@/icons/Common/wind.svg';
import CustomTooltip from '../Tooltip';
import { useWindowSize } from '@/lib/windowSize';
import { useDispatch } from 'react-redux';
import { setOpenModal, setModalType } from '@/lib/store/services/downloadModal';
import TrendDownIcon from '@/icons/Analytics/trendDownIcon';

const AQNumberCard = () => {
  const dispatch = useDispatch();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const { width: windowWidth } = useWindowSize();

  // Maximum number of cards to display
  const MAX_CARDS = 4;

  const airQualityLevels = [
    { max: 12, text: 'Air Quality is Good', icon: GoodAir },
    { max: 35.4, text: 'Air Quality is Moderate', icon: Moderate },
    {
      max: 55.4,
      text: 'Air Quality is Unhealthy for Sensitive Groups',
      icon: UnhealthySG,
    },
    { max: 150.4, text: 'Air Quality is Unhealthy', icon: Unhealthy },
    { max: 250.4, text: 'Air Quality is Very Unhealthy', icon: VeryUnhealthy },
    { max: 500, text: 'Air Quality is Hazardous', icon: Hazardous },
  ];

  // Dummy data for the locations, with one location having empty data
  const dummyData = [
    {
      id: 1,
      location: 'Kampala',
      country: 'Uganda',
      reading: 152.41,
      pollutant: 'PM2.5',
      trend: 32,
      locationFullName: 'Kampala, Uganda',
    },
    {
      id: 2,
      location: 'Fort Portal',
      country: 'Uganda',
      reading: 44.31,
      pollutant: 'PM2.5',
      trend: 0,
      locationFullName: 'Fort Portal, Uganda',
    },
    {
      id: 3,
      location: '',
      country: '',
      reading: null,
      pollutant: '',
      trend: null,
      locationFullName: '',
    },
  ];

  useEffect(() => {
    // Simulate fetching the data
    const fetchData = async () => {
      setLoading(true);
      try {
        setTimeout(() => {
          setSites(dummyData);
        }, 1000);
      } catch (error) {
        console.error('Error fetching air quality data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getAirQualityLevel = (reading) => {
    if (reading === null)
      return { text: 'Air Quality is Unknown', icon: UnknownAQ };
    const level = airQualityLevels.find((level) => reading <= level.max);
    return level || { text: 'Air Quality is Unknown', icon: UnknownAQ };
  };

  const skeletonLoader = () => (
    <div className="w-full bg-gray-200 animate-pulse rounded-xl px-4 py-10">
      <div className="h-6 w-3/4 bg-gray-300 rounded"></div>
      <div className="mt-2 h-4 w-1/2 bg-gray-300 rounded"></div>
      <div className="mt-4 h-8 w-full bg-gray-300 rounded"></div>
    </div>
  );

  const handleOpenModal = useCallback(
    (type, ids = []) => {
      dispatch(setOpenModal(true));
      dispatch(setModalType({ type, ids }));
    },
    [dispatch],
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {loading
        ? // Show skeleton loaders while loading is true
          Array.from({ length: MAX_CARDS }).map((_, index) => (
            <div key={index}>{skeletonLoader()}</div>
          ))
        : // Map through the sites and display air quality cards when data is loaded
          sites.map((site, index) => {
            const { text: airQualityText, icon: AirQualityIcon } =
              getAirQualityLevel(site.reading);

            // Determine if the card should be a clickable button or a non-clickable div
            const isClickable =
              site.location && site.country && site.reading !== null;

            return (
              <button
                className="w-full h-auto"
                onClick={
                  isClickable
                    ? () => handleOpenModal('location', [site.id])
                    : null
                }
                key={index}
              >
                <div
                  className={`relative w-full flex flex-col justify-between bg-white border border-gray-200 rounded-xl px-4 py-6 h-[200px] shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out ${
                    isClickable ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <div
                        className="text-gray-700 text-[18px] font-medium capitalize"
                        title={site.locationFullName || 'No Location Data'}
                      >
                        {site.location ? site.location : '---'}
                      </div>
                      <div className="text-base text-left text-slate-400 capitalize">
                        {site.country ? site.country : '---'}
                      </div>
                    </div>

                    <div
                      className={`pl-[8px] pr-[4px] rounded-xl text-sm flex items-center gap-2 ${
                        site.trend !== null
                          ? 'bg-green-50 text-green-500'
                          : 'bg-gray-50 text-gray-500'
                      }`}
                    >
                      {site.trend !== null ? (
                        <TrendDownIcon fill="#12B76A" />
                      ) : (
                        <TrendDownIcon fill="#808080" />
                      )}
                      <span>
                        {site.trend !== null ? `${site.trend}%` : '--'}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-1 mb-2">
                        <div className="p-[2.62px] bg-gray-100 rounded-full flex items-center justify-center">
                          <WindIcon width="10.48px" height="10.48px" />
                        </div>
                        <div className="text-slate-400 text-sm font-medium">
                          {site.pollutant ? site.pollutant : '--'}
                        </div>
                      </div>
                      <div className="text-gray-700 text-[28px] font-extrabold">
                        {typeof site.reading === 'number'
                          ? site.reading.toFixed(2)
                          : '--'}
                      </div>
                    </div>

                    <div className="relative">
                      <CustomTooltip
                        tooltipsText={airQualityText}
                        position={windowWidth > 1024 ? 'top' : 'left'}
                      >
                        <div className="w-16 h-16 flex">
                          {AirQualityIcon && <AirQualityIcon />}
                        </div>
                      </CustomTooltip>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}

      {/* Add Location Box if fewer than MAX_CARDS and not loading */}
      {!loading && sites.length < MAX_CARDS && (
        <button
          onClick={() => handleOpenModal('addLocation')}
          className="border-dashed border-2 border-blue-400 bg-blue-50 rounded-xl px-4 py-6 h-[200px] flex justify-center items-center text-blue-500"
        >
          + Add location
        </button>
      )}
    </div>
  );
};

export default AQNumberCard;
