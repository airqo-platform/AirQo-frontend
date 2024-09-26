import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import LongArrowLeft from '@/icons/Analytics/longArrowLeft';
import LocationIcon from '@/icons/Analytics/LocationIcon';
import LocationCard from '../components/LocationCard';
import DownloadIcon from '@/icons/Analytics/downloadIcon';
import Charts_2 from '@/components/Charts/Charts_2';
import CustomCalendar from '@/components/Calendar/CustomCalendar';
import CheckIcon from '@/icons/tickIcon';
import TabButtons from '@/components/Button/TabButtons';
import CustomDropdown from '@/components/Dropdowns/CustomDropdown';
import { TIME_OPTIONS, CHART_TYPE } from '@/lib/constants';
import AirQualityCard from '../components/AirQualityCard';

/**
 * InSightsHeader Component
 * Renders the header for the Insights modal with a back button.
 */
const InSightsHeader = ({ onBack }) => (
  <h3
    className="flex text-lg leading-6 font-medium text-gray-900"
    id="modal-title"
  >
    <button type="button" onClick={onBack}>
      <LongArrowLeft className="mr-2" />
    </button>
    Analytics
  </h3>
);

InSightsHeader.propTypes = {
  onBack: PropTypes.func.isRequired,
};

/**
 * MoreInsights Component
 * Renders the insights section with location selection, filters, and charts.
 */
const MoreInsights = () => {
  const [selectedSites, setSelectedSites] = useState([]);
  const [frequency, setFrequency] = useState('daily');
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const [chartType, setChartType] = useState('line');

  // Sample Air Quality Data
  const data = useMemo(
    () => [
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
      {
        time: '2024-05-20T12:00:00.000000Z',
        pm2_5: 14.67,
        pm10: 47.89,
        no2: 26.34,
      },
      {
        time: '2024-05-20T13:00:00.000000Z',
        pm2_5: 18.12,
        pm10: 50.45,
        no2: 28.56,
      },
      {
        time: '2024-05-20T14:00:00.000000Z',
        pm2_5: 20.34,
        pm10: 55.23,
        no2: 30.78,
      },
      {
        time: '2024-05-20T15:00:00.000000Z',
        pm2_5: 22.56,
        pm10: 60.12,
        no2: 32.9,
      },
      {
        time: '2024-05-20T16:00:00.000000Z',
        pm2_5: 19.87,
        pm10: 58.45,
        no2: 31.34,
      },
      {
        time: '2024-05-20T17:00:00.000000Z',
        pm2_5: 17.65,
        pm10: 52.78,
        no2: 29.56,
      },
    ],
    [],
  );

  /**
   * Handles the toggling of selected sites.
   */
  const handleToggleSite = useCallback((site) => {
    setSelectedSites((prev) => {
      const isSelected = prev.some((s) => s.id === site.id);
      return isSelected
        ? prev.filter((s) => s.id !== site.id)
        : [...prev, site];
    });
  }, []);

  /**
   * Generates the content for selected sites.
   */
  const selectedSitesContent = useMemo(() => {
    if (selectedSites.length === 0) {
      return (
        <div className="text-gray-500 w-full text-sm h-full flex flex-col justify-center items-center">
          <span className="p-2 rounded-full bg-[#F6F6F7] mb-2">
            <LocationIcon width={20} height={20} fill="#9EA3AA" />
          </span>
          <span>No locations selected</span>
        </div>
      );
    }

    return selectedSites.map((site) => (
      <LocationCard key={site.id} site={site} onToggle={handleToggleSite} />
    ));
  }, [selectedSites, handleToggleSite]);

  return (
    <>
      {/* Sidebar for Selected Sites */}
      <div className="w-[280px] h-[658px] overflow-y-auto border-r relative space-y-3 px-4 pt-5 pb-14">
        {selectedSitesContent}
      </div>

      {/* Main Content Area */}
      <div className="bg-white relative w-full h-auto">
        <div className="px-8 pt-6 pb-4 space-y-4 overflow-y-auto">
          <div className="w-full flex flex-wrap gap-2 justify-between">
            <div className="space-x-2 flex">
              {/* Frequency Dropdown */}
              <CustomDropdown
                btnText={frequency}
                dropdown
                id="frequency"
                className="left-0"
              >
                {TIME_OPTIONS.map((option) => (
                  <span
                    key={option}
                    onClick={() => setFrequency(option)} // updates the frequency state when an option is selected
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
              <CustomDropdown btnText="Chart" id="chartType" className="left-0">
                {CHART_TYPE.map((option) => (
                  <span
                    key={option.id}
                    onClick={() => setChartType(option.id)} // updates the chartType state when an option is selected
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
            <Charts_2
              data={data}
              chartType={chartType}
              width="100%"
              height={380}
              id="air-quality-chart"
              pollutionType="pm2_5"
            />
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
