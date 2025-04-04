import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ChartContainer from '@/components/Charts/ChartContainer';
import AQNumberCard from '@/components/AQNumberCard';
import BorderlessContentBox from '@/components/Layout/borderless_content_box';
import CustomCalendar from '@/components/Calendar/CustomCalendar';
import CheckIcon from '@/icons/tickIcon';
import TabButtons from '@/components/Button/TabButtons';
import CustomDropdown from '@/components/Dropdowns/CustomDropdown';
import {
  setTimeFrame,
  setPollutant,
  setChartDataRange,
} from '@/lib/store/services/charts/ChartSlice';
import SettingsIcon from '@/icons/settings.svg';
import PlusIcon from '@/icons/map/plusIcon';
import DownloadIcon from '@/icons/Analytics/downloadIcon';
import Modal from '@/components/Modal/dataDownload';
import { setOpenModal, setModalType } from '@/lib/store/services/downloadModal';
import { TIME_OPTIONS, POLLUTANT_OPTIONS } from '@/lib/constants';
import { subDays } from 'date-fns';
import formatDateRangeToISO from '@/core/utils/formatDateRangeToISO';
import { useAnalyticsData } from '@/core/hooks/analyticHooks';
import { useGetActiveGroup } from '@/core/hooks/useGetActiveGroupId';

/**
 * Overview component for displaying analytics dashboards and charts
 */
