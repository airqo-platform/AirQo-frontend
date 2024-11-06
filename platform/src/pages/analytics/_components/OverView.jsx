import React, { useState, useCallback, useEffect } from 'react';
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
  setRefreshChart,
} from '@/lib/store/services/charts/ChartSlice';
import SettingsIcon from '@/icons/settings.svg';
import PlusIcon from '@/icons/map/plusIcon';
import DownloadIcon from '@/icons/Analytics/downloadIcon';
import Modal from '@/components/Modal/dataDownload';
import { setOpenModal, setModalType } from '@/lib/store/services/downloadModal';
import { TIME_OPTIONS, POLLUTANT_OPTIONS } from '@/lib/constants';
import { subDays } from 'date-fns';
import formatDateRangeToISO from '@/core/utils/formatDateRangeToISO';
import {
  fetchChartAnalyticsData,
  resetAnalyticsData,
} from '@/lib/store/services/charts/ChartData';

const OverView = () => {
  const dispatch = useDispatch();

  // Access Redux state
  const isOpen = useSelector((state) => state.modal.openModal);
  const chartData = useSelector((state) => state.chart);
  const analyticsData = useSelector((state) => state.analytics.data);
  const status = useSelector((state) => state.analytics.status);
  const error = useSelector((state) => state.analytics.error);

  // Default date range for the last 7 days
  const defaultDateRange = {
    startDate: subDays(new Date(), 7),
    endDate: new Date(),
    label: 'Last 7 days',
  };

  const [dateRange, setDateRange] = useState(defaultDateRange);

  /**
   * Fetch analytics data based on selected sites and date range.
   */
  const fetchAnalyticsData = useCallback(() => {
    // If no sites are selected, reset data
    if (chartData.chartSites.length === 0) {
      console.log('No sites selected. Resetting analytics data.');
      dispatch(resetAnalyticsData());
      return;
    }

    const { startDate, endDate } = dateRange;

    // Validate that startDate and endDate are valid Date objects
    if (!(startDate instanceof Date) || isNaN(startDate)) {
      console.error('Invalid start date:', startDate);
      // Optionally, dispatch an error action or handle it via UI
      return;
    }

    if (!(endDate instanceof Date) || isNaN(endDate)) {
      console.error('Invalid end date:', endDate);
      // Optionally, dispatch an error action or handle it via UI
      return;
    }

    const requestBody = {
      sites: chartData.chartSites,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      chartType: 'line',
      frequency: chartData.timeFrame,
      pollutant: chartData.pollutionType,
      organisation_name: chartData.organizationName,
    };

    // Dispatch the thunk with requestBody
    dispatch(fetchChartAnalyticsData(requestBody));
  }, [
    dispatch,
    chartData.chartSites,
    chartData.timeFrame,
    chartData.pollutionType,
    chartData.organizationName,
    dateRange.startDate,
    dateRange.endDate,
  ]);

  // Fetch data on component mount and whenever dependencies change
  useEffect(() => {
    // Create an AbortController to handle fetch cancellation
    const controller = new AbortController();

    // Fetch analytics data
    fetchAnalyticsData();

    // Cleanup function to abort fetch on unmount
    return () => {
      controller.abort();
      dispatch(resetAnalyticsData());
    };
  }, [fetchAnalyticsData, dispatch]);

  // Listen for refresh flag to trigger data refetch
  const refreshChart = useSelector((state) => state.chart.refreshChart);
  useEffect(() => {
    if (refreshChart) {
      console.log('Refresh flag detected. Refetching analytics data.');
      fetchAnalyticsData();
      dispatch(setRefreshChart(false));
    }
  }, [refreshChart, fetchAnalyticsData, dispatch]);

  /**
   * Handles opening modals for adding locations or downloading data.
   * @param {string} type - The type of modal to open.
   * @param {Array} ids - Optional IDs related to the modal.
   */
  const handleOpenModal = useCallback(
    (type, ids = []) => {
      dispatch(setOpenModal(true));
      dispatch(setModalType({ type, ids }));
    },
    [dispatch],
  );

  /**
   * Handles changes to the time frame dropdown.
   * @param {string} option - The selected time frame option.
   */
  const handleTimeFrameChange = useCallback(
    (option) => {
      dispatch(setTimeFrame(option));
      dispatch(setRefreshChart(true));
    },
    [dispatch],
  );

  /**
   * Handles changes to the pollutant dropdown.
   * @param {string} pollutantId - The selected pollutant ID.
   */
  const handlePollutantChange = useCallback(
    (pollutantId) => {
      dispatch(setPollutant(pollutantId));
      dispatch(setRefreshChart(true));
    },
    [dispatch],
  );

  /**
   * Handles changes to the date range calendar.
   * @param {Date} startDate - The selected start date.
   * @param {Date} endDate - The selected end date.
   * @param {string} label - The label for the selected date range.
   */
  const handleDateChange = useCallback(
    (startDate, endDate, label) => {
      if (!startDate || !endDate) {
        console.error('Invalid date range selected.');
        // Optionally, dispatch an error action or handle it via UI
        return;
      }

      const { startDateISO, endDateISO } = formatDateRangeToISO(
        startDate,
        endDate,
      );

      setDateRange({ startDate, endDate, label });

      dispatch(
        setChartDataRange({
          startDate: startDateISO,
          endDate: endDateISO,
          label,
        }),
      );
      dispatch(setRefreshChart(true));
    },
    [dispatch],
  );

  return (
    <BorderlessContentBox>
      <div className="space-y-8">
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
            chartTitle="Air Pollution Data Over Time"
            height={400}
            id="air-pollution-line-chart"
            data={analyticsData}
            chartLoading={status === 'loading'}
            error={status === 'failed' ? error : null}
            refetch={fetchAnalyticsData}
          />
          {/* Bar Chart */}
          <ChartContainer
            chartType="bar"
            chartTitle="Air Pollution Data Over Time"
            height={400}
            id="air-pollution-bar-chart"
            data={analyticsData}
            chartLoading={status === 'loading'}
            error={status === 'failed' ? error : null}
            refetch={fetchAnalyticsData}
          />
        </div>
      </div>

      {/* Data Download Modal */}
      <Modal isOpen={isOpen} onClose={() => dispatch(setOpenModal(false))} />
    </BorderlessContentBox>
  );
};

export default OverView;
