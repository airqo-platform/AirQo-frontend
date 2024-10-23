import React, { useState, useCallback, useMemo, useEffect } from 'react';
import DownloadIcon from '@/icons/Analytics/downloadIcon';
import MoreInsightsChart from '@/components/Charts/MoreInsightsChart';
import CustomCalendar from '@/components/Calendar/CustomCalendar';
import CheckIcon from '@/icons/tickIcon';
import TabButtons from '@/components/Button/TabButtons';
import CustomDropdown from '@/components/Dropdowns/CustomDropdown';
import { TIME_OPTIONS, CHART_TYPE } from '@/lib/constants';
import AirQualityCard from '../components/AirQualityCard';
import LocationCard from '../components/LocationCard';
import LocationIcon from '@/icons/Analytics/LocationIcon';
import { useDispatch, useSelector } from 'react-redux';
import { setOpenModal, setModalType } from '@/lib/store/services/downloadModal';

const InSightsHeader = () => (
  <h3
    className="flex text-lg leading-6 font-medium text-gray-900"
    id="modal-title"
  >
    Analytics
  </h3>
);

const MoreInsights = () => {
  const dispatch = useDispatch();
  const { data } = useSelector((state) => state.modal.modalType);
  console.log(data);

  // State for selected sites
  const [selectedSites, setSelectedSites] = useState([
    { id: 1, location: 'Makerere University', country: 'Uganda' },
    { id: 2, location: 'Nakasero Hill', country: 'Uganda' },
  ]);

  // State for frequency, date range, and chart type
  const [frequency, setFrequency] = useState('daily');
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [chartType, setChartType] = useState('line');

  // State for loading and error
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sample sites data
  const sites = [
    { id: 1, location: 'Makerere University', country: 'Uganda' },
    { id: 2, location: 'Nakasero Hill', country: 'Uganda' },
  ];

  // State to store fetched data
  const [allSiteData, setAllSiteData] = useState({});

  /**
   * Simulate fetching data from an API
   */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Mock data representing air quality data for different locations
        const fetchedData = {
          1: [
            {
              time: '2024-05-20T10:00:00.000000Z',
              pm2_5: 12.34,
              pm10: 40.56,
              no2: 22.78,
            },
            {
              time: '2024-05-20T11:00:00.000000Z',
              pm2_5: 16.45,
              pm10: 43.21,
              no2: 24.12,
            },
          ],
          2: [
            {
              time: '2024-05-20T10:00:00.000000Z',
              pm2_5: 22.34,
              pm10: 42.56,
              no2: 20.78,
            },
            {
              time: '2024-05-20T11:00:00.000000Z',
              pm2_5: 18.45,
              pm10: 48.21,
              no2: 23.12,
            },
          ],
        };

        // Simulate successful data fetching
        setAllSiteData(fetchedData);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch air quality data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /**
   * Handles the toggling of selected sites.
   */
  const handleToggleSite = useCallback((site) => {
    setSelectedSites((prevSelectedSites) => {
      const isSelected = prevSelectedSites.some((s) => s.id === site.id);
      if (isSelected) {
        // Deselecting the site
        return prevSelectedSites.filter((s) => s.id !== site.id);
      } else {
        // Selecting the site
        return [...prevSelectedSites, site];
      }
    });
  }, []);

  /**
   * Filters and combines data from all selected sites for chart display.
   */
  const chartData = useMemo(() => {
    if (selectedSites.length === 0) return [];

    const combinedData = {};

    selectedSites.forEach((site) => {
      const siteData = allSiteData[site.id] || [];
      siteData.forEach((dataPoint) => {
        if (!combinedData[dataPoint.time]) {
          combinedData[dataPoint.time] = { time: dataPoint.time };
        }
        combinedData[dataPoint.time][site.location] = dataPoint.pm2_5;
      });
    });

    return Object.values(combinedData);
  }, [selectedSites, allSiteData]);

  /**
   * Generates the content for selected sites in the sidebar.
   */
  const selectedSitesContent = useMemo(() => {
    // If no sites are selected and it's not loading, show "No locations selected"
    if (selectedSites?.length === 0 && !loading) {
      return (
        <div className="text-gray-500 w-full text-sm h-auto flex flex-col justify-center items-center">
          <span className="p-2 rounded-full bg-[#F6F6F7] mb-2">
            <LocationIcon width={20} height={20} fill="#9EA3AA" />
          </span>
          No locations selected
        </div>
      );
    }

    // Show loading skeletons if the data is still loading
    if (loading) {
      return (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <LocationCard
              key={index}
              site={{}} // Passing an empty object during loading
              onToggle={handleToggleSite}
              isLoading={loading}
              isSelected={false} // Not selected while loading
            />
          ))}
        </div>
      );
    }

    // Map through the sites once loaded and render them
    return sites.map((site) => (
      <LocationCard
        key={site.id} // Assuming `site.id` is the unique key
        site={site}
        onToggle={handleToggleSite}
        isSelected={selectedSites.some((s) => s.id === site.id)} // Check if the site is selected
        isLoading={loading}
      />
    ));
  }, [selectedSites, handleToggleSite, sites, loading]);

  const handleOpenModal = useCallback(
    (type, ids = []) => {
      dispatch(setOpenModal(true));
      dispatch(setModalType({ type, ids }));
    },
    [dispatch],
  );

  return (
    <>
      {/* Sidebar for Selected Sites */}
      <div className="w-[280px] h-[658px] overflow-y-auto border-r relative space-y-3 px-4 pt-5 pb-14">
        {selectedSitesContent}
        {!loading && (
          <button
            onClick={() => handleOpenModal('moreSights')}
            className="bg-blue-50 w-full rounded-xl px-2 py-4 h-[70px] flex justify-center items-center text-blue-500"
          >
            + Add location
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="bg-white relative w-full h-auto">
        <div className="px-8 pt-6 pb-4 space-y-4 overflow-y-auto">
          {/* Handle Error State */}
          {error && (
            <div className="w-full p-4 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          <div className="w-full flex flex-wrap gap-2 justify-between">
            <div className="space-x-2 flex">
              {/* Frequency Dropdown */}
              <CustomDropdown
                btnText={frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                dropdown
                id="frequency"
                className="left-0"
                isLoading={loading}
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
                  setDateRange({ startDate: start, endDate: end })
                }
                className="left-16 top-11"
                dropdown
                isLoading={loading}
              />

              {/* Chart Type Dropdown */}
              <CustomDropdown
                btnText={chartType.charAt(0).toUpperCase() + chartType.slice(1)}
                id="chartType"
                className="left-0"
                isLoading={loading}
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

            {/* Right Side: Actions */}
            <div className="space-x-2 flex">
              <TabButtons
                btnText="Download Data"
                Icon={<DownloadIcon width={16} height={17} color="white" />}
                onClick={() => null}
                btnStyle="bg-blue-600 text-white border border-blue-600 px-3 py-1 rounded-xl"
                isLoading={loading}
              />
            </div>
          </div>

          {/* Flexible Chart */}
          <div className="w-full h-auto border rounded-xl border-grey-150 p-2">
            {selectedSites.length > 0 ? (
              <MoreInsightsChart
                data={chartData}
                chartType={chartType}
                width="100%"
                height={380}
                id="air-quality-chart"
                pollutionType="pm2_5"
                isLoading={loading}
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

          {/* Air Quality Card */}
          <AirQualityCard
            airQuality="Kampala’s Air Quality has been Good this month compared to last month."
            pollutionSource="Factory, Dusty road"
            pollutant="PM2.5"
            isLoading={loading}
          />
        </div>
      </div>
    </>
  );
};

export { InSightsHeader };
export default MoreInsights;
