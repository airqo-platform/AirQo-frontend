import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { Tooltip } from 'flowbite-react';
import { useWindowSize } from '@/lib/windowSize';
import { setOpenModal, setModalType } from '@/lib/store/services/downloadModal';
import { fetchRecentMeasurementsData } from '@/lib/store/services/deviceRegistry/RecentMeasurementsSlice';
import { useResizeObserver, SkeletonCard, IconMap } from './components';
import { useGetActiveGroup } from '@/core/hooks/useGetActiveGroupId';

// ====================== Constants ====================== //

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

// ====================== Utility Functions ====================== //

/**
 * Generates trend data based on percentage difference.
 * @param {Object} averages - The averages object containing percentageDifference.
 * @returns {Object|null} - The trend data or null if not available.
 */
const generateTrendData = (averages) => {
  if (!averages?.percentageDifference) return null;

  const percentageDifference = Math.abs(averages.percentageDifference);
  const isIncreasing = averages.percentageDifference > 0;

  let trendTooltip =
    'No significant change in air quality compared to the previous week.';

  if (isIncreasing) {
    trendTooltip = `The air quality has increased by ${percentageDifference}% compared to the previous week, indicating deteriorating air quality.`;
  } else if (averages.percentageDifference < 0) {
    trendTooltip = `The air quality has decreased by ${percentageDifference}% compared to the previous week, indicating improving air quality.`;
  }

  return {
    trendIcon: isIncreasing ? IconMap.trend2 : IconMap.trend1, // Reverted to existing icons
    trendColor: isIncreasing
      ? 'text-red-700 bg-red-100'
      : 'text-green-700 bg-green-100',
    trendText: `${percentageDifference}%`,
    trendTooltip,
    isIncreasing,
  };
};

// ====================== TrendIndicator Component ====================== //

const TrendIndicator = React.memo(({ trendData }) => (
  <Tooltip
    content={trendData?.trendTooltip || 'No trend data available'}
    placement="top"
    className="w-64"
  >
    <div
      className={`shrink-0 px-2 py-1 rounded-xl text-xs flex items-center gap-1.5 ${
        trendData ? trendData.trendColor : 'bg-gray-100 text-gray-500'
      }`}
      aria-label={
        trendData
          ? trendData.isIncreasing
            ? 'Air quality has deteriorated compared to last week.'
            : 'Air quality has improved compared to last week.'
          : 'No trend data available.'
      }
    >
      {trendData ? (
        <>
          <trendData.trendIcon className="w-3.5 h-3.5" fill="currentColor" />
          <span className="font-medium">{trendData.trendText}</span>
        </>
      ) : (
        <>
          <IconMap.trend1 className="w-3.5 h-3.5" fill="#808080" />
          <span>{'--'}</span>
        </>
      )}
    </div>
  </Tooltip>
));

TrendIndicator.displayName = 'TrendIndicator';

TrendIndicator.propTypes = {
  trendData: PropTypes.shape({
    trendIcon: PropTypes.elementType,
    trendColor: PropTypes.string,
    trendText: PropTypes.string,
    trendTooltip: PropTypes.string,
    isIncreasing: PropTypes.bool,
  }),
};

// ====================== SiteCard Component ====================== //

