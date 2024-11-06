import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IconMap } from './IconMap';
import CustomTooltip from '../Tooltip';
import { useWindowSize } from '@/lib/windowSize';
import { setOpenModal, setModalType } from '@/lib/store/services/downloadModal';
import { fetchRecentMeasurementsData } from '@/lib/store/services/deviceRegistry/RecentMeasurementsSlice';

// Constants
const AIR_QUALITY_LEVELS = [
  { max: 12, text: 'Air Quality is Good', status: 'good' },
  { max: 35.4, text: 'Air Quality is Moderate', status: 'moderate' },
  {
    max: 55.4,
    text: 'Air Quality is Unhealthy for Sensitive Groups',
    status: 'unhealthy-sensitive',
  },
  { max: 150.4, text: 'Air Quality is Unhealthy', status: 'unhealthy' },
  {
    max: 250.4,
    text: 'Air Quality is Very Unhealthy',
    status: 'very-unhealthy',
  },
  { max: 500, text: 'Air Quality is Hazardous', status: 'hazardous' },
];

const MAX_CARDS = 4;
const TRUNCATE_LENGTH = 12;

const SkeletonCard = () => (
  <div className="w-full border border-gray-200 bg-white rounded-xl px-4 py-6">
    <div className="flex flex-col justify-between h-[168px]">
      {/* Header skeleton */}
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2 flex-1">
          <div className="h-6 bg-gray-200 rounded-md w-3/4 animate-pulse" />
          <div className="h-4 bg-gray-200 rounded-md w-1/2 animate-pulse" />
        </div>
        <div className="h-8 w-16 bg-gray-200 rounded-xl animate-pulse ml-2" />
      </div>

      {/* Bottom section skeleton */}
      <div className="flex justify-between items-end">
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded-md w-16 animate-pulse" />
          <div className="h-8 bg-gray-200 rounded-md w-24 animate-pulse" />
        </div>
        <div className="h-16 w-16 bg-gray-200 rounded-full animate-pulse" />
      </div>
    </div>
  </div>
);

const SiteCard = ({ site, onOpenModal, windowWidth, pollutantType }) => {
  const measurements = useSelector(
    (state) => state.recentMeasurements.measurements,
  );

  const reading = useMemo(() => {
    const measurement = measurements.find((m) => m.site_id === site._id);
    if (!measurement) return null;
    return pollutantType === 'pm2_5'
      ? (measurement.pm2_5?.value ?? null)
      : (measurement.pm10?.value ?? null);
  }, [measurements, site._id, pollutantType]);

  const { text: airQualityText, status } = useMemo(() => {
    if (reading == null) {
      return { text: 'Air Quality is Unknown', status: 'unknown' };
    }
    return (
      AIR_QUALITY_LEVELS.find((level) => reading <= level.max) || {
        text: 'Air Quality is Unknown',
        status: 'unknown',
      }
    );
  }, [reading]);

  const AirQualityIcon = IconMap[status];
  const truncatedName = !site.name
    ? '---'
    : site.name.length > TRUNCATE_LENGTH
      ? `${site.name.slice(0, TRUNCATE_LENGTH)}...`
      : site.name;

  return (
    <button
      className="w-full h-auto"
      onClick={() => onOpenModal('inSights', [], site)}
    >
      <div className="relative w-full flex flex-col justify-between bg-white border border-gray-200 rounded-xl px-4 py-6 h-[200px] shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out cursor-pointer">
        <div className="flex justify-between items-center mb-4">
          <div>
            <div
              className="text-gray-800 text-lg font-medium capitalize text-left max-w-full"
              title={site.name || 'No Location Data'}
            >
              {truncatedName}
            </div>
            <div className="text-base text-left text-slate-400 capitalize">
              {site.country || '---'}
            </div>
          </div>

          <div className="pl-2 pr-1 rounded-xl text-sm flex items-center gap-2 bg-gray-50 text-gray-500">
            <IconMap.trend fill="#808080" />
            <span>--</span>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-1 mb-2">
              <div className="p-[2.62px] bg-gray-100 rounded-full flex items-center justify-center">
                <IconMap.wind width="10.48px" height="10.48px" />
              </div>
              <div className="text-slate-400 text-sm font-medium">
                {pollutantType === 'pm2_5' ? 'PM2.5' : 'PM10'}
              </div>
            </div>
            <div className="text-gray-700 text-[28px] font-extrabold">
              {typeof reading === 'number' ? reading.toFixed(2) : '--'}
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
};

const AddLocationCard = ({ onOpenModal }) => (
  <button
    onClick={() => onOpenModal('addLocation')}
    className="border-dashed border-2 border-blue-400 bg-blue-50 rounded-xl px-4 py-6 h-[200px] flex justify-center items-center text-blue-500 transition-transform transform hover:scale-95"
    aria-label="Add Location"
  >
    + Add location
  </button>
);

const AQNumberCard = ({ className = '' }) => {
  const dispatch = useDispatch();
  const { width: windowWidth } = useWindowSize();
  const [loading, setLoading] = useState(true);

  const pollutantType = useSelector((state) => state.chart.pollutionType);
  const preferences = useSelector(
    (state) => state.defaults.individual_preferences?.[0],
  );

  const selectedSiteIds = useMemo(
    () => preferences?.selected_sites?.map((site) => site._id) || [],
    [preferences],
  );

  const selectedSites = useMemo(
    () => preferences?.selected_sites?.slice(0, MAX_CARDS) || [],
    [preferences],
  );

  useEffect(() => {
    const controller = new AbortController();

    const fetchData = async () => {
      if (!selectedSiteIds.length) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        await dispatch(
          fetchRecentMeasurementsData({
            params: { site_id: selectedSiteIds.join(',') },
            signal: controller.signal,
          }),
        ).unwrap();
      } catch (error) {
        if (error.name !== 'CanceledError') {
          console.error('Error fetching measurements:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
  }, [selectedSiteIds, dispatch]);

  const handleOpenModal = (type, ids = [], data = null) => {
    dispatch(setModalType({ type, ids, data }));
    dispatch(setOpenModal(true));
  };

  const renderContent = () => {
    if (loading) {
      return Array.from({ length: MAX_CARDS }).map((_, index) => (
        <SkeletonCard key={`skeleton-${index}`} />
      ));
    }

    return (
      <>
        {selectedSites.map((site) => (
          <SiteCard
            key={site._id}
            site={site}
            onOpenModal={handleOpenModal}
            windowWidth={windowWidth}
            pollutantType={pollutantType}
          />
        ))}
        {selectedSites.length < MAX_CARDS && (
          <AddLocationCard onOpenModal={handleOpenModal} />
        )}
      </>
    );
  };

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}
    >
      {renderContent()}
    </div>
  );
};

export default React.memo(AQNumberCard);
