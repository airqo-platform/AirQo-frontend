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
  resetChartStore,
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
import { getAnalyticsData } from '@/core/apis/DeviceRegistry';

const OverView = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.modal.openModal);
  const chartData = useSelector((state) => state.chart);

  // Default date range for the last 7 days
  const defaultDateRange = {
    startDate: subDays(new Date(), 7),
    endDate: new Date(),
    label: 'Last 7 days',
  };

  const [dateRange, setDateRange] = useState(defaultDateRange);
  const [lineData, setLineData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch analytics data
  const fetchAnalyticsData = useCallback(async () => {
    setLoading(true);
    setError(null);

    // If no sites are selected, reset data
    if (chartData.chartSites.length === 0) {
      setLineData([]);
      setBarData([]);
      setLoading(false);
      return;
    }

    const { startDate, endDate } = dateRange;

    // Validate that startDate and endDate are valid Date objects
    if (!(startDate instanceof Date) || isNaN(startDate)) {
      setError('Invalid start date.');
      setLineData([]);
      setBarData([]);
      setLoading(false);
      return;
    }

    if (!(endDate instanceof Date) || isNaN(endDate)) {
      setError('Invalid end date.');
      setLineData([]);
      setBarData([]);
      setLoading(false);
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

    const controller = new AbortController();

    try {
      const response = await getAnalyticsData({
        body: requestBody,
        signal: controller.signal,
      });

      if (response.status === 'success' && Array.isArray(response.data)) {
        setLineData(response.data);
        setBarData(response.data);
      } else {
        throw new Error(response.message || 'Failed to fetch analytics data.');
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Error fetching analytics data:', err);
        setError(err.message || 'An unexpected error occurred.');
        setLineData([]);
        setBarData([]);
      }
    } finally {
      setLoading(false);
    }

    // Cleanup function to abort fetch on unmount or dependency change
    return () => controller.abort();
  }, [
    chartData.chartSites,
    dateRange.startDate,
    dateRange.endDate,
    chartData.timeFrame,
    chartData.pollutionType,
    chartData.organizationName,
  ]);

  // Fetch data on component mount and whenever dependencies change
  useEffect(() => {
    fetchAnalyticsData();

    // Cleanup function
    return () => {};
  }, [fetchAnalyticsData]);

  // Reset chart data to default when the component is unmounted
  useEffect(() => {
    return () => {
      dispatch(resetChartStore());
    };
  }, [dispatch]);

  const handleOpenModal = useCallback(
    (type, ids = []) => {
      dispatch(setOpenModal(true));
      dispatch(setModalType({ type, ids }));
    },
    [dispatch],
  );

  const handleTimeFrameChange = useCallback(
    (option) => {
      dispatch(setTimeFrame(option));
      dispatch(setRefreshChart(true));
    },
    [dispatch],
  );

  const handlePollutantChange = useCallback(
    (pollutantId) => {
      dispatch(setPollutant(pollutantId));
      dispatch(setRefreshChart(true));
    },
    [dispatch],
  );

  const handleDateChange = useCallback(
    (startDate, endDate, label) => {
      if (!startDate || !endDate) {
        setError('Invalid date range selected.');
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
            data={lineData}
            chartLoading={loading}
            error={error}
            refetch={fetchAnalyticsData}
          />
          {/* Bar Chart */}
          <ChartContainer
            chartType="bar"
            chartTitle="Air Pollution Data Over Time"
            height={400}
            id="air-pollution-bar-chart"
            data={barData}
            chartLoading={loading}
            error={error}
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