const SiteCard = React.memo(
  ({ site, onOpenModal, windowWidth, pollutantType }) => {
    const measurements = useSelector(
      (state) => state.recentMeasurements.measurements,
    );
    const nameRef = useRef(null);
    const [isTruncated, setIsTruncated] = useState(false);

    const checkTruncation = useCallback(() => {
      if (nameRef.current) {
        setIsTruncated(
          nameRef.current.scrollWidth > nameRef.current.clientWidth,
        );
      }
    }, []);

    useResizeObserver(nameRef, checkTruncation);

    const measurement = useMemo(
      () => measurements.find((m) => m.site_id === site._id),
      [measurements, site._id],
    );

    const aqiCategory = measurement?.aqi_category || 'Unknown';
    const statusKey = AQI_CATEGORY_MAP[aqiCategory] || 'unknown';
    const airQualityText =
      aqiCategory === 'Unknown'
        ? 'Air Quality is Unknown'
        : `Air Quality is ${aqiCategory}`;

    const AirQualityIcon = IconMap[statusKey];
    const trendData = useMemo(
      () => generateTrendData(measurement?.averages),
      [measurement],
    );

    // Render site name with truncation and tooltip
    const wrappedSiteName = useMemo(() => {
      const baseClasses =
  'w-full max-w-[200px] lg:max-w-[140px] text-left overflow-hidden text-ellipsis whitespace-nowrap ';

      if (isTruncated) {
        return (
          <Tooltip
            content={site.name || 'No Location Data'}
            placement="top"
            className="w-52"
          >
            <span className={`${baseClasses} inline-block`} ref={nameRef}>
              {site.name || '---'}
            </span>
          </Tooltip>
        );
      }

      return (
        <span className={`${baseClasses} inline-block`} ref={nameRef}>
          {site.name || '---'}
        </span>
      );
    }, [isTruncated, site.name]);

    return (
      <button
        className="w-full h-auto"
        onClick={() => onOpenModal('inSights', [], site)}
        aria-label={`View detailed insights for ${
          site.name || 'this location'
        }`}
      >
        <div className="w-full flex flex-col justify-between bg-white border border-gray-200 rounded-xl px-6 py-5 h-[220px] shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out cursor-pointer">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex flex-col flex-1">
              {wrappedSiteName}
              <div className="text-sm text-left text-slate-400 capitalize">
                {site.country || '---'}
              </div>
            </div>
            <TrendIndicator trendData={trendData} />
          </div>

          {/* Body Section */}
          <div className="flex justify-between items-center">
            {/* Pollutant Information */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-gray-100 rounded-full flex items-center justify-center">
                  <IconMap.wind className="text-gray-500" />
                </div>
                <div className="text-slate-400 text-sm font-medium">
                  {pollutantType === 'pm2_5' ? 'PM2.5' : 'PM10'}
                </div>
              </div>
              <div className="text-gray-700 text-[32px] font-bold leading-none">
                {typeof measurement?.[pollutantType]?.value === 'number'
                  ? measurement[pollutantType].value.toFixed(2)
                  : '--'}
              </div>
            </div>

            {/* Air Quality Icon */}
            <div>
              <Tooltip
                content={airQualityText}
                placement={windowWidth > 1024 ? 'top' : 'left'}
                className="w-52"
              >
                <div className="w-16 h-16 flex items-center justify-center">
                  {AirQualityIcon && (
                    <AirQualityIcon
                      className="w-full h-full"
                      aria-hidden="true"
                    />
                  )}
                </div>
              </Tooltip>
            </div>
          </div>
        </div>
      </button>
    );
  },
);

SiteCard.displayName = 'SiteCard';

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

// ====================== AddLocationCard Component ====================== //

const AddLocationCard = React.memo(({ onOpenModal }) => (
  <button
    onClick={() => onOpenModal('addLocation')}
    className="border-dashed border-2 border-blue-400 bg-blue-50 rounded-xl px-4 py-6 h-[220px] flex justify-center items-center text-blue-500 transition-transform transform hover:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500"
    aria-label="Add a new location to monitor air quality"
  >
    + Add Location
  </button>
));

AddLocationCard.displayName = 'AddLocationCard';

AddLocationCard.propTypes = {
  onOpenModal: PropTypes.func.isRequired,
};

// ====================== Main AQNumberCard Component ====================== //

const AQNumberCard = ({ className = '' }) => {
  const dispatch = useDispatch();
  const { width: windowWidth } = useWindowSize();
  const [loading, setLoading] = useState(true);

  const { id: activeGroupId, loading: isFetchingActiveGroup } =
    useGetActiveGroup();

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
    if (isFetchingActiveGroup) return;
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
  }, [selectedSiteIds, dispatch, activeGroupId]);

  const handleOpenModal = useCallback(
    (type, ids = [], data = null) => {
      dispatch(setModalType({ type, ids, data }));
      dispatch(setOpenModal(true));
    },
    [dispatch],
  );

  if (loading || isFetchingActiveGroup) {
    return (
      <div
        className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}
      >
        {Array.from({ length: MAX_CARDS }).map((_, index) => (
          <SkeletonCard key={`skeleton-${index}`} />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}
    >
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
    </div>
  );
};

AQNumberCard.propTypes = {
  className: PropTypes.string,
};

export default React.memo(AQNumberCard);
