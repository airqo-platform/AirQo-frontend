import React, { memo, useState, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'flowbite-react';
import { useResizeObserver } from '@/core/hooks/useResizeObserver';
import { AQI_CATEGORY_MAP, IconMap } from '../constants';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';
import Card from '@/components/CardWrapper';

const CARD_HEIGHT = 'h-44'; // Fixed height (~190px)

/* --- TrendIndicator Component --- */
const TrendIndicator = memo(({ trendData }) => {
  if (!trendData) {
    return (
      <Tooltip
        content="No trend data available"
        placement="top"
        className="w-64"
      >
        <div
          className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700"
          aria-label="No trend data available"
        >
          <FiArrowDown className="w-4 h-4 text-gray-400 dark:text-gray-300" />
        </div>
      </Tooltip>
    );
  }

  const { trendTooltip, isIncreasing } = trendData;
  const TrendIcon = isIncreasing ? FiArrowUp : FiArrowDown;

  // Worsened (increasing) = red theme, Improved = green theme
  const bgColor = isIncreasing
    ? 'bg-gray-100 dark:bg-gray-100/10'
    : 'bg-primary/10';
  const iconColor = isIncreasing ? 'text-gray-500' : 'text-primary';

  return (
    <Tooltip content={trendTooltip} placement="top" className="w-64">
      <div
        className={`w-8 h-8 flex items-center justify-center rounded-full ${bgColor}`}
        aria-label={trendTooltip}
      >
        <TrendIcon className={`w-4 h-4 ${iconColor}`} />
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

/* --- Helper Function --- */
const getMeasurementValue = (measurement, pollutantType) =>
  measurement &&
  measurement[pollutantType] &&
  typeof measurement[pollutantType].value === 'number'
    ? measurement[pollutantType].value.toFixed(2)
    : '--';

/* --- SiteCard Component --- */
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

    const aqiCategory = measurement?.aqi_category || 'Unknown';
    const statusKey = AQI_CATEGORY_MAP[aqiCategory] || 'unknown';
    const airQualityText = `Air Quality is ${aqiCategory}`;
    const AirQualityIcon = IconMap[statusKey] || IconMap.unknown;
    const percentageDiff = measurement?.averages?.percentageDifference;
    const trendData =
      percentageDiff !== undefined
        ? {
            trendTooltip:
              Math.abs(percentageDiff) +
              `% ${percentageDiff > 0 ? 'worsened' : 'improved'} compared to last week.`,
            isIncreasing: percentageDiff > 0,
          }
        : null;

    const pollutantDisplay = pollutantType === 'pm2_5' ? 'PM2.5' : 'PM10';
    const measurementValue = getMeasurementValue(measurement, pollutantType);
    const siteName = site.name || '---';
    const siteCountry = site.country || '---';

    const renderSiteName = (
      <span
        className="block overflow-hidden text-ellipsis whitespace-nowrap font-medium text-lg text-left pr-2 dark:text-white"
        ref={nameRef}
        title={isNameTruncated ? siteName : ''}
      >
        {siteName}
      </span>
    );
    const renderSiteCountry = (
      <span
        className="block overflow-hidden text-ellipsis whitespace-nowrap text-sm text-gray-400 capitalize text-left pr-2 dark:text-white"
        ref={countryRef}
        title={isCountryTruncated ? siteCountry : ''}
      >
        {siteCountry}
      </span>
    );

    const handleClick = useCallback(() => {
      if (typeof onOpenModal === 'function') onOpenModal('inSights', [], site);
    }, [onOpenModal, site]);

    return (
      <Card
        onClick={handleClick}
        role="button"
        tabIndex={0}
        height={CARD_HEIGHT}
        className="w-full hover:shadow-md transition-shadow duration-200 ease-in-out cursor-pointer"
        padding="p-4 sm:p-5"
      >
        <div className="flex justify-between items-start gap-3 pb-2 mb-2">
          <div className="min-w-0 flex-grow max-w-[calc(100%-40px)]">
            {renderSiteName}
            {renderSiteCountry}
          </div>
          <div className="flex-shrink-0 ml-auto">
            <TrendIndicator trendData={trendData} />
          </div>
        </div>
        <div className="flex justify-between items-center mt-auto pt-2">
          <div className="flex flex-col text-left min-w-0 max-w-[60%]">
            <div className="text-3xl font-bold truncate text-gray-800 dark:text-white">
              {measurementValue}
            </div>
            <div className="text-sm truncate text-gray-500 dark:text-white whitespace-nowrap">
              {pollutantDisplay} • μg/m³
            </div>
          </div>
          <Tooltip
            content={airQualityText}
            placement={windowWidth > 1024 ? 'top' : 'left'}
            className="w-52"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
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

/* --- AddLocationCard Component --- */
const AddLocationCard = memo(({ onOpenModal }) => {
  const handleClick = useCallback(
    () => onOpenModal('addLocation'),
    [onOpenModal],
  );

  return (
    <Card
      bordered={true}
      borderColor="border-primary/50 dark:border-primary/80"
      height={CARD_HEIGHT}
      background="bg-primary/10 dark:bg-primary/20"
      onClick={handleClick}
      role="button"
      tabIndex={0}
      width="w-full"
      className="border-dashed border-2 flex justify-center items-center transition-transform transform hover:scale-95 cursor-pointer"
      padding="p-6"
    >
      <span className="font-medium text-primary dark:text-primary/80">
        + Add Location
      </span>
    </Card>
  );
});
AddLocationCard.displayName = 'AddLocationCard';
AddLocationCard.propTypes = {
  onOpenModal: PropTypes.func.isRequired,
};

export { TrendIndicator, SiteCard, AddLocationCard };
