import React from 'react';
import { useDispatch } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import CustomCalendar from '@/components/Calendar/CustomCalendar';
import CustomDropdown, {
  DropdownItem,
} from '@/components/Button/CustomDropdown';
import Button from '@/components/Button';
import PlusIcon from '@/icons/map/plusIcon';
import DownloadIcon from '@/icons/Analytics/downloadIcon';
import SettingsIcon from '@/icons/Analytics/SettingsIcon2';
import FrequencyIcon from '@/icons/Analytics/frequencyIcon';
import { TIME_OPTIONS, POLLUTANT_OPTIONS } from '@/lib/constants';
import { setOpenModal, setModalType } from '@/lib/store/services/downloadModal';
import { useGetActiveGroup } from '@/app/providers/UnifiedGroupProvider';

/**
 * OrganizationAnalyticsControls component handles control elements for organization analytics
 * Includes organization header with site information and all filter controls
 */
const OrganizationAnalyticsControls = ({
  organization,
  chartData,
  dateRange,
  hasSites,
  totalSites,
  onlineSites,
  onTimeFrameChange,
  onPollutantChange,
  onDateChange,
}) => {
  const dispatch = useDispatch();
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });
  // Get the active group to display the correct organization name
  const { title: activeGroupTitle } = useGetActiveGroup();

  // Function to format group names for display
  const formatGroupName = (name) => {
    if (!name) return 'Organization';

    return name
      .replace(/[_-]/g, ' ') // Replace underscores and hyphens with spaces
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize first letter of each word
      .join(' ')
      .trim(); // Remove any extra whitespace
  };

  // Use active group title if available, otherwise fallback to organization name
  const displayName = formatGroupName(activeGroupTitle || organization?.name);

  const handleOpenModal = (type, ids = []) => {
    dispatch(setOpenModal(true));
    dispatch(setModalType({ type, ids }));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Organization Header */}
      <div className="flex flex-col gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          <span className="uppercase"> {displayName}</span> - Air Quality
          Insights
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <p className="text-gray-600 dark:text-gray-300">
            Monitor and analyze air quality data for{' '}
            <span className="uppercase"> {displayName}</span>
          </p>
          {hasSites && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Monitoring {totalSites} sites ({onlineSites} online)
            </div>
          )}
        </div>
      </div>

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
                  onClick={() => onTimeFrameChange(option)}
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
            onChange={onDateChange}
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
                  onClick={() => onPollutantChange(option.id)}
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

          {/* Download Data Button */}
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
    </div>
  );
};

export default OrganizationAnalyticsControls;
