import React, { useRef, useState, useCallback, memo } from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'flowbite-react';
import { useResizeObserver } from '@/core/hooks/useResizeObserver';
import { AQI_CATEGORY_MAP, IconMap } from '../constants';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';
import Card from '@/components/CardWrapper';

const WINDOW_BREAKPOINT = 1024;
// Set the exact height to 190px using Tailwind's arbitrary value syntax
const CARD_HEIGHT = 'h-44';

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
    // Refs and state for text truncation
    const nameRef = useRef(null);
    const countryRef = useRef(null);
    const [isNameTruncated, setIsNameTruncated] = useState(false);
    const [isCountryTruncated, setIsCountryTruncated] = useState(false);

    // Check if the name or country overflow the container to show a tooltip
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

    // Derived values and helper function for trend tooltip
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

    function generateTrendTooltip(percentageDifference) {
      const percentValue = Math.abs(percentageDifference);
      return percentageDifference > 0
        ? `The air quality has worsened by ${percentValue}% compared to the previous week.`
        : `The air quality has improved by ${percentValue}% compared to the previous week.`;
    }

    // Enhanced site name rendering with improved truncation
    const renderSiteName = (
      <span
        className="block w-full overflow-hidden text-ellipsis whitespace-nowrap font-medium text-lg text-left pr-2" // Added pr-2 to prevent text from touching the indicator
        ref={nameRef}
        title={isNameTruncated ? siteName : ''}
      >
        {siteName}
      </span>
    );

    const renderSiteCountry = (
      <span
        className="block w-full overflow-hidden text-ellipsis whitespace-nowrap text-sm text-gray-400 capitalize text-left pr-2" // Added pr-2 for spacing
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
      <Card
        onClick={handleClick}
        role="button"
        tabIndex={0}
        // Use the fixed height of 190px
        height={CARD_HEIGHT}
        // Maintain hover shadow and transition effects
        className="w-full hover:shadow-md transition-shadow duration-200 ease-in-out cursor-pointer"
        padding="p-4 sm:p-5"
      >
        {/* Header Section with site name and country - improved spacing */}
        <div className="flex justify-between items-start gap-3 pb-2 mb-2">
          <div className="min-w-0 flex-grow max-w-[calc(100%-40px)]">
            {' '}
            {/* Prevent text from touching indicator */}
            {siteNameWithTooltip}
            {siteCountryWithTooltip}
          </div>
          <div className="flex-shrink-0 ml-auto">
            <TrendIndicator trendData={trendData} />
          </div>
        </div>

        {/* Content Section with measurement and air quality icon */}
        <div className="flex justify-between items-center mt-auto pt-2">
          <div className="flex flex-col text-left min-w-0 max-w-[60%]">
            <div className="text-gray-800 text-3xl font-bold truncate">
              {measurementValue}
            </div>
            <div className="text-gray-500 text-sm whitespace-nowrap truncate">
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
      </Card>
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
    pm2_5: PropTypes.shape({ value: PropTypes.number }),
    pm10: PropTypes.shape({ value: PropTypes.number }),
  }),
  onOpenModal: PropTypes.func.isRequired,
  windowWidth: PropTypes.number.isRequired,
  pollutantType: PropTypes.oneOf(['pm2_5', 'pm10']).isRequired,
};

const AddLocationCard = memo(({ onOpenModal }) => {
  const handleClick = useCallback(() => {
    onOpenModal('addLocation');
  }, [onOpenModal]);

  return (
    <Card
      height={CARD_HEIGHT}
      background="bg-blue-50"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      width="w-full"
      borderColor="border-blue-400"
      className="border-dashed flex justify-center items-center text-blue-500 font-medium transition-transform transform hover:scale-95"
      padding="p-4 sm:p-5"
    >
      + Add Location
    </Card>
  );
});
AddLocationCard.displayName = 'AddLocationCard';
AddLocationCard.propTypes = {
  onOpenModal: PropTypes.func.isRequired,
};

export { TrendIndicator, SiteCard, AddLocationCard };
