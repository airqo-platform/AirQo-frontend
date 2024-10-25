'use client';
import React, { useEffect, useState, useCallback } from 'react';
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
} from '@/lib/store/services/charts/ChartSlice';
import SettingsIcon from '@/icons/settings.svg';
import PlusIcon from '@/icons/map/plusIcon';
import DownloadIcon from '@/icons/Analytics/downloadIcon';
import Modal from '@/components/Modal/dataDownload';
import { setOpenModal, setModalType } from '@/lib/store/services/downloadModal';
import { TIME_OPTIONS, POLLUTANT_OPTIONS } from '@/lib/constants';
import { getIndividualUserPreferences } from '@/lib/store/services/account/UserDefaultsSlice';
import { fetchSitesSummary } from '@/lib/store/services/sitesSummarySlice';
import {
  setChartDataRange,
  setRefreshChart,
} from '@/lib/store/services/charts/ChartSlice';
import { subDays } from 'date-fns';

const OverView = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.modal.openModal);
  const chartData = useSelector((state) => state.chart);
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 7),
    endDate: new Date(),
    label: 'Last 7 days',
  });

  // get loggedUser from local storage
  const user = JSON.parse(localStorage.getItem('loggedUser'));

  // Dispatch the async action to fetch the sites summary data when the component mounts
  useEffect(() => {
    dispatch(fetchSitesSummary());
  }, [dispatch]);

  // Fetch use preferences data
  useEffect(() => {
    if (!user) return;
    dispatch(getIndividualUserPreferences(user._id));
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
                    <span>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </span>
                  </span>
                  {chartData.timeFrame === option && (
                    <CheckIcon fill={'#145FFF'} />
                  )}
                </span>
              ))}
            </CustomDropdown>

            <CustomCalendar
              initialStartDate={dateRange.startDate}
              initialEndDate={dateRange.endDate}
              onChange={(startDate, endDate, label) => {
                dispatch(setChartDataRange({ startDate, endDate, label }));
                dispatch(setRefreshChart(true));
              }}
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
                    <span>{option.name}</span>
                  </span>
                  {chartData.pollutionType === option.id && (
                    <CheckIcon fill={'#145FFF'} />
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
              btnStyle={
                'bg-blue-600 text-white border border-blue-600 px-3 py-1 rounded-xl'
              }
            />
          </div>
        </div>

        <AQNumberCard />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartContainer
            chartType="line"
            chartTitle="Air Pollution Data Over Time"
            height={400}
            id="air-pollution-line-chart-1"
          />
          <ChartContainer
            chartType="bar"
            chartTitle="Air Pollution Data Over Time"
            height={400}
            id="air-pollution-bar-chart-1"
          />
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={() => dispatch(setOpenModal(false))} />
    </BorderlessContentBox>
  );
};

export default React.memo(OverView);
