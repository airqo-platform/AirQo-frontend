import { useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import CustomCalendar from '@/components/Calendar/CustomCalendar';
import CustomDropdown, {
  DropdownItem,
} from '@/components/Button/CustomDropdown';
import ReusableDropdown from '@/components/Button/DownloadDropdown';
import {
  AqDownload02,
  AqPlus,
  AqSettings04,
  AqClockFastForward,
  AqDatabase01,
  AqZap,
} from '@airqo/icons-react';
import { TIME_OPTIONS, POLLUTANT_OPTIONS } from '@/lib/constants';
import { setOpenModal, setModalType } from '@/lib/store/services/downloadModal';
import { useGetActiveGroup } from '@/app/providers/UnifiedGroupProvider';
import { PageHeader } from '@/common/components/Header';
import useAnalyticsDownload from '../hooks/useAnalyticsDownload';
import DownloadConfirmDialog from './DownloadConfirmDialog';

// Local constants for dropdown options
const DATA_TYPE_OPTIONS = [
  {
    label: 'Calibrated Data',
    value: 'calibrated',
    description: 'Processed and validated data',
    icon: AqDatabase01,
  },
  {
    label: 'Raw Data',
    value: 'raw',
    description: 'Unprocessed sensor readings',
    icon: AqZap,
  },
];

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

  // Local state for download confirmation
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedDownloadType, setSelectedDownloadType] =
    useState('calibrated');

  // Get chart data and preferences from Redux
  const reduxChartData = useSelector((state) => state.chart);
  const preferences = useSelector(
    (state) => state.defaults.individual_preferences?.[0],
  );

  // Use analytics download hook
  const { download, loading: downloadLoading } = useAnalyticsDownload();

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

  // Handle download option selection from dropdown
  const handleDownloadSelect = useCallback((option) => {
    setSelectedDownloadType(option.value);
    setShowConfirmDialog(true);
  }, []);

  // Handle download confirmation
  const handleDownloadConfirm = useCallback(async () => {
    // Get site data for better naming
    const sitesData = preferences?.selected_sites || [];
    await download(selectedDownloadType, sitesData);
    setShowConfirmDialog(false);
  }, [selectedDownloadType, download, preferences]);

  // Close download confirmation dialog
  const handleDownloadCancel = useCallback(() => {
    setShowConfirmDialog(false);
  }, []);

  // Prepare download parameters for confirmation dialog (used by dialog component)
  const favorites =
    preferences?.selected_sites ||
    reduxChartData.chartSites?.map((id, index) => ({
      _id: id,
      name: `Site ${index + 1}`,
    })) ||
    [];

  // Check if favorites are available for download
  const hasFavorites = favorites && favorites.length > 0;

  // Prepare download parameters for confirmation dialog (matched with AnalyticsControls)
  const downloadParams = useMemo(() => {
    const selectedPollutant = POLLUTANT_OPTIONS.find(
      (option) => option.id === chartData.pollutionType,
    );

    return {
      selectedSites:
        preferences?.selected_sites ||
        reduxChartData.chartSites?.map((id, index) => ({
          _id: id,
          name: `Site ${index + 1}`,
        })) ||
        [],
      dataType: selectedDownloadType,
      pollutant: selectedPollutant?.name || 'PM2.5',
      frequency: chartData.timeFrame || 'daily',
      dateRange: {
        startDate: reduxChartData.chartDataRange?.startDate,
        endDate: reduxChartData.chartDataRange?.endDate,
      },
    };
  }, [selectedDownloadType, chartData, reduxChartData, preferences]);

  return (
    <>
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
              icon={
                window.innerWidth < 640 ? <AqClockFastForward /> : undefined
              }
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
              text={
                POLLUTANT_OPTIONS.find(
                  (option) => option.id === chartData.pollutionType,
                )?.name || 'Pollutant'
              }
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
              // tooltipEnabled
              tooltipText="Add up to 4 favorite locations for quick monitoring and visualization"
            />

            {/* Download Data Button */}
            <ReusableDropdown
              options={DATA_TYPE_OPTIONS}
              onSelect={handleDownloadSelect}
              loading={downloadLoading}
              disabled={!hasFavorites}
              buttonText={downloadLoading ? 'Downloading...' : 'Download Data'}
              loadingText="Downloading..."
              showCount={true}
              countValue={favorites?.length || 0}
              tooltip={
                hasFavorites
                  ? `Download data for ${favorites?.length || 0} favorite location(s)`
                  : 'No favorite locations available for download'
              }
              showTooltipOnDisabled={true}
              icon={AqDownload02}
              buttonVariant="primary"
              size="md"
              closeOnSelect={true}
            />
          </div>
        </div>
      </div>

      {/* Download Confirmation Dialog */}
      <DownloadConfirmDialog
        isOpen={showConfirmDialog}
        onClose={handleDownloadCancel}
        onConfirm={handleDownloadConfirm}
        loading={downloadLoading}
        downloadParams={downloadParams}
      />
    </>
  );
};

export default OrganizationAnalyticsControls;
