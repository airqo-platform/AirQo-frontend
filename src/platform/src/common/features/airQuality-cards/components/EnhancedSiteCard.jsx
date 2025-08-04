import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { format, subDays } from 'date-fns';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import Card from '@/components/CardWrapper';
import { IconMap, AQI_CATEGORY_MAP } from '../constants';
import { Tooltip } from 'flowbite-react';

const TREND_COLORS = {
  improving: '#10B981', // Green
  worsening: '#EF4444', // Red
  stable: '#6B7280', // Gray
};

const getTrendDirection = (percentageChange) => {
  if (Math.abs(percentageChange) < 5) return 'stable';
  return percentageChange > 0 ? 'worsening' : 'improving';
};

const getTrendMessage = (percentageChange, direction) => {
  const absChange = Math.abs(percentageChange);
  const timeframe = 'compared to last week';

  switch (direction) {
    case 'improving':
      return `Air quality improved by ${absChange.toFixed(1)}% ${timeframe}`;
    case 'worsening':
      return `Air quality worsened by ${absChange.toFixed(1)}% ${timeframe}`;
    case 'stable':
      return `Air quality remained stable ${timeframe}`;
    default:
      return 'No trend data available';
  }
};

const generateMockTrendData = (currentValue, days = 7) => {
  // Generate mock trend data for the mini chart
  const data = [];
  const baseValue = currentValue || 25;

  for (let i = days - 1; i >= 0; i--) {
    const variance = (Math.random() - 0.5) * 10; // ±5 variation
    const value = Math.max(0, baseValue + variance);
    data.push({
      day: subDays(new Date(), i),
      value: value,
    });
  }

  return data;
};

const EnhancedSiteCard = ({
  site,
  measurement,
  onOpenModal,
  pollutantType,
  showTrend = true,
  showMiniChart = true,
}) => {
  const cardData = useMemo(() => {
    // AQI and status data
    const aqiCategory = measurement?.aqi_category ?? '--';
    const statusKey = AQI_CATEGORY_MAP[aqiCategory] ?? '--';
    const AirQualityIcon = IconMap[statusKey] ?? IconMap.unknown;

    // Measurement values
    const currentValue = measurement?.[pollutantType]?.value;
    const formattedValue =
      currentValue != null ? currentValue.toFixed(2) : '--';

    // Trend data
    const percentageChange = measurement?.averages?.percentageDifference || 0;
    const trendDirection = getTrendDirection(percentageChange);
    const trendMessage = getTrendMessage(percentageChange, trendDirection);
    const trendColor = TREND_COLORS[trendDirection];

    // Mini chart data
    const trendData = showMiniChart ? generateMockTrendData(currentValue) : [];

    return {
      siteName: site.search_name || '---',
      siteCountry: site.country || '---',
      aqiCategory,
      statusKey,
      AirQualityIcon,
      currentValue,
      formattedValue,
      percentageChange,
      trendDirection,
      trendMessage,
      trendColor,
      trendData,
    };
  }, [site, measurement, pollutantType, showMiniChart]);

  const handleClick = () => {
    onOpenModal('inSights', [], site);
  };

  const getTrendIcon = () => {
    switch (cardData.trendDirection) {
      case 'improving':
        return '↗️';
      case 'worsening':
        return '↘️';
      case 'stable':
        return '→';
      default:
        return '~';
    }
  };

  return (
    <Card
      onClick={handleClick}
      role="button"
      tabIndex={0}
      padding="p-4 sm:p-5"
      className="relative w-full max-w-full overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="flex flex-col h-full space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-2">
            <h3
              className="text-lg font-semibold truncate dark:text-white"
              title={cardData.siteName}
            >
              {cardData.siteName}
            </h3>
            <p
              className="text-sm text-gray-500 dark:text-gray-400 truncate capitalize"
              title={cardData.siteCountry}
            >
              {cardData.siteCountry}
            </p>
          </div>

          {/* AQI Icon */}
          <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
            <cardData.AirQualityIcon
              className="w-full h-full"
              aria-hidden="true"
            />
          </div>
        </div>

        {/* Main Value Display */}
        <div className="flex items-end justify-between">
          <div className="flex-1">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-bold text-gray-800 dark:text-white">
                {cardData.formattedValue}
              </span>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                μg/m³
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {pollutantType === 'pm2_5' ? 'PM2.5' : 'PM10'}
            </p>
          </div>

          {/* Mini Trend Chart */}
          {showMiniChart && cardData.trendData.length > 0 && (
            <div className="w-20 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cardData.trendData}>
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={cardData.trendColor}
                    strokeWidth={2}
                    dot={false}
                  />
                  <YAxis hide />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Trend Information */}
        {showTrend && cardData.percentageChange !== 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center space-x-2">
              <span className="text-lg">{getTrendIcon()}</span>
              <span
                className="text-sm font-medium"
                style={{ color: cardData.trendColor }}
              >
                {Math.abs(cardData.percentageChange).toFixed(1)}%
              </span>
            </div>

            <Tooltip content={cardData.trendMessage} placement="top">
              <div
                className="h-2 w-16 rounded-full"
                style={{
                  backgroundColor: cardData.trendColor + '40',
                  border: `1px solid ${cardData.trendColor}`,
                }}
              />
            </Tooltip>
          </div>
        )}

        {/* AQI Category Badge */}
        <div className="flex justify-between items-center">
          <span
            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
            style={{
              backgroundColor: cardData.trendColor + '20',
              color: cardData.trendColor,
            }}
          >
            {cardData.aqiCategory}
          </span>

          <span className="text-xs text-gray-400 dark:text-gray-500">
            {format(new Date(), 'MMM dd, HH:mm')}
          </span>
        </div>
      </div>
    </Card>
  );
};

EnhancedSiteCard.propTypes = {
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
  pollutantType: PropTypes.oneOf(['pm2_5', 'pm10']).isRequired,
  showTrend: PropTypes.bool,
  showMiniChart: PropTypes.bool,
};

export default React.memo(EnhancedSiteCard);
