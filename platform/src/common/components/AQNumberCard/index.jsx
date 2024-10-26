import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
import { setOpenModal, setModalType } from '@/lib/store/services/downloadModal';
import TrendDownIcon from '@/icons/Analytics/trendDownIcon';
import { fetchRecentMeasurementsData } from '@/lib/store/services/deviceRegistry/RecentMeasurementsSlice';

const AQNumberCard = () => {
  const dispatch = useDispatch();
  const { width: windowWidth } = useWindowSize();
  const [loading, setLoading] = useState(true);

  const recentLocationMeasurements = useSelector(
    (state) => state.recentMeasurements.measurements,
  );

  const { chartSites, pollutionType: pollutantType } = useSelector(
    (state) => state.chart,
  );

  const preferencesData = useSelector(
    (state) => state.defaults.individual_preferences,
  );

  const MAX_CARDS = 4;

  const airQualityLevels = useMemo(
    () => [
      { max: 12, text: 'Air Quality is Good', icon: GoodAir },
      { max: 35.4, text: 'Air Quality is Moderate', icon: Moderate },
      {
        max: 55.4,
        text: 'Air Quality is Unhealthy for Sensitive Groups',
        icon: UnhealthySG,
      },
      { max: 150.4, text: 'Air Quality is Unhealthy', icon: Unhealthy },
      {
        max: 250.4,
        text: 'Air Quality is Very Unhealthy',
        icon: VeryUnhealthy,
      },
      { max: 500, text: 'Air Quality is Hazardous', icon: Hazardous },
    ],
    [],
  );

  // Fetch measurements for sites with support for cancellation
  const fetchMeasurementsForSites = useCallback(
    async (controller) => {
      if (chartSites.length > 0) {
        setLoading(true);

        try {
          await dispatch(
            fetchRecentMeasurementsData({
              params: { site_id: chartSites.join(',') },
              signal: controller.signal,
            }),
          ).unwrap();
        } catch (error) {
          if (error.name !== 'CanceledError') {
            console.error('Error fetching recent measurements:', error);
          }
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    },
    [dispatch, chartSites],
  );

  // Load data on component mount and when selectedSiteIds change
  useEffect(() => {
    const controller = new AbortController();

    // Call the fetch function with the controller
    fetchMeasurementsForSites(controller);

    // Cleanup: cancel request if component unmounts
    return () => controller.abort();
  }, [fetchMeasurementsForSites]);

  const getAirQualityLevel = useCallback(
    (reading) => {
      if (reading === null || reading === undefined) {
        return { text: 'Air Quality is Unknown', icon: UnknownAQ };
      }
      return (
        airQualityLevels.find((level) => reading <= level.max) || {
          text: 'Air Quality is Unknown',
          icon: UnknownAQ,
        }
      );
    },
    [airQualityLevels],
  );

  const getPollutantReading = useCallback(
    (siteId) => {
      const measurement = recentLocationMeasurements.find(
        (m) => m.site_id === siteId,
      );
      if (measurement) {
        if (pollutantType === 'pm2_5') {
          return measurement.pm2_5?.value ?? null;
        } else if (pollutantType === 'pm10') {
          return measurement.pm10?.value ?? null;
        }
      }
      return null;
    },
    [recentLocationMeasurements, pollutantType],
  );

  const truncateText = useCallback((text, maxLength) => {
    if (!text) return '---';
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  }, []);

  const SkeletonCard = () => (
    <div className="w-full bg-gray-200 animate-pulse rounded-xl px-4 py-10">
      <div className="h-6 w-3/4 bg-gray-300 rounded"></div>
      <div className="mt-2 h-4 w-1/2 bg-gray-300 rounded"></div>
      <div className="mt-4 h-8 w-full bg-gray-300 rounded"></div>
    </div>
  );

  const handleOpenModal = useCallback(
    (type, ids = null, data = null) => {
      dispatch(setModalType({ type, ids, data }));
      dispatch(setOpenModal(true));
    },
    [dispatch],
  );

  const renderSiteCards = () => {
    return preferencesData?.[0]?.selected_sites
      ?.slice(0, MAX_CARDS)
      .map((site) => {
        const reading = getPollutantReading(site._id);
        const { text: airQualityText, icon: AirQualityIcon } =
          getAirQualityLevel(reading);
        const isClickable = true;

        return (
          <button
            key={site._id}
            className="w-full h-auto"
            onClick={() => {
              handleOpenModal('inSights', [], site);
            }}
          >
            <div
              className={`relative w-full flex flex-col justify-between bg-white border border-gray-200 rounded-xl px-4 py-6 h-[200px] shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out ${
                isClickable ? 'cursor-pointer' : 'cursor-default'
              }`}
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <div
                    className="text-gray-800 text-lg font-medium capitalize text-left max-w-full"
                    title={site.name || 'No Location Data'}
                  >
                    {truncateText(site.name, 12)}
                  </div>
                  <div className="text-base text-left text-slate-400 capitalize">
                    {site.country || '---'}
                  </div>
                </div>

                <div className="pl-2 pr-1 rounded-xl text-sm flex items-center gap-2 bg-gray-50 text-gray-500">
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
                      {pollutantType === 'pm2_5' ? 'PM2.5' : 'PM10'}
                    </div>
                  </div>
                  <div className="text-gray-700 text-[28px] font-extrabold">
                    {typeof reading === 'number' && !isNaN(reading)
                      ? reading.toFixed(2)
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
      });
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {loading ? (
        Array.from({ length: MAX_CARDS }).map((_, index) => (
          <SkeletonCard key={index} />
        ))
      ) : (
        <>
          {renderSiteCards()}

          {preferencesData?.[0]?.selected_sites?.length < MAX_CARDS && (
            <button
              onClick={() => handleOpenModal('addLocation')}
              className="border-dashed border-2 border-blue-400 bg-blue-50 rounded-xl px-4 py-6 h-[200px] flex justify-center items-center text-blue-500 transition-transform transform hover:scale-95"
              aria-label="Add Location"
            >
              + Add location
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default AQNumberCard;
