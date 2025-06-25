import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import { subDays, format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useAnalyticsData } from '@/core/hooks/analyticHooks';
import { useTheme } from '@/common/features/theme-customizer/hooks/useTheme';
import CustomDropdown, {
  DropdownItem,
} from '@/components/Button/CustomDropdown';
import Button from '@/components/Button';
import Card from '@/components/CardWrapper';
import { CustomGraphTooltip } from './index';
import SkeletonLoader from './SkeletonLoader';

const COMPARISON_PERIODS = [
  { value: 'previous_week', label: 'Previous Week', dayOffset: 7 },
  { value: 'previous_month', label: 'Previous Month', dayOffset: 30 },
  { value: 'previous_quarter', label: 'Previous Quarter', dayOffset: 90 },
  {
    value: 'same_period_last_year',
    label: 'Same Period Last Year',
    dayOffset: 365,
  },
];

const ChartComparison = ({
  currentDateRange,
  selectedSites,
  frequency,
  pollutant,
  organizationName,
}) => {
  const { theme, systemTheme } = useTheme();
  const isDark =
    theme === 'dark' || (theme === 'system' && systemTheme === 'dark');

  const [comparisonPeriod, setComparisonPeriod] = useState('previous_week');
  const [isComparisonEnabled, setIsComparisonEnabled] = useState(false);

  // Calculate comparison date range
  const comparisonDateRange = useMemo(() => {
    if (!currentDateRange?.startDate || !currentDateRange?.endDate) return null;

    const selectedPeriod = COMPARISON_PERIODS.find(
      (p) => p.value === comparisonPeriod,
    );
    if (!selectedPeriod) return null;

    const currentStart = new Date(currentDateRange.startDate);
    const currentEnd = new Date(currentDateRange.endDate);
    const daysDifference = Math.ceil(
      (currentEnd - currentStart) / (1000 * 60 * 60 * 24),
    );

    const comparisonEnd = subDays(currentStart, 1);
    const comparisonStart = subDays(comparisonEnd, daysDifference);

    return {
      startDate: comparisonStart,
      endDate: comparisonEnd,
    };
  }, [currentDateRange, comparisonPeriod]);

  // Fetch current period data
  const { allSiteData: currentData, chartLoading: currentLoading } =
    useAnalyticsData({
      selectedSiteIds: selectedSites,
      dateRange: currentDateRange,
      frequency,
      pollutant,
      organisationName: organizationName,
    });

  // Fetch comparison period data
  const { allSiteData: comparisonData, chartLoading: comparisonLoading } =
    useAnalyticsData(
      {
        selectedSiteIds: selectedSites,
        dateRange: comparisonDateRange,
        frequency,
        pollutant,
        organisationName: organizationName,
      },
      {
        enabled: isComparisonEnabled && !!comparisonDateRange,
      },
    );

  // Combine and process data for comparison
  const combinedData = useMemo(() => {
    if (!isComparisonEnabled || !currentData || !comparisonData)
      return currentData;

    // Process data to align dates and create comparison structure
    const processedData = currentData.map((currentPoint, index) => {
      const comparisonPoint = comparisonData[index];
      const result = { ...currentPoint };

      if (comparisonPoint) {
        // Add comparison values with a different key
        Object.keys(currentPoint).forEach((key) => {
          if (key !== 'time' && typeof currentPoint[key] === 'number') {
            result[`${key}_comparison`] = comparisonPoint[key];
          }
        });
      }

      return result;
    });

    return processedData;
  }, [currentData, comparisonData, isComparisonEnabled]);

  // Generate colors for lines
  const getLineColor = useCallback((siteId, isComparison = false) => {
    const baseHue = Math.abs(siteId.hashCode ? siteId.hashCode() : 0) % 360;
    return `hsl(${baseHue}, 70%, ${isComparison ? '40%' : '60%'})`;
  }, []);

  // Render comparison lines
  const renderLines = useCallback(() => {
    if (!selectedSites?.length) return null;

    const lines = [];

    selectedSites.forEach((siteId, index) => {
      // Current period line
      lines.push(
        <Line
          key={`current-${siteId}`}
          type="monotone"
          dataKey={siteId}
          stroke={getLineColor(siteId)}
          strokeWidth={2}
          dot={false}
          connectNulls={false}
          name={`Current - Site ${index + 1}`}
        />,
      );

      // Comparison period line (if enabled)
      if (isComparisonEnabled) {
        lines.push(
          <Line
            key={`comparison-${siteId}`}
            type="monotone"
            dataKey={`${siteId}_comparison`}
            stroke={getLineColor(siteId, true)}
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            connectNulls={false}
            name={`${COMPARISON_PERIODS.find((p) => p.value === comparisonPeriod)?.label} - Site ${index + 1}`}
          />,
        );
      }
    });

    return lines;
  }, [selectedSites, isComparisonEnabled, comparisonPeriod, getLineColor]);

  const isLoading =
    currentLoading || (isComparisonEnabled && comparisonLoading);

  return (
    <Card padding="p-6" className="w-full">
      <div className="flex flex-col space-y-4">
        {/* Header Controls */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Air Quality Comparison
          </h3>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={isComparisonEnabled ? 'filled' : 'outlined'}
              onClick={() => setIsComparisonEnabled(!isComparisonEnabled)}
              className="text-sm"
            >
              {isComparisonEnabled ? 'Disable' : 'Enable'} Comparison
            </Button>

            {isComparisonEnabled && (
              <CustomDropdown
                text={
                  COMPARISON_PERIODS.find((p) => p.value === comparisonPeriod)
                    ?.label || 'Select Period'
                }
                dropdownWidth="200px"
              >
                <div className="py-1">
                  {COMPARISON_PERIODS.map((period) => (
                    <DropdownItem
                      key={period.value}
                      onClick={() => setComparisonPeriod(period.value)}
                      active={comparisonPeriod === period.value}
                    >
                      {period.label}
                    </DropdownItem>
                  ))}
                </div>
              </CustomDropdown>
            )}
          </div>
        </div>

        {/* Chart Area */}
        <div className="h-96 w-full">
          {isLoading ? (
            <SkeletonLoader />
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={combinedData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDark ? '#374151' : '#E5E7EB'}
                />
                <XAxis
                  dataKey="time"
                  tickFormatter={(time) => format(new Date(time), 'MMM dd')}
                  stroke={isDark ? '#9CA3AF' : '#6B7280'}
                  fontSize={12}
                />
                <YAxis
                  stroke={isDark ? '#9CA3AF' : '#6B7280'}
                  fontSize={12}
                  label={{
                    value: `${pollutant === 'pm2_5' ? 'PM2.5' : 'PM10'} (μg/m³)`,
                    angle: -90,
                    position: 'insideLeft',
                  }}
                />
                <Tooltip
                  content={<CustomGraphTooltip pollutionType={pollutant} />}
                />
                <Legend verticalAlign="bottom" height={36} iconType="line" />
                {renderLines()}
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Comparison Insights */}
        {isComparisonEnabled && !isLoading && combinedData?.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
              Comparison Insights
            </h4>
            <p className="text-sm text-blue-600 dark:text-blue-300">
              Comparing current period with{' '}
              {COMPARISON_PERIODS.find(
                (p) => p.value === comparisonPeriod,
              )?.label.toLowerCase()}
              . Solid lines represent current data, dashed lines represent
              comparison period.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};

ChartComparison.propTypes = {
  currentDateRange: PropTypes.shape({
    startDate: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]),
    endDate: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.instanceOf(Date),
    ]),
  }),
  selectedSites: PropTypes.array,
  frequency: PropTypes.string,
  pollutant: PropTypes.string,
  organizationName: PropTypes.string,
};

// Helper function for string hashing (for colors)
String.prototype.hashCode = function () {
  let hash = 0;
  if (this.length === 0) return hash;
  for (let i = 0; i < this.length; i++) {
    const char = this.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
};

export default React.memo(ChartComparison);
