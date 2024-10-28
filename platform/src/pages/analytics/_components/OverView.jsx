import React, { useState, useCallback } from 'react';
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
import useFetchAnalyticsData from '@/core/utils/useFetchAnalyticsData';

const OverView = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.modal.openModal);
  const chartData = useSelector((state) => state.chart);
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 7),
    endDate: new Date(),
    label: 'Last 7 days',
  });

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

  // Fetch analytics data for Line Chart
  const {
    allSiteData: lineData,
    chartLoading: lineLoading,
    error: lineError,
    refetch: refetchLine,
  } = useFetchAnalyticsData({
    selectedSiteIds: chartData.chartSites,
    dateRange: chartData.chartDataRange,
    chartType: 'line',
    frequency: chartData.timeFrame,
    pollutant: chartData.pollutionType,
    organisationName: chartData.organizationName,
  });

  // Fetch analytics data for Bar Chart
  const {
    allSiteData: barData,
    chartLoading: barLoading,
    error: barError,
    refetch: refetchBar,
  } = useFetchAnalyticsData({
    selectedSiteIds: chartData.chartSites,
    dateRange: chartData.chartDataRange,
    chartType: 'bar',
    frequency: chartData.timeFrame,
    pollutant: chartData.pollutionType,
    organisationName: chartData.organizationName,
  });

  return (
    <BorderlessContentBox>
      <div className="space-y-8">
        <div className="w-full flex flex-wrap gap-2 justify-between">
          <div className="space-x-2 flex">
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

            <CustomCalendar
              initialStartDate={dateRange.startDate}
              initialEndDate={dateRange.endDate}
              initial_label={dateRange.label}
              onChange={handleDateChange}
              className="-left-24 md:left-14 lg:left-[70px] top-11"
              dropdown
            />

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
            <TabButtons
              btnText="Add location"
              Icon={<PlusIcon width={16} height={16} />}
              onClick={() => handleOpenModal('addLocation')}
            />
            <TabButtons
              btnText="Download Data"
              Icon={<DownloadIcon width={16} height={17} color="white" />}
              onClick={() => handleOpenModal('download')}
              btnStyle="bg-blue-600 text-white border border-blue-600 px-3 py-1 rounded-xl"
            />
          </div>
        </div>

        <AQNumberCard />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Line Chart */}
          <ChartContainer
            chartType="line"
            chartTitle="Air Pollution Data Over Time"
            height={400}
            id="air-pollution-line-chart"
            data={lineData}
            chartLoading={lineLoading}
            error={lineError}
            refetch={refetchLine}
          />
          {/* Bar Chart */}
          <ChartContainer
            chartType="bar"
            chartTitle="Air Pollution Data Over Time"
            height={400}
            id="air-pollution-bar-chart"
            data={barData}
            chartLoading={barLoading}
            error={barError}
            refetch={refetchBar}
          />
        </div>
      </div>

      <Modal isOpen={isOpen} onClose={() => dispatch(setOpenModal(false))} />
    </BorderlessContentBox>
  );
};

export default OverView;
