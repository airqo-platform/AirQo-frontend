import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IconMap } from './IconMap';
import CustomTooltip from '../Tooltip';
import { useWindowSize } from '@/lib/windowSize';
import { setOpenModal, setModalType } from '@/lib/store/services/downloadModal';
import { fetchRecentMeasurementsData } from '@/lib/store/services/deviceRegistry/RecentMeasurementsSlice';
import PropTypes from 'prop-types';

// Mapping from aqi_category to IconMap keys
const AQI_CATEGORY_MAP = {
  Good: 'good',
  Moderate: 'moderate',
  'Unhealthy for Sensitive Groups': 'unhealthy-sensitive',
  Unhealthy: 'unhealthy',
  'Very Unhealthy': 'very-unhealthy',
  Hazardous: 'hazardous',
  Unknown: 'unknown',
};

const MAX_CARDS = 4;

// SkeletonCard Component
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

// SiteCard Component (refactored as shown above)
const SiteCard = ({ site, onOpenModal, windowWidth, pollutantType }) => {
  const measurements = useSelector(
    (state) => state.recentMeasurements.measurements,
  );

  const measurement = useMemo(() => {
    return measurements.find((m) => m.site_id === site._id);
  }, [measurements, site._id]);

  // Extract aqi_category from measurement
  const aqiCategory = useMemo(() => {
    return measurement?.aqi_category || 'Unknown';
  }, [measurement]);

  // Map aqi_category to status key for IconMap
  const statusKey = AQI_CATEGORY_MAP[aqiCategory] || 'unknown';

  // Get the air quality text
  const airQualityText =
    aqiCategory === 'Unknown'
      ? 'Air Quality is Unknown'
      : `Air Quality is ${aqiCategory}`;

  // Get the corresponding icon from IconMap
  const AirQualityIcon = IconMap[statusKey];

  // Ref and state for detecting text truncation
  const nameRef = useRef(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const checkTruncation = () => {
      const el = nameRef.current;
      if (el) {
        setIsTruncated(el.scrollWidth > el.clientWidth);
      }
    };

    // Initial check
    checkTruncation();

    // Re-check on window resize
    window.addEventListener('resize', checkTruncation);
    return () => {
      window.removeEventListener('resize', checkTruncation);
    };
  }, [site.name, windowWidth]);

  // Determine trend data
  const trendData = useMemo(() => {
    const averages = measurement?.averages;
    if (!averages) return null;

    const { percentageDifference } = averages;
    const trendIcon =
      percentageDifference > 0 ? IconMap.trend2 : IconMap.trend1;
    const trendColor =
      percentageDifference > 0
        ? 'text-green-700 bg-green-100'
        : 'text-red-700 bg-red-100';
    const trendText =
      percentageDifference > 0
        ? `+${percentageDifference.toFixed(2)}%`
        : `${percentageDifference.toFixed(2)}%`;

    return {
      trendIcon,
      trendColor,
      trendText,
    };
  }, [measurement]);

  const siteNameElement = (
    <div
      ref={nameRef}
      className="text-gray-800 text-lg font-medium capitalize text-left w-full max-w-[150px] md:max-w-full lg:max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap"
    >
      {site.name || '---'}
    </div>
  );

  return (
    <button
      className="w-full h-auto"
      onClick={() => onOpenModal('inSights', [], site)}
    >
      <div className="relative w-full flex flex-col justify-between bg-white border border-gray-200 rounded-xl px-4 py-4 h-[220px] shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out cursor-pointer">
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-col">
            {isTruncated ? (
              <CustomTooltip
                tooltipsText={site.name || 'No Location Data'}
                position="top"
              >
                {siteNameElement}
              </CustomTooltip>
            ) : (
              siteNameElement
            )}
            <div className="text-sm text-left text-slate-400 capitalize">
              {site.country || '---'}
            </div>
          </div>

          {/* Trend Section */}
          {trendData ? (
            <div
              className={`pl-1 pr-1 py-1 rounded-xl text-[10px] flex items-center gap-2 ${trendData.trendColor}`}
              style={{ maxWidth: '70px' }}
            >
              <trendData.trendIcon fill="currentColor" />
              <span>{trendData.trendText}</span>
            </div>
          ) : (
            <div className="pl-1 pr-1 py-1 rounded-xl text-[10px] flex items-center gap-2 bg-gray-100 text-gray-500">
              <IconMap.trend1 fill="#808080" />
              <span>{'--'}</span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-1 mb-2">
              <div className="p-1 bg-gray-100 rounded-full flex items-center justify-center">
                <IconMap.wind width="12px" height="12px" />
              </div>
              <div className="text-slate-400 text-sm font-medium">
                {pollutantType === 'pm2_5' ? 'PM2.5' : 'PM10'}
              </div>
            </div>
            <div className="text-gray-700 text-[24px] font-extrabold">
              {typeof measurement?.[pollutantType]?.value === 'number'
                ? measurement[pollutantType].value.toFixed(2)
                : '--'}
            </div>
          </div>

          <div className="relative">
            <CustomTooltip
              tooltipsText={airQualityText}
              position={windowWidth > 1024 ? 'top' : 'left'}
            >
              <div className="w-14 h-14 flex">
                {AirQualityIcon && <AirQualityIcon />}
              </div>
            </CustomTooltip>
          </div>
        </div>
      </div>
    </button>
  );
};

SiteCard.propTypes = {
  site: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    name: PropTypes.string,
    country: PropTypes.string,
  }).isRequired,
  onOpenModal: PropTypes.func.isRequired,
  windowWidth: PropTypes.number.isRequired,
  pollutantType: PropTypes.string.isRequired,
};

// AddLocationCard Component
const AddLocationCard = ({ onOpenModal }) => (
  <button
    onClick={() => onOpenModal('addLocation')}
    className="border-dashed border-2 border-blue-400 bg-blue-50 rounded-xl px-4 py-6 h-[220px] flex justify-center items-center text-blue-500 transition-transform transform hover:scale-95"
    aria-label="Add Location"
  >
    + Add location
  </button>
);

AddLocationCard.propTypes = {
  onOpenModal: PropTypes.func.isRequired,
};

// AQNumberCard Component
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

AQNumberCard.propTypes = {
  className: PropTypes.string,
};

export default React.memo(AQNumberCard);
