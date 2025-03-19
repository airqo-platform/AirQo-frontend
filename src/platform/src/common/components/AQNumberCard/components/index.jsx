import React, { useRef, useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'flowbite-react';
import { useResizeObserver } from '@/core/hooks/useResizeObserver';
import { generateTrendData, AQI_CATEGORY_MAP, IconMap } from '../constants';

const WINDOW_BREAKPOINT = 1024;

export const TrendIndicator = React.memo(({ trendData }) => {
  const IconComponent = trendData
    ? IconMap[trendData.trendIcon]
    : IconMap.trend1;

  return (
    <Tooltip
      content={trendData?.trendTooltip || 'No trend data available'}
      placement="top"
      className="w-64"
    >
      <div
        className={`shrink-0 px-2 py-1 rounded-xl text-xs flex items-center gap-1.5 ${
          trendData ? trendData.trendColor : 'bg-gray-100 text-gray-500'
        }`}
        aria-label={trendData?.trendTooltip || 'No trend data available'}
      >
        <IconComponent className="w-3.5 h-3.5" fill="currentColor" />
        <span className="font-medium">{trendData?.trendText || '--'}</span>
      </div>
    </Tooltip>
  );
});

TrendIndicator.displayName = 'TrendIndicator';

TrendIndicator.propTypes = {
  trendData: PropTypes.shape({
    trendIcon: PropTypes.string,
    trendColor: PropTypes.string,
    trendText: PropTypes.string,
    trendTooltip: PropTypes.string,
    isIncreasing: PropTypes.bool,
  }),
};

const getMeasurementValue = (measurement, pollutantType) => {
  const value = measurement?.[pollutantType]?.value;
  return typeof value === 'number' ? value.toFixed(2) : '--';
};

export const SiteCard = React.memo(
  ({ site, measurement, onOpenModal, windowWidth, pollutantType }) => {
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

    const aqiCategory = measurement?.aqi_category || 'Unknown';
    const statusKey = AQI_CATEGORY_MAP[aqiCategory] || 'unknown';
    const airQualityText = `Air Quality is ${aqiCategory}`;
    const AirQualityIcon = IconMap[statusKey];
    const trendData = generateTrendData(measurement?.averages);
    const pollutantDisplay = pollutantType === 'pm2_5' ? 'PM2.5' : 'PM10';
    const measurementValue = getMeasurementValue(measurement, pollutantType);

    const siteName = (
      <span
        className="w-full max-w-[200px] lg:max-w-[150px] text-left overflow-hidden text-ellipsis whitespace-nowrap inline-block"
        ref={nameRef}
      >
        {site.name || '---'}
      </span>
    );

    const siteNameWithTooltip = isTruncated ? (
      <Tooltip
        content={site.name || 'No Location Data'}
        placement="top"
        className="w-52"
      >
        {siteName}
      </Tooltip>
    ) : (
      siteName
    );

    return (
      <button
        className="w-full h-auto"
        onClick={() => onOpenModal('inSights', [], site)}
        aria-label={`View detailed insights for ${site.name || 'this location'}`}
      >
        <div className="w-full flex flex-col justify-between bg-white border border-gray-200 rounded-xl px-6 py-5 h-[220px] shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out cursor-pointer">
          {/* Header Section */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex flex-col flex-1">
              {siteNameWithTooltip}
              <div className="text-sm text-left text-slate-400 capitalize">
                {site.country || '---'}
              </div>
            </div>
            <TrendIndicator trendData={trendData} />
          </div>

          {/* Content Section */}
          <div className="flex justify-between items-center">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 bg-gray-100 rounded-full flex items-center justify-center">
                  <IconMap.wind className="text-gray-500" />
                </div>
                <div className="text-slate-400 text-sm font-medium">
                  {pollutantDisplay}
                </div>
              </div>
              <div className="text-gray-700 text-[32px] font-bold leading-none">
                {measurementValue}
              </div>
            </div>

            <Tooltip
              content={airQualityText}
              placement={windowWidth > WINDOW_BREAKPOINT ? 'top' : 'left'}
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

export const AddLocationCard = React.memo(({ onOpenModal }) => (
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
