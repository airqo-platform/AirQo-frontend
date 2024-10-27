import React, { useState, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
// import DownloadIcon from '@/icons/Analytics/downloadIcon';
import MoreInsightsChart from '@/components/Charts/MoreInsightsChart';
import CustomCalendar from '@/components/Calendar/CustomCalendar';
import CheckIcon from '@/icons/tickIcon';
// import TabButtons from '@/components/Button/TabButtons';
import CustomDropdown from '@/components/Dropdowns/CustomDropdown';
import { TIME_OPTIONS, CHART_TYPE } from '@/lib/constants';
// import AirQualityCard from '../components/AirQualityCard';
import LocationCard from '../components/LocationCard';
import LocationIcon from '@/icons/Analytics/LocationIcon';
// import { setOpenModal, setModalType } from '@/lib/store/services/downloadModal';
import { subDays } from 'date-fns';
import useFetchAnalyticsData from '@/core/utils/useFetchAnalyticsData';
import formatDateRangeToISO from '@/core/utils/formatDateRangeToISO';
import SkeletonLoader from '@/components/Charts/components/SkeletonLoader';

/**
 * InSightsHeader Component
 */
const InSightsHeader = () => (
  <h3
    className="flex text-lg leading-6 font-medium text-gray-900"
    id="modal-title"
  >
    Analytics
  </h3>
);

/**
 * MoreInsights Component
 */
const MoreInsights = () => {
  // const dispatch = useDispatch();
  const { data: modalData } = useSelector((state) => state.modal.modalType);
  const chartData = useSelector((state) => state.chart);

  // Ensure modalData is always an array for consistency
  const selectedSites = useMemo(() => {
    if (!modalData) return [];
    return Array.isArray(modalData) ? modalData : [modalData];
  }, [modalData]);

  // Extract site IDs from selected sites for API requests
  const selectedSiteIds = useMemo(
    () => selectedSites.map((site) => site._id),
    [selectedSites],
  );

  // State variables for frequency, chart type, and date range
  const [frequency, setFrequency] = useState('daily');
  const [chartType, setChartType] = useState('line');

  // Initialize date range to last 7 days
  const initialDateRange = useMemo(() => {
    const { startDateISO, endDateISO } = formatDateRangeToISO(
      subDays(new Date(), 7),
      new Date(),
    );
    return {
      startDate: startDateISO,
      endDate: endDateISO,
      label: 'Last 7 days',
    };
  }, []);

  const [dateRange, setDateRange] = useState(initialDateRange);

  // Fetch analytics data using custom hook
  const { allSiteData, chartLoading, error, refetch } = useFetchAnalyticsData({
    selectedSiteIds,
    dateRange,
    chartType,
    frequency,
    pollutant: chartData.pollutionType,
    organisationName: chartData.organisationName,
  });

  /**
   * Handles refetching data when a parameter changes.
   */
  const handleParameterChange = useCallback(() => {
    refetch();
  }, [refetch]);

  /**
   * Generates the content for the selected sites in the sidebar.
   * Displays selected sites or a message when no sites are selected.
   */
  const selectedSitesContent = useMemo(() => {
    if (selectedSites.length === 0) {
      return (
        <div className="text-gray-500 w-full text-sm h-auto flex flex-col justify-center items-center">
          <span className="p-2 rounded-full bg-[#F6F6F7] mb-2">
            <LocationIcon width={20} height={20} fill="#9EA3AA" />
          </span>
          No locations selected
        </div>
      );
    }

    return selectedSites.map((site) => (
      <LocationCard
        key={site._id}
        site={site}
        onToggle={() => {}}
        isSelected={true}
        isLoading={false}
      />
    ));
  }, [selectedSites]);

  /**
   * Handles opening the modal with the specified type, ids, and data.
   * Utilizes Redux actions for state management.
   */
  // const handleOpenModal = useCallback(
  //   (type, ids = [], data = null) => {
  //     dispatch(setModalType({ type, ids, data }));
  //     dispatch(setOpenModal(true));
  //   },
  //   [dispatch]
  // );

  return (
    <>
      {/* -------------------- Sidebar for Selected Sites -------------------- */}
      <div className="w-[280px] h-[658px] overflow-y-auto border-r relative space-y-3 px-4 pt-5 pb-14">
        {selectedSitesContent}
        {/* Add Location Button */}
        {/* {!chartLoading && (
          <button
            onClick={() => handleOpenModal('moreSights')}
            className="bg-blue-50 w-full rounded-xl px-2 py-4 h-[70px] flex justify-center items-center text-blue-500 transition-transform transform hover:scale-95"
          >
            + Add location
          </button>
        )} */}
      </div>

      {/* -------------------- Main Content Area -------------------- */}
      <div className="bg-white relative w-full h-full">
        <div className="px-8 pt-6 pb-4 space-y-4 relative h-full overflow-hidden">
          {/* -------------------- Error Display -------------------- */}
          {error && (
            <div className="w-full p-4 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {/* -------------------- Controls: Dropdowns and Actions -------------------- */}
          <div className="w-full flex flex-wrap gap-2 justify-between">
            <div className="space-x-2 flex">
              {/* Frequency Dropdown */}
              <CustomDropdown
                btnText={frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                dropdown
                id="frequency"
                className="left-0"
                isLoading={chartLoading}
              >
                {TIME_OPTIONS.map((option) => (
                  <span
                    key={option}
                    onClick={() => {
                      if (frequency !== option) {
                        setFrequency(option);
                        handleParameterChange();
                      }
                    }}
                    className={`cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex justify-between items-center ${
                      frequency === option ? 'bg-[#EBF5FF] rounded-md' : ''
                    }`}
                  >
                    <span>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </span>
                    {frequency === option && <CheckIcon fill="#145FFF" />}
                  </span>
                ))}
              </CustomDropdown>

              {/* Date Range Picker */}
              <CustomCalendar
                initialStartDate={new Date(dateRange.startDate)}
                initialEndDate={new Date(dateRange.endDate)}
                onChange={(start, end, label) => {
                  if (start && end) {
                    setDateRange({
                      startDate: start.toISOString(),
                      endDate: end.toISOString(),
                      label,
                    });
                    handleParameterChange();
                  }
                }}
                className="left-16 top-11"
                dropdown
                isLoading={chartLoading}
              />

              {/* Chart Type Dropdown */}
              <CustomDropdown
                btnText={chartType.charAt(0).toUpperCase() + chartType.slice(1)}
                id="chartType"
                className="left-0"
                isLoading={chartLoading}
              >
                {CHART_TYPE.map((option) => (
                  <span
                    key={option.id}
                    onClick={() => {
                      if (chartType !== option.id) {
                        setChartType(option.id);
                        handleParameterChange();
                      }
                    }}
                    className={`cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex justify-between items-center ${
                      chartType === option.id ? 'bg-[#EBF5FF] rounded-md' : ''
                    }`}
                  >
                    <span>{option.name}</span>
                    {chartType === option.id && <CheckIcon fill="#145FFF" />}
                  </span>
                ))}
              </CustomDropdown>
            </div>

            {/* Actions: Download Data */}
            <div className="space-x-2 flex">
              {/* <TabButtons
                btnText="Download Data"
                Icon={<DownloadIcon width={16} height={17} color="white" />}
                onClick={() =>
                  handleOpenModal('downloadData', selectedSiteIds, selectedSites)
                }
                btnStyle="bg-blue-600 text-white border border-blue-600 px-3 py-1 rounded-xl"
                isLoading={chartLoading}
              /> */}
            </div>
          </div>

          {/* -------------------- Chart Display -------------------- */}
          <div className="w-full h-auto border rounded-xl border-grey-150 p-2">
            {chartLoading ? (
              <SkeletonLoader width="100%" height={380} />
            ) : error ? (
              <div className="w-full flex items-center justify-center h-[380px]">
                <p className="text-red-500 font-semibold">
                  Something went wrong. Please try again.
                </p>
                <button
                  onClick={refetch}
                  className="ml-4 text-red-500 font-semibold underline"
                >
                  Try again
                </button>
              </div>
            ) : (
              <MoreInsightsChart
                data={allSiteData}
                selectedSites={selectedSiteIds}
                chartType={chartType}
                frequency={frequency}
                width="100%"
                height={380}
                id="air-quality-chart"
                pollutantType={chartData.pollutionType}
              />
            )}
          </div>

          {/* -------------------- Air Quality Card -------------------- */}
          {/* <AirQualityCard
            airQuality="Kampala’s Air Quality has been Good this month compared to last month."
            pollutionSource="Factory, Dusty road"
            pollutant="PM2_5"
            isLoading={chartLoading}
          /> */}
        </div>
      </div>
    </>
  );
};

export { InSightsHeader };
export default MoreInsights;