const OverView = () => {
  const dispatch = useDispatch();

  // Get global state from Redux
  const isModalOpen = useSelector((state) => state.modal.openModal);
  const chartData = useSelector((state) => state.chart);
  const { title: groupTitle } = useGetActiveGroup();

  // Default date range for the last 7 days
  const defaultDateRange = useMemo(
    () => ({
      startDate: subDays(new Date(), 7),
      endDate: new Date(),
      label: 'Last 7 days',
    }),
    [],
  );

  // Local state for date range - initialize with the value from Redux if available,
  // otherwise use the default
  const [dateRange, setDateRange] = useState(() => {
    if (
      chartData.chartDataRange.startDate &&
      chartData.chartDataRange.endDate
    ) {
      return {
        startDate: new Date(chartData.chartDataRange.startDate),
        endDate: new Date(chartData.chartDataRange.endDate),
        label: chartData.chartDataRange.label || 'Custom Range',
      };
    }
    return defaultDateRange;
  });

  // Memoize the date range object for API calls to prevent unnecessary renders
  const apiDateRange = useMemo(
    () => ({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    }),
    [dateRange.startDate, dateRange.endDate],
  );

  // Fetch analytics data using the SWR hook with the memoized date range
  const { allSiteData, chartLoading, isError, error, refetch } =
    useAnalyticsData({
      selectedSiteIds: chartData.chartSites,
      dateRange: apiDateRange,
      frequency: chartData.timeFrame,
      pollutant: chartData.pollutionType,
      organisationName: chartData.organizationName || groupTitle,
    });

  // Initialize chart data range on component mount
  useEffect(() => {
    if (
      !chartData.chartDataRange.startDate ||
      !chartData.chartDataRange.endDate
    ) {
      const { startDate, endDate } = defaultDateRange;
      const { startDateISO, endDateISO } = formatDateRangeToISO(
        startDate,
        endDate,
      );

      dispatch(
        setChartDataRange({
          startDate: startDateISO,
          endDate: endDateISO,
          label: defaultDateRange.label,
        }),
      );
    }
  }, [dispatch, defaultDateRange, chartData.chartDataRange]);

  // Reset chart data range to default when component unmounts
  useEffect(() => {
    return () => {
      const { startDate, endDate } = defaultDateRange;
      const { startDateISO, endDateISO } = formatDateRangeToISO(
        startDate,
        endDate,
      );

      dispatch(
        setChartDataRange({
          startDate: startDateISO,
          endDate: endDateISO,
          label: defaultDateRange.label,
        }),
      );
    };
  }, [dispatch, defaultDateRange]);

  /**
   * Opens a modal of the specified type
   * @param {string} type - Modal type ('addLocation' or 'download')
   * @param {Array} ids - Optional array of IDs
   */
  const handleOpenModal = useCallback(
    (type, ids = []) => {
      dispatch(setOpenModal(true));
      dispatch(setModalType({ type, ids }));
    },
    [dispatch],
  );

  /**
   * Handles change in time frame selection
   * @param {string} option - Selected time frame option
   */
  const handleTimeFrameChange = useCallback(
    (option) => {
      if (chartData.timeFrame !== option) {
        dispatch(setTimeFrame(option));
      }
    },
    [dispatch, chartData.timeFrame],
  );

  /**
   * Handles change in pollutant selection
   * @param {string} pollutantId - ID of the selected pollutant
   */
  const handlePollutantChange = useCallback(
    (pollutantId) => {
      if (chartData.pollutionType !== pollutantId) {
        dispatch(setPollutant(pollutantId));
      }
    },
    [dispatch, chartData.pollutionType],
  );

  /**
   * Handles change in date range selection
   * Updates both local state and Redux store
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {string} label - Label for the date range
   */
  const handleDateChange = useCallback(
    (startDate, endDate, label) => {
      // Validate dates before processing
      if (!startDate || !endDate) {
        console.error('Invalid date range selected');
        return;
      }

      // Format dates for ISO storage in Redux
      const { startDateISO, endDateISO } = formatDateRangeToISO(
        startDate,
        endDate,
      );

      // Update local state first for immediate UI reflection
      setDateRange({
        startDate,
        endDate,
        label: label || 'Custom Range',
      });

      // Then update Redux store for persistence
      dispatch(
        setChartDataRange({
          startDate: startDateISO,
          endDate: endDateISO,
          label: label || 'Custom Range',
        }),
      );

      // Force refetch data with new date range
      setTimeout(() => {
        refetch();
      }, 0);
    },
    [dispatch, refetch],
  );

  /**
   * Closes the modal
   */
  const handleCloseModal = useCallback(() => {
    dispatch(setOpenModal(false));
  }, [dispatch]);

  // Determine whether to show loading state for charts
  const isChartLoading = chartLoading || (!allSiteData && !isError);

  return (
    <BorderlessContentBox>
      <div className="space-y-8">
        {/* Controls Section */}
        <div className="w-full flex flex-wrap gap-2 justify-between">
          <div className="space-x-2 flex">
            {/* Time Frame Dropdown */}
            <CustomDropdown
              btnText={chartData.timeFrame}
              dropdown
              id="days"
              className="left-0"
            >
              {TIME_OPTIONS.map((option) => (
                <span
                  key={option}
                  onClick={() => handleTimeFrameChange(option)}
                  className={`cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex justify-between items-center ${
                    chartData.timeFrame === option
                      ? 'bg-[#EBF5FF] rounded-md'
                      : ''
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </span>
                  {chartData.timeFrame === option && (
                    <CheckIcon fill="#145FFF" />
                  )}
                </span>
              ))}
            </CustomDropdown>

            {/* Custom Calendar */}
            <CustomCalendar
              initialStartDate={dateRange.startDate}
              initialEndDate={dateRange.endDate}
              initial_label={dateRange.label}
              onChange={handleDateChange}
              className="-left-24 md:left-14 lg:left-[70px] top-11"
              dropdown
              data-testid="date-range-picker"
            />

            {/* Pollutant Dropdown */}
            <CustomDropdown
              tabIcon={<SettingsIcon />}
              btnText="Pollutant"
              id="pollutant"
              className="left-0"
            >
              {POLLUTANT_OPTIONS.map((option) => (
                <span
                  key={option.id}
                  onClick={() => handlePollutantChange(option.id)}
                  className={`cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex justify-between items-center ${
                    chartData.pollutionType === option.id
                      ? 'bg-[#EBF5FF] rounded-md'
                      : ''
                  }`}
                >
                  <span className="flex items-center space-x-2">
                    {option.name}
                  </span>
                  {chartData.pollutionType === option.id && (
                    <CheckIcon fill="#145FFF" />
                  )}
                </span>
              ))}
            </CustomDropdown>
          </div>

          <div className="space-x-2 flex">
            {/* Add Location Button */}
            <TabButtons
              btnText="Add location"
              Icon={<PlusIcon width={16} height={16} />}
              onClick={() => handleOpenModal('addLocation')}
            />
            {/* Download Data Button */}
            <TabButtons
              btnText="Download Data"
              Icon={<DownloadIcon width={16} height={17} color="white" />}
              onClick={() => handleOpenModal('download')}
              btnStyle="bg-blue-600 text-white border border-blue-600 px-3 py-1 rounded-xl"
            />
          </div>
        </div>

        {/* AQ Number Card */}
        <AQNumberCard />

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Line Chart */}
          <ChartContainer
            chartType="line"
            chartTitle="Air Pollution Trends Over Time"
            height={380}
            id="air-pollution-line-chart"
            data={allSiteData}
            chartLoading={isChartLoading}
            error={isError ? error : null}
            refetch={refetch}
            dateRange={apiDateRange}
          />
          {/* Bar Chart */}
          <ChartContainer
            chartType="bar"
            chartTitle="Air Pollution Levels Distribution"
            height={380}
            id="air-pollution-bar-chart"
            data={allSiteData}
            chartLoading={isChartLoading}
            error={isError ? error : null}
            refetch={refetch}
            dateRange={apiDateRange}
          />
        </div>
      </div>

      {/* Data Download Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} />
    </BorderlessContentBox>
  );
};

export default OverView;
