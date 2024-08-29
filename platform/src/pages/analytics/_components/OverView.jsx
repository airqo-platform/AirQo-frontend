'use client';
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ChartContainer from '@/components/Charts/ChartContainer';
import AQNumberCard from '@/components/AQNumberCard';
import BorderlessContentBox from '@/components/Layout/borderless_content_box';
import { fetchRecentMeasurementsData } from '@/lib/store/services/deviceRegistry/RecentMeasurementsSlice';
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

const TIME_OPTIONS = ['hourly', 'daily', 'weekly', 'monthly'];
const POLLUTANT_OPTIONS = [
  { id: 'pm2_5', name: 'PM2.5' },
  { id: 'pm10', name: 'PM10' },
];

const useFetchMeasurements = () => {
  const dispatch = useDispatch();
  const chartData = useSelector((state) => state.chart);
  const preferenceData =
    useSelector((state) => state.defaults.individual_preferences) || [];
  const preferencesLoading = useSelector(
    (state) => state.userDefaults.status === 'loading',
  );
  const refreshChart = useSelector((state) => state.chart.refreshChart);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (preferencesLoading || !preferenceData.length) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        const { selected_sites } = preferenceData[0];
        const chartSites = selected_sites?.map((site) => site['_id']);

        if (chartSites?.length > 0) {
          await dispatch(
            fetchRecentMeasurementsData({
              site_id: chartSites.join(','),
            }),
          );
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dispatch, preferenceData, chartData, refreshChart]);

  return { isLoading, error };
};

const OverView = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.modal.openModal);
  const recentLocationMeasurements = useSelector(
    (state) => state.recentMeasurements.measurements,
  );
  const pollutantType = useSelector((state) => state.chart.pollutionType);
  const preferenceData =
    useSelector((state) => state.defaults.individual_preferences) || [];
  const siteData = useSelector((state) => state.grids.sitesSummary);
  const { isLoading: isLoadingMeasurements } = useFetchMeasurements();
  const chartData = useSelector((state) => state.chart);

  const getSiteName = useCallback(
    (siteId) => {
      if (!preferenceData.length) return null;
      const site = preferenceData[0]?.selected_sites?.find(
        (site) => site._id === siteId,
      );
      return site ? site.search_name?.split(',')[0] : '';
    },
    [preferenceData],
  );

  const getExistingSiteName = useCallback(
    (siteId) => {
      const site = siteData?.sites?.find((site) => site._id === siteId);
      return site ? site.search_name : '';
    },
    [siteData],
  );

  const dummyData = useMemo(
    () => ({
      siteDetails: {
        search_name: '--',
        location_name: '--',
        formatted_name: '--',
        description: '--',
        country: '--',
      },
      pm2_5: {
        value: '--',
      },
    }),
    [],
  );

  const displayData = useMemo(() => {
    let data = recentLocationMeasurements
      ? recentLocationMeasurements.slice(0, 4)
      : [];
    while (data.length < 4) {
      data.push(dummyData);
    }
    return data;
  }, [recentLocationMeasurements, dummyData]);

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
    },
    [dispatch],
  );

  const handlePollutantChange = useCallback(
    (pollutantId) => {
      dispatch(setPollutant(pollutantId));
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
              initialStartDate={chartData.chartDataRange.startDate}
              initialEndDate={chartData.chartDataRange.endDate}
              className="-left-24 md:left-14 lg:left-[118px] top-11"
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

        <div className={`gap-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4`}>
          {displayData.map((event, index) => (
            <AQNumberCard
              key={index}
              handleClick={() => handleOpenModal('location')}
              location={
                getSiteName(event.site_id) ||
                getExistingSiteName(event.site_id) ||
                event?.siteDetails?.search_name
              }
              country={event?.siteDetails?.country}
              locationFullName={
                getSiteName(event.site_id) ||
                getExistingSiteName(event.site_id) ||
                event?.siteDetails?.search_name
              }
              reading={event.pm2_5.value}
              count={displayData.length}
              pollutant={pollutantType}
              isLoading={isLoadingMeasurements}
            />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartContainer
            chartType="line"
            chartTitle="Air quality over time"
            height={400}
          />
          <ChartContainer
            chartType="bar"
            chartTitle="Air quality over time"
            height={400}
          />
        </div>
      </div>
      <Modal isOpen={isOpen} onClose={() => dispatch(setOpenModal(false))} />
    </BorderlessContentBox>
  );
};

export default React.memo(OverView);
