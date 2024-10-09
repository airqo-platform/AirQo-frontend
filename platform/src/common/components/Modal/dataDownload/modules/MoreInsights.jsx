import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import DownloadIcon from '@/icons/Analytics/downloadIcon';
import Charts_2 from '@/components/Charts/Charts_2';
import CustomCalendar from '@/components/Calendar/CustomCalendar';
import CheckIcon from '@/icons/tickIcon';
import TabButtons from '@/components/Button/TabButtons';
import CustomDropdown from '@/components/Dropdowns/CustomDropdown';
import { TIME_OPTIONS, CHART_TYPE } from '@/lib/constants';
import AirQualityCard from '../components/AirQualityCard';
import LocationCard from '../components/LocationCard';
import { useDispatch } from 'react-redux';
import { setOpenModal, setModalType } from '@/lib/store/services/downloadModal';

const InSightsHeader = () => (
  <h3
    className="flex text-lg leading-6 font-medium text-gray-900"
    id="modal-title"
  >
    Analytics
  </h3>
);

InSightsHeader.propTypes = {
  onBack: PropTypes.func.isRequired,
};

const MoreInsights = () => {
  const dispatch = useDispatch();
  const [selectedSites, setSelectedSites] = useState([
    { id: 1, location: 'Makerere University', country: 'Uganda' },
    { id: 2, location: 'Nakasero Hill', country: 'Uganda' },
  ]);
  const [frequency, setFrequency] = useState('daily');
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [chartType, setChartType] = useState('line');

  // Sample sites data
  const sites = [
    { id: 1, location: 'Makerere University', country: 'Uganda' },
    { id: 2, location: 'Nakasero Hill', country: 'Uganda' },
  ];

  // Mock data representing air quality data for different locations
  const allSiteData = {
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
  }, [selectedSites]);

  /**
   * Generates the content for selected sites in the sidebar.
   */
  const selectedSitesContent = useMemo(
    () =>
      sites.map((site) => (
        <LocationCard
          key={site.id}
          site={site}
          onToggle={handleToggleSite}
          isSelected={selectedSites.some((s) => s.id === site.id)}
          isLoading={false}
        />
      )),
    [selectedSites, handleToggleSite, sites],
  );

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

        <button
          onClick={() => handleOpenModal('addLocation')}
          className="bg-blue-50 w-full rounded-xl px-2 py-4 h-[70px] flex justify-center items-center text-blue-500"
        >
          + Add location
        </button>
      </div>

      {/* Main Content Area */}
      <div className="bg-white relative w-full h-auto">
        <div className="px-8 pt-6 pb-4 space-y-4 overflow-y-auto">
          <div className="w-full flex flex-wrap gap-2 justify-between">
            <div className="space-x-2 flex">
              {/* Frequency Dropdown */}
              <CustomDropdown
                btnText={frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                dropdown
                id="frequency"
                className="left-0"
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
              />

              {/* Chart Type Dropdown */}
              <CustomDropdown
                btnText={chartType.charAt(0).toUpperCase() + chartType.slice(1)}
                id="chartType"
                className="left-0"
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
              />
            </div>
          </div>

          {/* Flexible Chart */}
          <div className="w-full h-auto border rounded-xl border-grey-150 p-2">
            {selectedSites.length > 0 ? (
              <Charts_2
                data={chartData}
                chartType={chartType}
                width="100%"
                height={380}
                id="air-quality-chart"
                pollutionType="pm2_5"
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
          />
        </div>
      </div>
    </>
  );
};

export { InSightsHeader };
export default MoreInsights;
