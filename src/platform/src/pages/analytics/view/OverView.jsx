import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { subDays } from 'date-fns';
import formatDateRangeToISO from '@/core/utils/formatDateRangeToISO';
import {
  setTimeFrame,
  setPollutant,
  setChartDataRange,
} from '@/lib/store/services/charts/ChartSlice';
import { setOpenModal, setModalType } from '@/lib/store/services/downloadModal';
import ChartContainer from '@/features/airQuality-charts/ChartContainer';
import AQNumberCard from '@/features/airQuality-cards';
import CustomCalendar from '@/components/Calendar/CustomCalendar';
import CustomDropdown, {
  DropdownItem,
} from '@/components/Button/CustomDropdown';
import PlusIcon from '@/icons/map/plusIcon';
import DownloadIcon from '@/icons/Analytics/downloadIcon';
import SettingsIcon from '@/icons/Analytics/SettingsIcon2';
import { TIME_OPTIONS, POLLUTANT_OPTIONS } from '@/lib/constants';
import Modal from '@/features/download-insights-locations';
import { useAnalyticsData } from '@/core/hooks/analyticHooks';
import { useGetActiveGroup } from '@/core/hooks/useGetActiveGroupId';
import Button from '@/components/Button';
import FrequencyIcon from '@/icons/Analytics/frequencyIcon';

import { useMediaQuery } from 'react-responsive';

const OverView = () => {
  const dispatch = useDispatch();
  const isModalOpen = useSelector((state) => state.modal.openModal);
  const chartData = useSelector((state) => state.chart);
  const { title: groupTitle } = useGetActiveGroup();

  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  const defaultDateRange = useMemo(
    () => ({
      startDate: subDays(new Date(), 7),
      endDate: new Date(),
      label: 'Last 7 days',
    }),
    [],
  );

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

  const apiDateRange = useMemo(
    () => ({
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
    }),
    [dateRange.startDate, dateRange.endDate],
  );

  const { allSiteData, chartLoading, isError, error, refetch } =
    useAnalyticsData({
      selectedSiteIds: chartData.chartSites,
      dateRange: apiDateRange,
      frequency: chartData.timeFrame,
      pollutant: chartData.pollutionType,
      organisationName: chartData.organizationName || groupTitle,
    });

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

  const handleOpenModal = useCallback(
    (type, ids = []) => {
      dispatch(setOpenModal(true));
      dispatch(setModalType({ type, ids }));
    },
    [dispatch],
  );

  const handleTimeFrameChange = useCallback(
    (option) => {
      if (chartData.timeFrame !== option) {
        dispatch(setTimeFrame(option));
      }
    },
    [dispatch, chartData.timeFrame],
  );

  const handlePollutantChange = useCallback(
    (pollutantId) => {
      if (chartData.pollutionType !== pollutantId) {
        dispatch(setPollutant(pollutantId));
      }
    },
    [dispatch, chartData.pollutionType],
  );

  const handleDateChange = useCallback(
    (startDate, endDate, label) => {
      if (!startDate || !endDate) return;
      const { startDateISO, endDateISO } = formatDateRangeToISO(
        startDate,
        endDate,
      );
      setDateRange({ startDate, endDate, label: label || 'Custom Range' });
      dispatch(
        setChartDataRange({
          startDate: startDateISO,
          endDate: endDateISO,
          label: label || 'Custom Range',
        }),
      );
      setTimeout(refetch, 0);
    },
    [dispatch, refetch],
  );

  const handleCloseModal = useCallback(() => {
    dispatch(setOpenModal(false));
  }, [dispatch]);

  const isChartLoading = chartLoading || (!allSiteData && !isError);

  return (
    <>
      <div className="flex flex-col gap-8">
        {/* Controls Section */}
        <div className="w-full flex flex-wrap gap-2 justify-between">
          <div className="flex flex-wrap gap-2">
            {/* Time Frame Dropdown */}
            <CustomDropdown
              icon={window.innerWidth < 640 ? <FrequencyIcon /> : undefined}
              text={<span className="capitalize">{chartData.timeFrame}</span>}
              dropdownWidth="150px"
            >
              <div className="py-1">
                {TIME_OPTIONS.map((option) => (
                  <DropdownItem
                    key={option}
                    onClick={() => handleTimeFrameChange(option)}
                    active={chartData.timeFrame === option}
                  >
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </DropdownItem>
                ))}
              </div>
            </CustomDropdown>

            {/* Custom Calendar */}
            <CustomCalendar
              initialStartDate={dateRange.startDate}
              initialEndDate={dateRange.endDate}
              initial_label={dateRange.label}
              onChange={handleDateChange}
              horizontalOffset={isMobile ? 0 : 75}
              dropdown
              data-testid="date-range-picker"
            />

            {/* Pollutant Dropdown */}
            <CustomDropdown
              text="Pollutant"
              icon={<SettingsIcon />}
              iconPosition="left"
            >
              <div className="py-1">
                {POLLUTANT_OPTIONS.map((option) => (
                  <DropdownItem
                    key={option.id}
                    onClick={() => handlePollutantChange(option.id)}
                    active={chartData.pollutionType === option.id}
                  >
                    {option.name}
                  </DropdownItem>
                ))}
              </div>
            </CustomDropdown>
          </div>

          <div className="gap-2 flex flex-wrap">
            {/* Add Location Button */}
            <CustomDropdown
              text="Add location"
              icon={<PlusIcon width={16} height={16} />}
              iconPosition="left"
              isButton
              onClick={() => handleOpenModal('addLocation')}
            />

            <CustomDropdown
              isButton
              trigger={
                <Button
                  onClick={() => handleOpenModal('download')}
                  Icon={DownloadIcon}
                >
                  Download Data
                </Button>
              }
            />
          </div>
        </div>

        {/* AQ Number Card */}
        <AQNumberCard />

        {/* Charts Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
};

export default OverView;
