import { useDispatch } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import CustomCalendar from '@/components/Calendar/CustomCalendar';
import CustomDropdown, {
  DropdownItem,
} from '@/components/Button/CustomDropdown';
import Button from '@/components/Button';
import {
  AqDownload02,
  AqPlus,
  AqSettings04,
  AqClockFastForward,
} from '@airqo/icons-react';
import { TIME_OPTIONS, POLLUTANT_OPTIONS } from '@/lib/constants';
import { setOpenModal, setModalType } from '@/lib/store/services/downloadModal';
import { useGetActiveGroup } from '@/app/providers/UnifiedGroupProvider';
import { PageHeader } from '@/common/components/Header';

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
      <PageHeader
        title={
          <>
            <span className="uppercase">{displayName}</span> - Air Quality
            Insights
          </>
        }
        subtitle={
          <span>
            Monitor and analyze air quality data for{' '}
            <span className="uppercase">{displayName}</span>
          </span>
        }
        right={
          hasSites ? (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Monitoring {totalSites} sites ({onlineSites} online)
            </div>
          ) : null
        }
      />

      <div className="w-full flex flex-wrap gap-2 justify-between">
        <div className="flex flex-wrap gap-2">
          {/* Time Frame Dropdown */}
          <CustomDropdown
            icon={window.innerWidth < 640 ? <AqClockFastForward /> : undefined}
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
            icon={<AqSettings04 size={16} />}
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
          {/* Add Favorites Button */}
          <CustomDropdown
            text="Manage Favorites"
            icon={<AqPlus width={16} height={16} />}
            iconPosition="left"
            isButton
            onClick={() => handleOpenModal('addFavorites')}
            tooltipEnabled
            tooltipText="Add up to 4 favorite locations for quick monitoring and visualization"
          />

          {/* Download Data Button */}
          <CustomDropdown
            isButton
            trigger={
              <Button
                onClick={() => handleOpenModal('download')}
                Icon={AqDownload02}
              >
                Download Data
              </Button>
            }
            tooltipEnabled
            tooltipText="Download air quality data for any locations across Africa"
          />
        </div>
      </div>
    </div>
  );
};

export default OrganizationAnalyticsControls;
