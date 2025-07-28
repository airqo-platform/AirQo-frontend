import { useDispatch } from 'react-redux';
import { useMediaQuery } from 'react-responsive';
import CustomCalendar from '@/components/Calendar/CustomCalendar';
import CustomDropdown, {
  DropdownItem,
} from '@/components/Button/CustomDropdown';
import Button from '@/components/Button';
import {
  AqPlus,
  AqDownload02,
  AqClockFastForward,
  AqSliders04,
} from '@airqo/icons-react';
import { TIME_OPTIONS, POLLUTANT_OPTIONS } from '@/lib/constants';
import { setOpenModal, setModalType } from '@/lib/store/services/downloadModal';

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

  const handleOpenModal = (type, ids = []) => {
    dispatch(setOpenModal(true));
    dispatch(setModalType({ type, ids }));
  };

  return (
    <div className="w-full flex flex-wrap gap-2 justify-between">
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
          text="Pollutant"
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
          text="Add location"
          icon={<AqPlus width={16} height={16} />}
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
              Icon={AqDownload02}
            >
              Download Data
            </Button>
          }
        />
      </div>
    </div>
  );
};

export default AnalyticsControls;
