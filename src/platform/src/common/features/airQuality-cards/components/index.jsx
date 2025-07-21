import React, { memo, useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'flowbite-react';
import { useResizeObserver } from '@/core/hooks/useResizeObserver';
import { AQI_CATEGORY_MAP, IconMap } from '../constants';
import { FiArrowUp, FiArrowDown } from 'react-icons/fi';
import Card from '@/components/CardWrapper';

const CARD_HEIGHT = 'h-44';

// helpers
const getMeasurementValue = (measurement, pollutantType) =>
  measurement?.[pollutantType]?.value != null
    ? measurement[pollutantType].value.toFixed(2)
    : '--';

/** Trend arrow with tooltip */
const TrendIndicator = memo(({ trendData }) => {
  const Icon = trendData?.isIncreasing ? FiArrowUp : FiArrowDown;
  const bgClass = trendData
    ? trendData.isIncreasing
      ? 'bg-gray-100 dark:bg-gray-100/10'
      : 'bg-primary/10'
    : 'bg-gray-100 dark:bg-gray-700';
  const colorClass = trendData
    ? trendData.isIncreasing
      ? 'text-gray-500'
      : 'text-primary'
    : 'text-gray-400 dark:text-gray-300';

  return (
    <Tooltip
      content={trendData?.trendTooltip ?? 'No trend data available'}
      placement="top"
      className="w-64"
    >
      <div
        className={`w-8 h-8 flex items-center justify-center rounded-full ${bgClass}`}
        aria-label={trendData?.trendTooltip ?? 'No trend data available'}
      >
        <Icon className={`w-4 h-4 ${colorClass}`} />
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

/** Single site card */
const SiteCard = memo(
  ({ site, measurement, onOpenModal, windowWidth, pollutantType }) => {
    // truncation refs
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

    // AQI data
    const aqiCategory = measurement?.aqi_category ?? 'Unknown';
    const statusKey = AQI_CATEGORY_MAP[aqiCategory] ?? 'unknown';
    const AirQualityIcon = IconMap[statusKey] ?? IconMap.unknown;
    const pctDiff = measurement?.averages?.percentageDifference;
    const trendData =
      pctDiff != null
        ? {
            trendTooltip: `${Math.abs(pctDiff)}% ${
              pctDiff > 0 ? 'worsened' : 'improved'
            } compared to last week.`,
            isIncreasing: pctDiff > 0,
          }
        : null;

    // display values with improved site name handling
    const pollutantDisplay = pollutantType === 'pm2_5' ? 'PM2.5' : 'PM10';
    const measurementValue = getMeasurementValue(measurement, pollutantType);

    // Enhanced site name formatting to handle IDs gracefully
    const formatSiteName = (name) => {
      if (!name || name === '---') return 'Unknown Site';

      // If the name looks like an ObjectId (24 hex characters), format it nicely
      if (/^[0-9a-fA-F]{24}$/.test(name)) {
        return `Site ${name.substring(0, 8)}...`;
      }

      // If the name starts with "Site " and followed by what looks like an ID, keep it
      if (name.startsWith('Site ') && name.includes('...')) {
        return name;
      }

      return name;
    };

    const siteName = formatSiteName(site.name);
    const siteCountry =
      site.country || site.city || site.region || 'Unknown Location';

    const handleClick = useCallback(() => {
      onOpenModal('inSights', [], site);
    }, [onOpenModal, site]);

    return (
      <Card
        onClick={handleClick}
        role="button"
        tabIndex={0}
        height={CARD_HEIGHT}
        padding="p-4 sm:p-5"
        className="relative w-full max-w-full overflow-hidden cursor-pointer hover:shadow-md transition-shadow duration-200"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-start justify-between mb-2 overflow-hidden">
            <div className="flex-1 min-w-0 pr-2">
              <h3
                ref={nameRef}
                title={isNameTruncated ? siteName : ''}
                className="text-lg font-medium truncate dark:text-white"
              >
                {siteName}
              </h3>
              <p
                ref={countryRef}
                title={isCountryTruncated ? siteCountry : ''}
                className="text-sm text-gray-400 truncate capitalize dark:text-white"
              >
                {siteCountry}
              </p>
            </div>
            <TrendIndicator trendData={trendData} />
          </div>

          {/* Value + Icon */}
          <div className="flex items-center justify-between mt-auto overflow-hidden">
            <div className="flex-1 min-w-0 pr-2">
              <p className="text-3xl font-bold truncate text-gray-800 dark:text-white">
                {measurementValue}
              </p>
              <p className="text-sm truncate text-gray-500 dark:text-white">
                {pollutantDisplay} • μg/m³
              </p>
            </div>
            <Tooltip
              content={`Air Quality is ${aqiCategory}`}
              placement={windowWidth > 1024 ? 'top' : 'left'}
              className="w-52"
            >
              <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center">
                <AirQualityIcon className="w-full h-full" aria-hidden="true" />
              </div>
            </Tooltip>
          </div>
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

/** “+ Add Location” dashed card */
const AddLocationCard = memo(({ onOpenModal }) => {
  const handleClick = useCallback(
    () => onOpenModal('addLocation'),
    [onOpenModal],
  );

  return (
    <Card
      onClick={handleClick}
      role="button"
      tabIndex={0}
      height={CARD_HEIGHT}
      padding="p-6"
      className="relative w-full max-w-full overflow-hidden border-2 border-dashed border-primary/50 dark:border-primary/80 flex items-center justify-center cursor-pointer hover:scale-95 transition-transform duration-200"
      background="bg-primary/10 dark:bg-primary/20"
    >
      <span className="text-base font-medium text-primary dark:text-primary/80">
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
