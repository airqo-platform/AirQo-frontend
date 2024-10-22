import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
import { useDispatch, useSelector } from 'react-redux';
import { setOpenModal, setModalType } from '@/lib/store/services/downloadModal';
import TrendDownIcon from '@/icons/Analytics/trendDownIcon';
import { fetchRecentMeasurementsData } from '@/lib/store/services/deviceRegistry/RecentMeasurementsSlice';

const AQNumberCard = () => {
  const dispatch = useDispatch();
  const { width: windowWidth } = useWindowSize();
  const [loading, setLoading] = useState(true); // Loading state

  const recentLocationMeasurements = useSelector(
    (state) => state.recentMeasurements.measurements,
  );
  const pollutantType = useSelector((state) => state.chart.pollutionType);
  const preferencesData = useSelector(
    (state) => state.defaults.individual_preferences,
  );

  // Memoized selected site IDs to avoid recomputation
  const selectedSiteIds = useMemo(() => {
    return preferencesData?.[0]?.selected_sites?.length
      ? preferencesData[0].selected_sites.map((site) => site._id)
      : [];
  }, [preferencesData]);

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

  // Fetch measurements for all selected sites
  const fetchMeasurementsForSites = useCallback(async () => {
    if (selectedSiteIds.length > 0) {
      setLoading(true);
      try {
        await dispatch(
          fetchRecentMeasurementsData({ site_id: selectedSiteIds.join(',') }),
        );
      } catch (error) {
        console.error('Error fetching recent measurements:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [dispatch, selectedSiteIds]);

  // Load data on component mount and when selectedSiteIds change
  useEffect(() => {
    fetchMeasurementsForSites();
  }, [fetchMeasurementsForSites]);

  // Helper function to get air quality level
  const getAirQualityLevel = useCallback(
    (reading) => {
      if (reading === null)
        return { text: 'Air Quality is Unknown', icon: UnknownAQ };
      return (
        airQualityLevels.find((level) => reading <= level.max) || {
          text: 'Air Quality is Unknown',
          icon: UnknownAQ,
        }
      );
    },
    [airQualityLevels],
  );

  // Memoized helper function to avoid recomputation on every render
  const getPollutantReading = useCallback(
    (siteId) => {
      const measurement = recentLocationMeasurements.find(
        (m) => m.site_id === siteId,
      );
      if (measurement) {
        return pollutantType === 'pm2_5'
          ? measurement.pm2_5?.calibratedValue
          : measurement.pm10?.calibratedValue;
      }
      return null;
    },
    [recentLocationMeasurements, pollutantType],
  );

  // Helper function to truncate text with ellipsis
  const truncateText = useCallback((text, maxLength) => {
    if (!text) return '---';
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  }, []);

  const skeletonLoader = () => (
    <div className="w-full bg-gray-200 animate-pulse rounded-xl px-4 py-10">
      <div className="h-6 w-3/4 bg-gray-300 rounded"></div>
      <div className="mt-2 h-4 w-1/2 bg-gray-300 rounded"></div>
      <div className="mt-4 h-8 w-full bg-gray-300 rounded"></div>
    </div>
  );

  // Open modal for location
  const handleOpenModal = useCallback(
    (type, ids = []) => {
      dispatch(setOpenModal(true));
      dispatch(setModalType({ type, ids }));
    },
    [dispatch],
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {loading ? (
        Array.from({ length: MAX_CARDS }).map((_, index) => (
          <div key={index}>{skeletonLoader()}</div>
        ))
      ) : preferencesData?.[0]?.selected_sites?.length > 0 ? (
        preferencesData[0].selected_sites
          ?.slice(0, MAX_CARDS)
          .map((site, index) => {
            const reading = getPollutantReading(site._id);
            const { text: airQualityText, icon: AirQualityIcon } =
              getAirQualityLevel(reading);
            const isClickable = site.name && reading !== null;

            return (
              <button
                className="w-full h-auto"
                onClick={isClickable ? () => handleOpenModal(site) : null}
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
                        className="text-gray-700 text-[18px] font-medium capitalize text-left max-w-full"
                        title={site.name || 'No Location Data'}
                      >
                        {truncateText(site.search_name, 12)}
                      </div>
                      <div className="text-base text-left text-slate-400 capitalize">
                        {site.country || '---'}
                      </div>
                    </div>

                    <div className="pl-[8px] pr-[4px] rounded-xl text-sm flex items-center gap-2 bg-gray-50 text-gray-500">
                      <TrendDownIcon fill="#808080" />
                      <span>--</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-1 mb-2">
                        <div className="p-[2.62px] bg-gray-100 rounded-full flex items-center justify-center">
                          <WindIcon width="10.48px" height="10.48px" />
                        </div>
                        <div className="text-slate-400 text-sm font-medium">
                          {pollutantType ? pollutantType.toUpperCase() : '--'}
                        </div>
                      </div>
                      <div className="text-gray-700 text-[28px] font-extrabold">
                        {reading !== null ? reading.toFixed(2) : '--'}
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
          })
      ) : (
        <p>No selected sites available</p>
      )}

      {/* Add Location Box if fewer than MAX_CARDS and not loading */}
      {!loading && preferencesData?.[0]?.selected_sites?.length < MAX_CARDS && (
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
