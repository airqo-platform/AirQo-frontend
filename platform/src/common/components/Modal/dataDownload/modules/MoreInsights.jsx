import React, { useState, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import LongArrowLeft from '@/icons/Analytics/longArrowLeft';
import LocationIcon from '@/icons/Analytics/LocationIcon';
import LocationCard from '../components/LocationCard';
import DownloadIcon from '@/icons/Analytics/downloadIcon';
import ChartContainer from '../../../Charts/ChartContainer';
import CustomCalendar from '@/components/Calendar/CustomCalendar';
import CheckIcon from '@/icons/tickIcon';
import TabButtons from '@/components/Button/TabButtons';
import CustomDropdown from '@/components/Dropdowns/CustomDropdown';
import { TIME_OPTIONS, CHART_TYPE } from '@/lib/constants';

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

const MoreInsights = () => {
  const [selectedSites, setSelectedSites] = useState([]);
  const [frequency, setFrequency] = useState('Daily');
  const [dateRange, setDateRange] = useState('');
  const [chartType, setChartType] = useState('');

  const handleToggleSite = useCallback((site) => {
    setSelectedSites((prev) => {
      const isSelected = prev.some((s) => s.id === site.id);
      if (isSelected) {
        return prev.filter((s) => s.id !== site.id);
      } else {
        return [...prev, site];
      }
    });
  }, []);

  const selectedSitesContent = useMemo(() => {
    if (selectedSites.length === 0) {
      return (
        <div className="text-gray-500 w-full text-sm h-full flex flex-col justify-center items-center">
          <span className="p-2 rounded-full bg-[#F6F6F7] mb-2">
            <LocationIcon width={20} height={20} fill="#9EA3AA" />
          </span>
          No locations selected
        </div>
      );
    }

    return selectedSites.map((site) => (
      <LocationCard key={site.id} site={site} onToggle={handleToggleSite} />
    ));
  }, [selectedSites, handleToggleSite]);

  return (
    <>
      <div className="w-[280px] h-[658px] overflow-y-auto border-r relative space-y-3 px-4 pt-5 pb-14">
        {selectedSitesContent}
      </div>
      <div className="bg-white relative w-full h-auto">
        <div className="px-8 pt-6 pb-4 space-y-3 overflow-y-auto">
          <div className="w-full flex flex-wrap gap-2 justify-between">
            <div className="space-x-2 flex">
              <CustomDropdown
                btnText={frequency}
                dropdown
                id="days"
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
                    <span className="flex items-center space-x-2">
                      <span>
                        {option.charAt(0).toUpperCase() + option.slice(1)}
                      </span>
                    </span>
                    {frequency === option && <CheckIcon fill={'#145FFF'} />}
                  </span>
                ))}
              </CustomDropdown>

              <CustomCalendar
                initialStartDate={dateRange.startDate}
                initialEndDate={dateRange.endDate}
                className="-left-24 md:left-14 lg:left-[118px] top-11"
                dropdown
              />

              <CustomDropdown
                // tabIcon={<SettingsIcon />}
                btnText="Chart"
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
                    <span className="flex items-center space-x-2">
                      <span>{option.name}</span>
                    </span>
                    {chartType === option.id && <CheckIcon fill={'#145FFF'} />}
                  </span>
                ))}
              </CustomDropdown>
            </div>
            <div className="space-x-2 flex">
              <TabButtons
                btnText="Download Data"
                Icon={<DownloadIcon width={16} height={17} color="white" />}
                onClick={() => null}
                btnStyle={
                  'bg-blue-600 text-white border border-blue-600 px-3 py-1 rounded-xl'
                }
              />
            </div>
          </div>
          <ChartContainer
            chartType="line"
            chartTitle="Air quality over time"
            height={300}
            showTitle={false}
          />
        </div>
      </div>
    </>
  );
};

export { InSightsHeader };
export default MoreInsights;
