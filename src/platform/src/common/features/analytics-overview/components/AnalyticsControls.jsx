import { useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import CustomCalendar from '@/components/Calendar/CustomCalendar';
import CustomDropdown, {
  DropdownItem,
} from '@/components/Button/CustomDropdown';
import ReusableDropdown from '@/components/Button/DownloadDropdown';
import {
  AqPlus,
  AqDownload02,
  AqClockFastForward,
  AqSliders04,
  AqDatabase01,
  AqZap,
} from '@airqo/icons-react';
import { PageHeader } from '@/common/components/Header';
import { TIME_OPTIONS, POLLUTANT_OPTIONS } from '@/lib/constants';
import { setOpenModal, setModalType } from '@/lib/store/services/downloadModal';
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
 * AnalyticsControls component handles all the control elements for analytics overview
 * Including time frame, date range, pollutant selection, and action buttons
 */
const AnalyticsControls = ({
  chartData,
  dateRange,
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

  // Prepare download parameters for confirmation dialog
  const downloadParams = useMemo(() => {
    // Find the pollutant name based on the current selection
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

  // Check if favorites are available for download
  const hasFavorites =
    reduxChartData.chartSites && reduxChartData.chartSites.length > 0;

  return (
    <>
      <div className="w-full flex flex-wrap gap-6 justify-between">
        {/* Page Header */}
        <PageHeader
          title="Quick Access Locations"
          subtitle="Add up to 4 frequently monitored cities for instant access to air quality trends, visualizations, and quick data downloads."
        />

        <div className="flex flex-wrap gap-2">
          {/* Time Frame Dropdown */}
          <CustomDropdown
            icon={
              window.innerWidth < 640 ? (
                <AqClockFastForward size={16} />
              ) : undefined
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
            icon={<AqSliders04 size={16} />}
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
            countValue={reduxChartData.chartSites?.length || 0}
            tooltip={
              hasFavorites
                ? `Download data for ${reduxChartData.chartSites?.length || 0} favorite location(s)`
                : 'No favorite locations available for download'
            }
            showTooltipOnDisabled={false}
            icon={AqDownload02}
            buttonVariant="primary"
            size="md"
            closeOnSelect={true}
          />
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

export default AnalyticsControls;
