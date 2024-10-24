import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
import { getAnalyticsData } from '@/core/apis/DeviceRegistry';
import { subDays, isValid, parseISO } from 'date-fns';

/**
 * Validates whether the input is a valid Date object.
 */
const isValidDate = (date) => isValid(date);

/**
 * Processes raw chart data by validating dates and organizing data by time and site.
 */
const processChartData = (data, selectedSites) => {
  const combinedData = {};

  data.forEach((dataPoint) => {
    const { value, time, site_id } = dataPoint;

    // Parse and validate the time using parseISO for consistent parsing
    const date = parseISO(time);
    if (!isValidDate(date)) {
      console.warn(`Invalid date encountered: ${time}`);
      return; // Skip invalid date entries
    }

    const site = selectedSites.find((s) => s._id === site_id);
    if (!site) return; // Ignore data for sites not selected

    const siteName = site.name?.split(',')[0] || 'Unknown Location';
    const formattedTime = date.toLocaleString();

    if (!combinedData[formattedTime]) {
      combinedData[formattedTime] = { time: formattedTime };
    }

    combinedData[formattedTime][siteName] = value;
  });

  // Convert the combined data object to an array and sort it by time
  const sortedData = Object.values(combinedData).sort(
    (a, b) => new Date(a.time) - new Date(b.time),
  );

  return sortedData;
};

const InSightsHeader = () => (
  <h3
    className="flex text-lg leading-6 font-medium text-gray-900"
    id="modal-title"
  >
    Analytics
  </h3>
);

const MoreInsights = () => {
  // const dispatch = useDispatch();
  const { data: modalData } = useSelector((state) => state.modal.modalType);
  const [chartLoading, setChartLoading] = useState(false);

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
  const [dateRange, setDateRange] = useState({
    startDate: subDays(new Date(), 7),
    endDate: new Date(),
    label: 'Last 7 days',
  });

  // State variables for loading and error management
  const [error, setError] = useState(null);

  // State to store fetched analytics data
  const [allSiteData, setAllSiteData] = useState([]);

  /**
   * Fetches analytics data based on selected sites, date range, frequency, and chart type.
   * Includes robust error handling and date validations.
   */
  const fetchAnalyticsData = useCallback(async () => {
    if (selectedSiteIds.length === 0) {
      setAllSiteData([]);
      return;
    }

    const { startDate, endDate } = dateRange;

    // Validate dateRange
    if (!isValidDate(startDate) || !isValidDate(endDate)) {
      setError('Invalid date range selected.');
      setAllSiteData([]);
      return;
    }

    // Ensure startDate is not after endDate
    if (startDate > endDate) {
      setError('Start date must be before the end date.');
      setAllSiteData([]);
      return;
    }

    const requestBody = {
      sites: selectedSiteIds,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      chartType,
      frequency,
      pollutant: 'pm2_5',
      organisation_name: 'airqo',
    };

    // Set loading states before initiating the API call
    setChartLoading(true);
    setError(null);

    try {
      const response = await getAnalyticsData(requestBody);

      if (response.status === 'success') {
        if (Array.isArray(response.data)) {
          setAllSiteData(response.data); // Store the fetched data
        } else {
          // Handle unexpected data formats gracefully
          throw new Error('Unexpected data format received from the server.');
        }
      } else {
        // Handle API response errors
        throw new Error(response.message || 'Failed to fetch analytics data.');
      }
    } catch (err) {
      console.error(err);
      setError(
        err.message || 'An error occurred while fetching analytics data.',
      );
      setAllSiteData([]);
    } finally {
      // Reset loading states after the API call
      setChartLoading(false);
    }
  }, [selectedSiteIds, dateRange, frequency, chartType]);

  // Fetch data on component mount and whenever dependencies change
  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  /**
   * Processes and memoizes chart data for optimized rendering.
   */
  const chartData = useMemo(() => {
    if (allSiteData.length === 0) return [];

    return processChartData(allSiteData, selectedSites);
  }, [allSiteData, selectedSites]);

  /**
   * Generates the content for the selected sites in the sidebar.
   * Displays loading skeletons, selected sites, or a message when no sites are selected.
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
  //   [dispatch],
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
        <div className="px-8 pt-6 pb-4 space-y-4 relative h-full overflow-y-hidden">
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
                    onClick={() => setFrequency(option)}
                    className={`cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex justify-between items-center ${
                      frequency === option ? 'bg-[#EBF5FF] rounded-md' : ''
                    }`}
                  >
                    <span>
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </span>
                    {frequency === option && <CheckIcon fill={'#145FFF'} />}
                  </span>
                ))}
              </CustomDropdown>

              {/* Date Range Picker */}
              <CustomCalendar
                initialStartDate={dateRange.startDate}
                initialEndDate={dateRange.endDate}
                onChange={(start, end) =>
                  setDateRange({ startDate: start, endDate: end, label: '' })
                }
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
                    onClick={() => setChartType(option.id)}
                    className={`cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex justify-between items-center ${
                      chartType === option.id ? 'bg-[#EBF5FF] rounded-md' : ''
                    }`}
                  >
                    <span>{option.name}</span>
                    {chartType === option.id && <CheckIcon fill={'#145FFF'} />}
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
                  handleOpenModal(
                    'downloadData',
                    selectedSiteIds,
                    selectedSites,
                  )
                }
                btnStyle="bg-blue-600 text-white border border-blue-600 px-3 py-1 rounded-xl"
                isLoading={chartLoading}
              /> */}
            </div>
          </div>

          {/* -------------------- Chart Display -------------------- */}
          <div className="w-full h-auto border rounded-xl border-grey-150 p-2">
            {selectedSiteIds.length > 0 ? (
              <MoreInsightsChart
                data={chartData}
                chartType={chartType}
                width="100%"
                height={380}
                id="air-quality-chart"
                pollutantType="pm2_5"
                isLoading={chartLoading}
              />
            ) : (
              <div className="w-full flex flex-col justify-center items-center h-[380px] text-gray-500">
                <p className="text-lg font-medium mb-2">No Data Available</p>
                <p className="text-sm">
                  Please select at least one location to view the air quality
                  data.
                </p>
              </div>
            )}
          </div>

          {/* -------------------- Air Quality Card -------------------- */}
          {/* <AirQualityCard
            airQuality="Kampala’s Air Quality has been Good this month compared to last month."
            pollutionSource="Factory, Dusty road"
            pollutant="PM2.5"
            isLoading={chartLoading}
          /> */}
        </div>
      </div>
    </>
  );
};

export { InSightsHeader };
export default MoreInsights;
