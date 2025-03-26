import React, { useRef, useState, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'flowbite-react';
import { useResizeObserver } from '@/core/hooks/useResizeObserver';
import { AQI_CATEGORY_MAP, IconMap } from '../constants';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';

const WINDOW_BREAKPOINT = 1024;

const TrendIndicator = memo(({ trendData }) => {
  if (!trendData) {
    return (
      <Tooltip
        content="No trend data available"
        placement="top"
        className="w-64"
      >
        <div
          className="w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full bg-gray-100"
          aria-label="No trend data available"
        >
          <FiArrowDown className="w-4 h-4 text-gray-400" />
        </div>
      </Tooltip>
    );
  }

  const { trendTooltip, isIncreasing } = trendData;

  // As per the image: blue for down arrow, gray for up arrow
  const bgColorClass = isIncreasing ? 'bg-gray-100' : 'bg-blue-100';
  const textColorClass = isIncreasing ? 'text-gray-400' : 'text-blue-500';
  const TrendIcon = isIncreasing ? FiArrowUp : FiArrowDown;

  return (
    <Tooltip content={trendTooltip} placement="top" className="w-64">
      <div
        className={`w-8 h-8 flex-shrink-0 flex items-center justify-center rounded-full ${bgColorClass}`}
        aria-label={trendTooltip}
      >
        <TrendIcon className={`w-4 h-4 ${textColorClass}`} />
      </div>
    </Tooltip>
  );
});

TrendIndicator.displayName = 'TrendIndicator';

TrendIndicator.propTypes = {
  trendData: PropTypes.shape({
    trendTooltip: PropTypes.string,
    isIncreasing: PropTypes.bool,
  }),
};

const getMeasurementValue = (measurement, pollutantType) => {
  if (
    !measurement ||
    !measurement[pollutantType] ||
    typeof measurement[pollutantType].value !== 'number'
  ) {
    return '--';
  }
  return measurement[pollutantType].value.toFixed(2);
};

const SiteCard = memo(
  ({ site, measurement, onOpenModal, windowWidth, pollutantType }) => {
    const nameRef = useRef(null);
    const countryRef = useRef(null);
    const [isNameTruncated, setIsNameTruncated] = useState(false);
    const [isCountryTruncated, setIsCountryTruncated] = useState(false);

    const checkTruncation = useCallback(() => {
      if (nameRef.current) {
        setIsNameTruncated(
          nameRef.current.scrollWidth > nameRef.current.clientWidth,
        );
      }
      if (countryRef.current) {
        setIsCountryTruncated(
          countryRef.current.scrollWidth > countryRef.current.clientWidth,
        );
      }
    }, []);

    useResizeObserver(nameRef, checkTruncation);
    useResizeObserver(countryRef, checkTruncation);

    // Derived values
    const aqiCategory = measurement?.aqi_category || 'Unknown';
    const statusKey = AQI_CATEGORY_MAP[aqiCategory] || 'unknown';
    const airQualityText = `Air Quality is ${aqiCategory}`;
    const AirQualityIcon = IconMap[statusKey] || IconMap.unknown;
    const trendData = measurement?.averages?.percentageDifference
      ? {
          trendTooltip: generateTrendTooltip(
            measurement.averages.percentageDifference,
          ),
          isIncreasing: measurement.averages.percentageDifference > 0,
        }
      : null;
    const pollutantDisplay = pollutantType === 'pm2_5' ? 'PM2.5' : 'PM10';
    const measurementValue = getMeasurementValue(measurement, pollutantType);
    const siteName = site.name || '---';
    const siteCountry = site.country || '---';

    // Helper function to generate trend tooltip
    function generateTrendTooltip(percentageDifference) {
      const percentValue = Math.abs(percentageDifference);
      return percentageDifference > 0
        ? `The air quality has worsened by ${percentValue}% compared to the previous week.`
        : `The air quality has improved by ${percentValue}% compared to the previous week.`;
    }

    // Site name with truncation handling
    const renderSiteName = (
      <span
        className="block w-full overflow-hidden text-ellipsis whitespace-nowrap font-medium text-lg text-left"
        ref={nameRef}
        title={isNameTruncated ? siteName : ''}
      >
        {siteName}
      </span>
    );

    const renderSiteCountry = (
      <span
        className="block w-full overflow-hidden text-ellipsis whitespace-nowrap text-sm text-gray-400 capitalize text-left"
        ref={countryRef}
        title={isCountryTruncated ? siteCountry : ''}
      >
        {siteCountry}
      </span>
    );

    const siteNameWithTooltip = isNameTruncated ? (
      <Tooltip content={siteName} placement="top" className="w-52">
        {renderSiteName}
      </Tooltip>
    ) : (
      renderSiteName
    );

    const siteCountryWithTooltip = isCountryTruncated ? (
      <Tooltip content={siteCountry} placement="top" className="w-52">
        {renderSiteCountry}
      </Tooltip>
    ) : (
      renderSiteCountry
    );

    const handleClick = useCallback(() => {
      if (typeof onOpenModal === 'function') {
        onOpenModal('inSights', [], site);
      }
    }, [onOpenModal, site]);

    return (
      <button
        className="w-full h-auto"
        onClick={handleClick}
        aria-label={`View detailed insights for ${siteName}`}
        type="button"
      >
        <div className="w-full flex flex-col justify-between bg-white border border-gray-200 rounded-xl p-4 sm:p-5 h-auto min-h-[180px] shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out cursor-pointer">
          {/* Header Section - Fixed to prevent overflow */}
          <div className="flex justify-between items-start gap-2 pb-2 mb-2">
            <div className="min-w-0 flex-grow">
              {siteNameWithTooltip}
              {siteCountryWithTooltip}
            </div>
            <div className="flex-shrink-0">
              <TrendIndicator trendData={trendData} />
            </div>
          </div>

          {/* Content Section */}
          <div className="flex justify-between items-center mt-auto pt-2">
            <div className="flex flex-col text-left min-w-0 max-w-[60%]">
              <div className="text-gray-800 text-3xl font-bold truncate">
                {measurementValue}
              </div>
              <div className="text-gray-500 text-sm whitespace-nowrap">
                {pollutantDisplay} • μg/m³
              </div>
            </div>

            <Tooltip
              content={airQualityText}
              placement={windowWidth > WINDOW_BREAKPOINT ? 'top' : 'left'}
              className="w-52"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 flex-shrink-0 flex items-center justify-center">
                <AirQualityIcon className="w-full h-full" aria-hidden="true" />
              </div>
            </Tooltip>
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
  measurement: PropTypes.shape({
    aqi_category: PropTypes.string,
    averages: PropTypes.object,
    pm2_5: PropTypes.shape({
      value: PropTypes.number,
    }),
    pm10: PropTypes.shape({
      value: PropTypes.number,
    }),
  }),
  onOpenModal: PropTypes.func.isRequired,
  windowWidth: PropTypes.number.isRequired,
  pollutantType: PropTypes.oneOf(['pm2_5', 'pm10']).isRequired,
};

const AddLocationCard = memo(({ onOpenModal }) => (
  <button
    onClick={() => onOpenModal('addLocation')}
    className="border-dashed border-2 border-blue-400 bg-blue-50 rounded-xl p-4 sm:p-5 h-auto min-h-[180px] flex justify-center items-center text-blue-500 font-medium transition-transform transform hover:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500"
    aria-label="Add a new location to monitor air quality"
    type="button"
  >
    + Add Location
  </button>
));

AddLocationCard.displayName = 'AddLocationCard';

AddLocationCard.propTypes = {
  onOpenModal: PropTypes.func.isRequired,
};

export { TrendIndicator, SiteCard, AddLocationCard };
